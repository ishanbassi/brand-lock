import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, from, concatMap, reduce } from 'rxjs';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentClaimResult, AgentDirectoryEntry, AgentPortfolioTrademark } from '../../../models/agent.model';

type ClaimPhase = 'search' | 'browse' | 'claiming' | 'done';

/**
 * Onboarding path that replaces uploading a spreadsheet: the agent searches for their own firm and
 * pulls in the marks already filed under that name.
 *
 * The directory is built from `trademark.agent_name`, which is free-text registry data. One firm
 * routinely appears under several spellings, so the UI is deliberately built around claiming a name
 * at a time and coming back for more — it never tells the agent a single name is their whole
 * portfolio.
 */
@Component({
  selector: 'app-agent-portfolio-claim',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './agent-portfolio-claim.component.html',
  styleUrl: './agent-portfolio-claim.component.scss',
})
export class AgentPortfolioClaimComponent {
  /** Lets the portfolio add dialog reuse the complete onboarding search flow. */
  @Input() embedded = false;
  @Output() completed = new EventEmitter<void>();
  readonly pageSize = 100;

  phase = signal<ClaimPhase>('search');
  searching = signal(false);
  loadingMarks = signal(false);
  errorMessage = signal('');

  query = '';
  agents = signal<AgentDirectoryEntry[]>([]);
  searched = signal(false);

  /**
   * Name variants ticked directly in the search results (keyed by nameNormalized), for claiming
   * several spellings of the same firm in one go instead of opening and claiming each separately.
   */
  selectedAgentNames = signal<Set<string>>(new Set());
  bulkClaiming = signal(false);

  selectedAgent = signal<AgentDirectoryEntry | null>(null);
  marks = signal<AgentPortfolioTrademark[]>([]);
  totalMarks = signal(0);
  page = signal(0);

  /** Ids ticked by the agent. Reset whenever a different agent name is opened. */
  selectedIds = signal<Set<number>>(new Set());

  result = signal<AgentClaimResult | null>(null);

  private readonly search$ = new Subject<string>();

  selectedCount = computed(() => this.selectedIds().size);

  allOnPageSelected = computed(() => {
    const ids = this.selectedIds();
    const rows = this.marks();
    return rows.length > 0 && rows.every(m => m.id != null && ids.has(m.id));
  });

  totalPages = computed(() => Math.ceil(this.totalMarks() / this.pageSize));

  selectedAgentsList = computed(() => this.agents().filter(a => this.selectedAgentNames().has(a.nameNormalized)));

  selectedAgentsMarkTotal = computed(() =>
    this.selectedAgentsList().reduce((sum, a) => sum + (a.markCount ?? 0), 0),
  );

  constructor(
    private readonly agentDataService: AgentDataService,
    private readonly router: Router,
  ) {
    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(q => {
          this.searching.set(true);
          return this.agentDataService.searchAgents(q);
        }),
      )
      .subscribe({
        next: results => {
          this.agents.set(results);
          this.searched.set(true);
          this.searching.set(false);
        },
        error: () => {
          this.errorMessage.set('Could not search agents. Please try again.');
          this.searching.set(false);
        },
      });
  }

  onQueryChange(value: string): void {
    this.query = value;
    this.errorMessage.set('');
    this.selectedAgentNames.set(new Set());
    // Matches the backend's own minimum: a single character matches thousands of firms.
    if (value.trim().length < 2) {
      this.agents.set([]);
      this.searched.set(false);
      return;
    }
    this.search$.next(value.trim());
  }

  toggleAgentSelection(agent: AgentDirectoryEntry, event?: Event): void {
    event?.stopPropagation();
    const next = new Set(this.selectedAgentNames());
    if (next.has(agent.nameNormalized)) {
      next.delete(agent.nameNormalized);
    } else {
      next.add(agent.nameNormalized);
    }
    this.selectedAgentNames.set(next);
  }

  isAgentSelected(agent: AgentDirectoryEntry): boolean {
    return this.selectedAgentNames().has(agent.nameNormalized);
  }

  /** Claims every mark under each ticked name variant, one name at a time, and reports the totals. */
  claimSelectedAgentNames(): void {
    const agents = this.selectedAgentsList();
    if (agents.length === 0 || this.bulkClaiming()) return;
    this.bulkClaiming.set(true);
    this.errorMessage.set('');
    from(agents)
      .pipe(
        concatMap(agent =>
          this.agentDataService.claimTrademarks({ agentName: agent.nameNormalized, claimAllUnderName: true }),
        ),
        reduce<AgentClaimResult, AgentClaimResult>(
          (acc, result) => ({
            claimed: acc.claimed + result.claimed,
            alreadyHeld: acc.alreadyHeld + result.alreadyHeld,
            rejected: acc.rejected + result.rejected,
            autoVerified: acc.autoVerified + result.autoVerified,
            // A running total in the DB, not a per-call amount - the last call's value is current.
            portfolioTotal: result.portfolioTotal,
          }),
          { claimed: 0, alreadyHeld: 0, rejected: 0, autoVerified: 0, portfolioTotal: 0 },
        ),
      )
      .subscribe({
        next: aggregated => {
          this.result.set(aggregated);
          this.phase.set('done');
          this.bulkClaiming.set(false);
          this.selectedAgentNames.set(new Set());
        },
        error: err => {
          this.errorMessage.set(err?.error?.message || 'Could not add these marks. Please try again.');
          this.bulkClaiming.set(false);
        },
      });
  }

  openAgent(agent: AgentDirectoryEntry): void {
    this.selectedAgent.set(agent);
    this.selectedIds.set(new Set());
    this.selectedAgentNames.set(new Set());
    this.page.set(0);
    this.phase.set('browse');
    this.loadMarks();
  }

  loadMarks(): void {
    const agent = this.selectedAgent();
    if (!agent) return;
    this.loadingMarks.set(true);
    this.agentDataService.discoverTrademarks(agent.nameNormalized, this.page(), this.pageSize).subscribe({
      next: response => {
        this.marks.set(response.body ?? []);
        this.totalMarks.set(Number(response.headers.get('X-Total-Count') ?? 0));
        this.loadingMarks.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load trademarks for this agent.');
        this.loadingMarks.set(false);
      },
    });
  }

  goToPage(next: number): void {
    if (next < 0 || next >= this.totalPages()) return;
    this.page.set(next);
    this.loadMarks();
  }

  toggle(id: number | undefined): void {
    if (id == null) return;
    const next = new Set(this.selectedIds());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.selectedIds.set(next);
  }

  isSelected(id: number | undefined): boolean {
    return id != null && this.selectedIds().has(id);
  }

  toggleAllOnPage(): void {
    const next = new Set(this.selectedIds());
    const shouldSelect = !this.allOnPageSelected();
    for (const mark of this.marks()) {
      if (mark.id == null) continue;
      if (shouldSelect) {
        next.add(mark.id);
      } else {
        next.delete(mark.id);
      }
    }
    this.selectedIds.set(next);
  }

  claimSelected(): void {
    const agent = this.selectedAgent();
    if (!agent || this.selectedCount() === 0) return;
    this.submitClaim({
      agentName: agent.nameNormalized,
      trademarkIds: Array.from(this.selectedIds()),
    });
  }

  /** For large firms, where ticking every box across many pages is not realistic. */
  claimAll(): void {
    const agent = this.selectedAgent();
    if (!agent) return;
    this.submitClaim({ agentName: agent.nameNormalized, claimAllUnderName: true });
  }

  private submitClaim(request: { agentName: string; trademarkIds?: number[]; claimAllUnderName?: boolean }): void {
    this.phase.set('claiming');
    this.agentDataService.claimTrademarks(request).subscribe({
      next: result => {
        this.result.set(result);
        this.phase.set('done');
      },
      error: err => {
        this.errorMessage.set(err?.error?.message || 'Could not add these marks. Please try again.');
        this.phase.set('browse');
      },
    });
  }

  /** Back to search so the agent can claim another spelling variant of their firm. */
  claimAnotherName(): void {
    this.phase.set('search');
    this.selectedAgent.set(null);
    this.selectedIds.set(new Set());
    this.selectedAgentNames.set(new Set());
    this.marks.set([]);
    this.result.set(null);
    this.query = '';
    this.agents.set([]);
    this.searched.set(false);
  }

  goToPortfolio(): void {
    if (this.embedded) {
      this.completed.emit();
      return;
    }
    this.router.navigate(['/agent-portal/portfolio']);
  }

  backToSearch(): void {
    this.phase.set('search');
    this.selectedAgent.set(null);
  }
}

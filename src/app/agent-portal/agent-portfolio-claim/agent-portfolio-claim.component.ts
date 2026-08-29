import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
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
  readonly pageSize = 100;

  phase = signal<ClaimPhase>('search');
  searching = signal(false);
  loadingMarks = signal(false);
  errorMessage = signal('');

  query = '';
  agents = signal<AgentDirectoryEntry[]>([]);
  searched = signal(false);

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
    // Matches the backend's own minimum: a single character matches thousands of firms.
    if (value.trim().length < 2) {
      this.agents.set([]);
      this.searched.set(false);
      return;
    }
    this.search$.next(value.trim());
  }

  openAgent(agent: AgentDirectoryEntry): void {
    this.selectedAgent.set(agent);
    this.selectedIds.set(new Set());
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
    this.marks.set([]);
    this.result.set(null);
    this.query = '';
    this.agents.set([]);
    this.searched.set(false);
  }

  goToPortfolio(): void {
    this.router.navigate(['/agent-portal/portfolio']);
  }

  backToSearch(): void {
    this.phase.set('search');
    this.selectedAgent.set(null);
  }
}

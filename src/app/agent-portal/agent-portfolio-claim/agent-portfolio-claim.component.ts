import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, from, concatMap, reduce } from 'rxjs';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentClaimResult, AgentDirectoryEntry } from '../../../models/agent.model';

type ClaimPhase = 'search' | 'done';

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
  phase = signal<ClaimPhase>('search');
  searching = signal(false);
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

  result = signal<AgentClaimResult | null>(null);

  private readonly search$ = new Subject<string>();

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

  /** Back to search so the agent can claim another spelling variant of their firm. */
  claimAnotherName(): void {
    this.phase.set('search');
    this.selectedAgentNames.set(new Set());
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

}

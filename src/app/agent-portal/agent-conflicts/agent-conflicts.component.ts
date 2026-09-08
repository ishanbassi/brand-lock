import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { WatchConflictHistory } from '../../../models/agent.model';

type RiskFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
type StatusFilter = 'OPEN' | 'OPPOSING' | 'DISMISSED';

/**
 * The portfolio-wide conflicts screen — the "see all" target of the watch digest email.
 *
 * <p>It now shows hits from two watches: marks advertised in a journal issue (`journalNo` set,
 * open to opposition for four months from that issue) and newly filed applications the register
 * has just published (`journalNo` null — early awareness, no deadline yet). Only a journal hit can
 * be turned into an opposition deadline.
 */
@Component({
  selector: 'app-agent-conflicts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agent-conflicts.component.html',
  styleUrl: './agent-conflicts.component.scss',
})
export class AgentConflictsComponent implements OnInit {
  conflicts = signal<WatchConflictHistory[]>([]);
  loading = signal(true);
  error = signal('');
  riskFilter = signal<RiskFilter>('ALL');
  statusFilter = signal<StatusFilter>('OPEN');

  /** Row currently being acted on, so its buttons can be disabled. */
  busyId = signal<number | null>(null);
  actionMsg = signal('');
  /**
   * Kept apart from {@link error}, which means "the page could not load" and hides the table.
   * A failed dismiss must not blank the list the agent is working through.
   */
  actionError = signal('');

  private readonly statusOf = (c: WatchConflictHistory): StatusFilter => {
    const s = (c.status ?? 'OPEN').toUpperCase();
    return s === 'OPPOSING' || s === 'DISMISSED' ? (s as StatusFilter) : 'OPEN';
  };

  /** Rows at the selected triage status — the population the risk chips then filter. */
  private atStatus = computed(() => this.conflicts().filter(c => this.statusOf(c) === this.statusFilter()));

  visible = computed(() => {
    const risk = this.riskFilter();
    const rows = this.atStatus();
    return risk === 'ALL' ? rows : rows.filter(c => c.riskLevel === risk);
  });

  openCount = computed(() => this.conflicts().filter(c => this.statusOf(c) === 'OPEN').length);
  opposingCount = computed(() => this.conflicts().filter(c => this.statusOf(c) === 'OPPOSING').length);
  dismissedCount = computed(() => this.conflicts().filter(c => this.statusOf(c) === 'DISMISSED').length);

  atStatusLength = computed(() => this.atStatus().length);
  highRiskCount = computed(() => this.atStatus().filter(c => c.riskLevel === 'HIGH').length);
  mediumRiskCount = computed(() => this.atStatus().filter(c => c.riskLevel === 'MEDIUM').length);
  lowRiskCount = computed(() => this.atStatus().filter(c => c.riskLevel === 'LOW').length);

  constructor(private readonly agentDataService: AgentDataService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.agentDataService.getAllConflicts().subscribe({
      next: (data) => {
        this.conflicts.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load conflicts.');
        this.loading.set(false);
      },
    });
  }

  setRiskFilter(f: RiskFilter): void {
    this.riskFilter.set(f);
  }

  setStatusFilter(f: StatusFilter): void {
    this.statusFilter.set(f);
    this.riskFilter.set('ALL');
  }

  isNewFiling(c: WatchConflictHistory): boolean {
    return c.journalNo == null;
  }

  scorePercent(score?: number): number {
    return Math.round((score ?? 0) * 100);
  }

  riskClass(level?: string): string {
    return level === 'HIGH' ? 'risk-high' : level === 'MEDIUM' ? 'risk-medium' : 'risk-low';
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  dismiss(c: WatchConflictHistory): void {
    this.mutate(c, () => this.agentDataService.setConflictStatus(c.id!, 'DISMISSED'), () => {
      c.status = 'DISMISSED';
      this.actionMsg.set('Conflict dismissed.');
    });
  }

  restore(c: WatchConflictHistory): void {
    this.mutate(c, () => this.agentDataService.setConflictStatus(c.id!, 'OPEN'), () => {
      c.status = 'OPEN';
      this.actionMsg.set('Conflict reopened.');
    });
  }

  oppose(c: WatchConflictHistory): void {
    if (c.journalNo == null || this.busyId() != null) {
      return;
    }
    this.busyId.set(c.id!);
    this.actionMsg.set('');
    this.actionError.set('');
    this.agentDataService.opposeConflict(c.id!).subscribe({
      next: (deadline) => {
        c.status = 'OPPOSING';
        this.busyId.set(null);
        this.conflicts.set([...this.conflicts()]);
        this.actionMsg.set(
          `Opposition deadline added${deadline?.dueDate ? ` — due ${deadline.dueDate}` : ''}. See it on your Deadlines calendar.`,
        );
      },
      error: (err) => {
        this.busyId.set(null);
        // The server explains why a hit cannot be opposed — no journal advertisement yet, or the
        // issue's publication date has not been ingested. Both are worth showing verbatim.
        this.actionError.set(err?.error?.detail || err?.error?.title || 'Could not raise the opposition deadline.');
      },
    });
  }

  private mutate(
    c: WatchConflictHistory,
    call: () => Observable<unknown>,
    onOk: () => void,
  ): void {
    if (this.busyId() != null) {
      return;
    }
    this.busyId.set(c.id!);
    this.actionMsg.set('');
    this.actionError.set('');
    call().subscribe({
      next: () => {
        onOk();
        this.busyId.set(null);
        this.conflicts.set([...this.conflicts()]);
      },
      error: (err) => {
        this.busyId.set(null);
        this.actionError.set(err?.error?.detail || 'That action did not go through. Try again.');
      },
    });
  }
}

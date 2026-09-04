import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentJournalConflict, AgentJournalWatchResult } from '../../../models/agent.model';

/**
 * Trademark Watch — checks the agent's portfolio against a published journal issue.
 *
 * Every issue of the Trade Marks Journal advertises marks that are open to opposition for four
 * months. This screen is how a firm finds anything close to a client's mark inside that window,
 * which is the whole reason the opposition period exists.
 */
@Component({
  selector: 'app-agent-journal-watch',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './agent-journal-watch.component.html',
  styleUrl: './agent-journal-watch.component.scss',
})
export class AgentJournalWatchComponent implements OnInit {
  journals = signal<number[]>([]);
  loadingJournals = signal(true);
  selectedJournal = signal<number | null>(null);

  running = signal(false);
  result = signal<AgentJournalWatchResult | null>(null);
  error = signal('');

  /** Risk filter. Empty shows everything. */
  riskFilter = signal<'' | 'HIGH' | 'MEDIUM' | 'LOW'>('');

  constructor(
    private readonly agentDataService: AgentDataService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    // The watch alert email links straight to the issue it is about, so arriving with a journalNo
    // means the agent has already chosen — select it and run without a second click.
    const requested = Number(this.route.snapshot.queryParamMap.get('journalNo'));
    const deepLinked = Number.isFinite(requested) && requested > 0 ? requested : null;

    this.agentDataService.getWatchJournals().subscribe({
      next: list => {
        this.journals.set(list);
        // Newest issue is the one with an opposition window still open, so it is the default.
        if (deepLinked != null && list.includes(deepLinked)) {
          this.selectedJournal.set(deepLinked);
          this.loadingJournals.set(false);
          this.run();
          return;
        }
        if (list.length > 0) this.selectedJournal.set(list[0]);
        this.loadingJournals.set(false);
      },
      error: () => {
        this.error.set('Could not load journal issues.');
        this.loadingJournals.set(false);
      },
    });
  }

  visibleConflicts = computed<AgentJournalConflict[]>(() => {
    const all = this.result()?.conflicts ?? [];
    const filter = this.riskFilter();
    return filter ? all.filter(c => c.riskLevel === filter) : all;
  });

  counts = computed(() => {
    const all = this.result()?.conflicts ?? [];
    return {
      total: all.length,
      high: all.filter(c => c.riskLevel === 'HIGH').length,
      medium: all.filter(c => c.riskLevel === 'MEDIUM').length,
      low: all.filter(c => c.riskLevel === 'LOW').length,
    };
  });

  run(): void {
    const journal = this.selectedJournal();
    if (journal == null || this.running()) return;
    this.running.set(true);
    this.error.set('');
    this.result.set(null);
    this.agentDataService.runJournalWatch(journal).subscribe({
      next: res => {
        this.result.set(res);
        this.running.set(false);
      },
      error: () => {
        this.error.set('The check could not be completed. Please try again.');
        this.running.set(false);
      },
    });
  }

  setRiskFilter(level: '' | 'HIGH' | 'MEDIUM' | 'LOW'): void {
    this.riskFilter.set(level);
  }

  scorePercent(score: number): number {
    return Math.round(score * 100);
  }
}

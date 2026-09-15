import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentJournalConflict, AgentJournalWatchResult } from '../../../models/agent.model';
import { ExportFormat, ExportMenuComponent } from '../ui/export-menu.component';
import { saveBlob } from '../ui/save-blob';

/** Descriptions longer than this are clamped until the agent asks for the rest. */
const DESCRIPTION_PREVIEW_CHARS = 160;

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
  imports: [CommonModule, FormsModule, RouterModule, ExportMenuComponent],
  templateUrl: './agent-journal-watch.component.html',
  styleUrl: './agent-journal-watch.component.scss',
})
export class AgentJournalWatchComponent implements OnInit {
  journals = signal<number[]>([]);
  loadingJournals = signal(true);
  selectedJournal = signal<number | null>(null);

  /** All 45 Nice classes. None selected means every class — the default. */
  readonly allClasses = Array.from({ length: 45 }, (_, i) => i + 1);
  selectedClasses = signal<number[]>([]);
  classPickerOpen = signal(false);

  running = signal(false);
  exporting = signal<ExportFormat | null>(null);

  /** Cards whose goods/services text is shown in full. */
  private expanded = signal<Set<string>>(new Set());
  result = signal<AgentJournalWatchResult | null>(null);
  error = signal('');

  /** The classes the shown result was actually run with — so the PDF matches the list on screen. */
  private ranWithClasses: number[] = [];

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

  classSummary = computed(() => {
    const n = this.selectedClasses().length;
    if (n === 0) return 'All classes';
    if (n === 1) return `Class ${this.selectedClasses()[0]}`;
    return `${n} classes`;
  });

  toggleClass(n: number): void {
    this.selectedClasses.update(list =>
      list.includes(n) ? list.filter(c => c !== n) : [...list, n].sort((a, b) => a - b),
    );
  }

  clearClasses(): void {
    this.selectedClasses.set([]);
  }

  run(): void {
    const journal = this.selectedJournal();
    if (journal == null || this.running()) return;
    this.running.set(true);
    this.classPickerOpen.set(false);
    this.error.set('');
    this.result.set(null);
    const classes = [...this.selectedClasses()];
    this.agentDataService.runJournalWatch(journal, classes).subscribe({
      next: res => {
        this.result.set(res);
        this.ranWithClasses = classes;
        this.running.set(false);
      },
      error: () => {
        this.error.set('The check could not be completed. Please try again.');
        this.running.set(false);
      },
    });
  }

  /** Downloads the run on screen — same issue, same classes — as Excel or PDF. */
  export(format: ExportFormat): void {
    const journal = this.result()?.journalNo;
    if (journal == null || this.exporting()) return;
    this.exporting.set(format);
    const request = format === 'excel'
      ? this.agentDataService.downloadWatchReportExcel(journal, this.ranWithClasses)
      : this.agentDataService.downloadWatchReport(journal, this.ranWithClasses);
    request.subscribe({
      next: blob => {
        saveBlob(blob, `watch-report-journal-${journal}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
        this.exporting.set(null);
      },
      error: () => {
        this.error.set(`Could not generate the ${format === 'excel' ? 'Excel file' : 'PDF'}.`);
        this.exporting.set(null);
      },
    });
  }

  // ── Goods / services descriptions ────────────────────────────────────────

  private cardKey(c: AgentJournalConflict): string {
    return `${c.portfolioTrademarkId}-${c.conflictingTrademarkId}`;
  }

  isLong(text: string | undefined): boolean {
    return (text?.length ?? 0) > DESCRIPTION_PREVIEW_CHARS;
  }

  isExpanded(c: AgentJournalConflict): boolean {
    return this.expanded().has(this.cardKey(c));
  }

  /** One toggle per card opens both descriptions together — they are read side by side. */
  toggleExpanded(c: AgentJournalConflict): void {
    const key = this.cardKey(c);
    this.expanded.update(set => {
      const next = new Set(set);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  setRiskFilter(level: '' | 'HIGH' | 'MEDIUM' | 'LOW'): void {
    this.riskFilter.set(level);
  }

  scorePercent(score: number): number {
    return Math.round(score * 100);
  }
}

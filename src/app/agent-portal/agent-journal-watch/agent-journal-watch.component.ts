import { Component, HostListener, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentJournalConflict, AgentJournalSummary, AgentJournalWatchResult } from '../../../models/agent.model';
import { ExportFormat, ExportMenuComponent } from '../ui/export-menu.component';
import { saveBlob } from '../ui/save-blob';
import { printReport } from '../ui/print-report';
import { IconComponent } from '../ui/icon.component';
import { TrademarkService } from '../../shared/services/trademark.service';
import { ITrademark } from '../../../models/trademark.model';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { AgentPageSkeletonComponent } from '../ui/agent-page-skeleton.component';
import { BillingService } from '../../shared/services/billing.service';

type JournalSearchField = 'name' | 'agentName' | 'proprietorName' | 'applicationNo';

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
  imports: [CommonModule, FormsModule, RouterModule, ExportMenuComponent, IconComponent, AgentPageSkeletonComponent],
  templateUrl: './agent-journal-watch.component.html',
  styleUrl: './agent-journal-watch.component.scss',
})
export class AgentJournalWatchComponent implements OnInit, OnDestroy {
  journals = signal<number[]>([]);
  journalSummaries = signal<AgentJournalSummary[]>([]);
  loadingJournals = signal(true);
  selectedJournal = signal<number | null>(null);
  /** The issue in the URL, retained while the issue list is still loading. */
  requestedJournal = signal<number | null>(null);

  readonly searchFields: { value: JournalSearchField; label: string; placeholder: string }[] = [
    { value: 'name', label: 'Trademark', placeholder: 'Search trademark name' },
    { value: 'agentName', label: 'Agent', placeholder: 'Search agent name' },
    { value: 'proprietorName', label: 'Party', placeholder: 'Search party name' },
    { value: 'applicationNo', label: 'Application no.', placeholder: 'Enter application number' },
  ];
  searchField = signal<JournalSearchField>('name');
  searchTerm = '';
  portfolioOnly = signal(false);
  portfolioLinks = signal<Record<string, number>>({});
  journalMarks = signal<ITrademark[]>([]);
  artworkUrls = signal<Record<number, string>>({});
  artworkFailures = signal<Set<number>>(new Set());
  browsing = signal(false);
  browseError = signal('');
  browsePage = signal(1);
  browseTotal = signal(0);
  readonly browsePageSize = 20;
  private readonly searchChanges = new Subject<void>();
  private searchSubscription?: Subscription;
  private routeSubscription?: Subscription;
  private watchPollTimer?: ReturnType<typeof setTimeout>;
  private journalsLoaded = false;
  private browseRequestId = 0;
  private historyRequestId = 0;

  /** All 45 Nice classes. None selected means every class — the default. */
  readonly allClasses = Array.from({ length: 45 }, (_, i) => i + 1);
  selectedClasses = signal<number[]>([]);
  classPickerOpen = signal(false);

  running = signal(false);
  exporting = signal<ExportFormat | null>(null);
  printing = signal(false);
  readonly selectedConflicts = new Map<string, AgentJournalConflict>();
  private selectedConflictKeys = signal<Set<string>>(new Set());
  private firmName = 'Trademarx';
  private accentColor = '#1f4e79';
  private logoUrl: string | null = null;

  /** Cards whose goods/services text is shown in full. */
  private expanded = signal<Set<string>>(new Set());
  result = signal<AgentJournalWatchResult | null>(null);
  showingConflicts = signal(false);
  error = signal('');

  /** The classes the shown result was actually run with — so the PDF matches the list on screen. */
  private ranWithClasses: number[] = [];

  /** Risk filter. Empty shows everything. */
  riskFilter = signal<'' | 'HIGH' | 'MEDIUM' | 'LOW'>('');
  readonly watchPageSize = 20;

  constructor(
    private readonly agentDataService: AgentDataService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly trademarkService: TrademarkService,
    private readonly billing: BillingService,
  ) {}

  ngOnDestroy(): void {
    this.clearWatchPolling();
    this.browseRequestId++;
    this.historyRequestId++;
    if (this.logoUrl) URL.revokeObjectURL(this.logoUrl);
    this.clearArtwork();
    this.searchSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  closeClassPickerOnOutsideClick(event: MouseEvent): void {
    const target = event.target;
    if (target instanceof Element && !target.closest('.class-control')) this.classPickerOpen.set(false);
  }

  ngOnInit(): void {
    this.agentDataService.getProfile().subscribe({
      next: profile => {
        const branding = profile as typeof profile & { firmDisplayName?: string; reportAccentColor?: string };
        this.firmName = branding.firmDisplayName || profile.companyName || 'Trademarx';
        if (branding.reportAccentColor && /^#?[\da-f]{6}$/i.test(branding.reportAccentColor)) {
          this.accentColor = branding.reportAccentColor.startsWith('#') ? branding.reportAccentColor : `#${branding.reportAccentColor}`;
        }
        this.agentDataService.getLogo().subscribe({ next: blob => this.logoUrl = URL.createObjectURL(blob) });
      },
    });
    // The watch alert email links straight to the issue it is about, so arriving with a journalNo
    // means the agent has already chosen — select it and run without a second click.
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const journalNo = this.parseJournalNo(params.get('journalNo'));
      this.requestedJournal.set(journalNo);
      if (this.journalsLoaded) this.syncWorkspaceWithRoute(journalNo);
    });

    this.searchSubscription = this.searchChanges.pipe(debounceTime(300)).subscribe(() => this.handleSearchInput());

    // Wait for the plan snapshot before resolving a deep link. That keeps a Free user from
    // briefly opening a historical issue while the lock state is still loading.
    this.billing.loadState().subscribe({
      next: () => this.loadJournalSummaries(),
      error: () => this.loadJournalSummaries(),
    });
  }

  private loadJournalSummaries(): void {
    this.agentDataService.getJournalSummaries(2000).subscribe({
      next: summaries => this.finishLoadingJournals(summaries),
      // The list-only endpoint keeps the screen usable while an older API deployment catches up.
      error: () => this.agentDataService.getWatchJournals(2000).subscribe({
        next: journalNos => this.finishLoadingJournals(journalNos.map(journalNo => ({ journalNo, recordCount: 0 }))),
        error: () => {
          this.error.set('Could not load journal issues.');
          this.loadingJournals.set(false);
        },
      }),
    });
  }

  private finishLoadingJournals(summaries: AgentJournalSummary[]): void {
    const list = summaries.map(summary => summary.journalNo);
    this.journalSummaries.set(summaries);
    this.journals.set(list);
    this.journalsLoaded = true;
    const journalFromPath = this.requestedJournal();
    const legacyJournal = this.parseJournalNo(this.route.snapshot.queryParamMap.get('journalNo'));
    // Newest issue is the one with an opposition window still open, so it is the default.
    if (journalFromPath != null && list.includes(journalFromPath)) {
      this.loadingJournals.set(false);
      this.openJournalWorkspace(journalFromPath, this.route.snapshot.queryParamMap.get('run') === '1');
      return;
    }
    if (legacyJournal != null && list.includes(legacyJournal)) {
      void this.router.navigate(['/agent-portal/watch/journal', legacyJournal], {
        queryParams: { run: '1' },
        replaceUrl: true,
      });
      return;
    }
    this.loadingJournals.set(false);
  }

  visibleConflicts = computed<AgentJournalConflict[]>(() => {
    const result = this.result();
    const conflicts = result?.conflicts ?? [];
    const riskLevel = this.riskFilter();
    // Durable run pages are filtered on the server. Saved history has no run id, so filter it here.
    return !riskLevel || result?.runId ? conflicts : conflicts.filter(conflict => conflict.riskLevel === riskLevel);
  });
  allVisibleConflictsSelected = computed(() => {
    const conflicts = this.visibleConflicts();
    const selected = this.selectedConflictKeys();
    return conflicts.length > 0 && conflicts.every(conflict => selected.has(this.cardKey(conflict)));
  });
  watchProcessing = computed(() => ['QUEUED', 'RUNNING'].includes(this.result()?.status ?? ''));

  searchPlaceholder = computed(() =>
    this.searchFields.find(field => field.value === this.searchField())?.placeholder ?? 'Search this journal',
  );
  browsePages = computed(() => Math.max(1, Math.ceil(this.browseTotal() / this.browsePageSize)));

  selectJournal(journalNo: number): void {
    if (this.running()) return;
    if (this.isJournalLocked(journalNo)) {
      this.showJournalUpgrade();
      return;
    }
    void this.router.navigate(['/agent-portal/watch/journal', journalNo]);
  }

  isJournalLocked(journalNo: number): boolean {
    const latest = this.journals()[0];
    return latest != null && journalNo !== latest && this.billing.state()?.effectivePlanCode === 'FREE';
  }

  private syncWorkspaceWithRoute(journalNo: number | null): void {
    if (journalNo != null && this.journals().includes(journalNo)) {
      if (this.isJournalLocked(journalNo)) {
        this.showJournalUpgrade();
        void this.router.navigate(['/agent-portal/watch/journal'], { replaceUrl: true });
        return;
      }
      if (this.selectedJournal() !== journalNo) {
        this.openJournalWorkspace(journalNo, this.route.snapshot.queryParamMap.get('run') === '1');
      }
      return;
    }
    if (journalNo == null) this.resetWorkspace();
  }

  private openJournalWorkspace(journalNo: number, runWatch = false): void {
    this.clearWatchPolling();
    this.running.set(false);
    this.historyRequestId++;
    this.selectedJournal.set(journalNo);
    this.result.set(null);
    this.showingConflicts.set(false);
    this.riskFilter.set('');
    this.clearConflictSelection();
    this.browsePage.set(1);
    this.loadJournalEntries();
    this.loadSavedWatch(journalNo);
    if (runWatch) this.run();
  }

  private resetWorkspace(): void {
    this.clearWatchPolling();
    this.browseRequestId++;
    this.historyRequestId++;
    this.running.set(false);
    this.selectedJournal.set(null);
    this.result.set(null);
    this.showingConflicts.set(false);
    this.riskFilter.set('');
    this.journalMarks.set([]);
    this.browseTotal.set(0);
    this.clearConflictSelection();
    this.clearArtwork();
  }

  backToJournals(): void {
    void this.router.navigate(['/agent-portal/watch/journal']);
  }

  private parseJournalNo(value: string | null): number | null {
    const journalNo = Number(value);
    return Number.isInteger(journalNo) && journalNo > 0 ? journalNo : null;
  }

  private showJournalUpgrade(): void {
    this.billing.openUpgrade({
      feature: 'JOURNAL_HISTORY',
      planCode: this.billing.state()?.effectivePlanCode ?? 'FREE',
      limit: 1,
      used: null,
      detail: 'Free includes the latest Trade Marks Journal issue. Upgrade to Pro to browse and watch every earlier issue.',
    });
  }

  setSearchField(field: JournalSearchField): void {
    if (field === this.searchField()) return;
    this.searchField.set(field);
    if (this.searchTerm.trim()) {
      this.portfolioOnly.set(false);
      this.browsePage.set(1);
      this.showingConflicts.set(false);
      this.loadJournalEntries();
    }
  }

  onSearchChange(): void {
    this.searchChanges.next();
  }

  findMyPublishedMarks(): void {
    this.portfolioOnly.set(true);
    this.searchTerm = '';
    this.browsePage.set(1);
    this.showingConflicts.set(false);
    this.loadJournalEntries();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.browsePage.set(1);
    this.showingConflicts.set(false);
    this.loadJournalEntries();
  }

  markRoute(mark: ITrademark): (string | number)[] {
    const portfolioId = mark.applicationNo ? this.portfolioLinks()[String(mark.applicationNo)] : undefined;
    return portfolioId
      ? ['/agent-portal/portfolio', portfolioId]
      : ['/agent-portal/watch/journal/marks', mark.id!];
  }

  clearAllFilters(): void {
    this.portfolioOnly.set(false);
    this.searchTerm = '';
    this.browsePage.set(1);
    this.showingConflicts.set(false);
    this.loadJournalEntries();
  }

  goToBrowsePage(page: number): void {
    if (page < 1 || page > this.browsePages() || page === this.browsePage()) return;
    this.browsePage.set(page);
    this.loadJournalEntries();
  }

  private loadJournalEntries(): void {
    const journalNo = this.selectedJournal();
    if (journalNo == null) return;
    const requestId = ++this.browseRequestId;
    this.browsing.set(true);
    this.browseError.set('');
    this.clearArtwork();
    this.journalMarks.set([]);
    this.browseTotal.set(0);
    if (this.portfolioOnly()) {
      this.agentDataService.getPortfolioPublications(journalNo, this.browsePage() - 1, this.browsePageSize).subscribe({
        next: response => {
          if (!this.isCurrentBrowseRequest(journalNo, requestId)) return;
          const marks = response.body ?? [];
          this.journalMarks.set(marks);
          this.loadArtwork(marks, requestId);
          this.resolvePortfolioLinks(marks, () => this.browsing.set(false), requestId);
          this.browseTotal.set(Number(response.headers.get('X-Total-Count')) || 0);
        },
        error: () => {
          if (!this.isCurrentBrowseRequest(journalNo, requestId)) return;
          this.journalMarks.set([]);
          this.browseError.set('Could not find portfolio marks in this journal. Please try again.');
          this.browsing.set(false);
        },
      });
      return;
    }

    const req: Record<string, string | number | string[]> = {
      page: this.browsePage() - 1,
      size: this.browsePageSize,
      sort: 'applicationNo,desc',
    };
    if (this.selectedClasses().length) req['tmClass.in'] = this.selectedClasses().map(String);
    const term = this.searchTerm.trim();
    if (term) {
      if (this.searchField() === 'applicationNo') {
        if (!/^\d+$/.test(term)) {
          this.journalMarks.set([]);
          this.browseTotal.set(0);
          this.browseError.set('Application number must contain digits only.');
          this.browsing.set(false);
          return;
        }
        req['applicationNo.equals'] = term;
      } else {
        req[`${this.searchField()}.contains`] = term;
      }
    }
    this.trademarkService.queryByJournal(journalNo, req).subscribe({
      next: response => {
        if (!this.isCurrentBrowseRequest(journalNo, requestId)) return;
        const marks = response.body ?? [];
        this.journalMarks.set(marks);
        this.loadArtwork(marks, requestId);
        this.resolvePortfolioLinks(marks, () => this.browsing.set(false), requestId);
        this.browseTotal.set(Number(response.headers.get('X-Total-Count')) || 0);
      },
      error: () => {
        if (!this.isCurrentBrowseRequest(journalNo, requestId)) return;
        this.journalMarks.set([]);
        this.browseError.set('Could not load this journal. Please try again.');
        this.browsing.set(false);
      },
    });
  }

  private isCurrentBrowseRequest(journalNo: number, requestId: number): boolean {
    return this.selectedJournal() === journalNo && this.browseRequestId === requestId;
  }

  /** Restores the scheduler/manual-run read model without starting another expensive comparison. */
  private loadSavedWatch(journalNo: number): void {
    const requestId = ++this.historyRequestId;
    this.agentDataService.getJournalWatchHistory(journalNo).subscribe({
      next: conflicts => {
        // Navigation or a manual run may have changed the visible issue while this request was in flight.
        if (this.historyRequestId !== requestId || this.selectedJournal() !== journalNo || this.running() || conflicts.length === 0) return;
        this.result.set({
          status: 'COMPLETED',
          journalNo,
          pairsScored: 0,
          conflicts,
          totalConflicts: conflicts.length,
          page: 0,
          size: conflicts.length,
          totalPages: 1,
          countsByRisk: {
            HIGH: conflicts.filter(conflict => conflict.riskLevel === 'HIGH').length,
            MEDIUM: conflicts.filter(conflict => conflict.riskLevel === 'MEDIUM').length,
            LOW: conflicts.filter(conflict => conflict.riskLevel === 'LOW').length,
          },
          truncated: false,
          durationMs: 0,
        });
        this.showingConflicts.set(true);
      },
      // A journal with no saved run is a normal first-use state; retain the journal browser.
      error: () => undefined,
    });
  }

  private resolvePortfolioLinks(marks: ITrademark[], settled: () => void, requestId: number): void {
    const applicationNos = [...new Set(marks.map(mark => mark.applicationNo).filter((value): value is number => value != null))];
    if (!applicationNos.length) {
      this.portfolioLinks.set({});
      settled();
      return;
    }
    this.agentDataService.getPortfolioLinks(applicationNos).subscribe({
      next: links => {
        if (requestId !== this.browseRequestId) return;
        this.portfolioLinks.set(links);
        settled();
      },
      error: () => {
        if (requestId !== this.browseRequestId) return;
        this.portfolioLinks.set({});
        settled();
      },
    });
  }

  /** Uses the authenticated artwork endpoint; absent or failed images fall back to initials. */
  artworkUrl(mark: ITrademark): string | null {
    return mark.id == null ? null : this.artworkUrls()[mark.id] ?? null;
  }

  artworkFailed(mark: ITrademark): boolean {
    return mark.id != null && this.artworkFailures().has(mark.id);
  }

  markMonogram(value?: string | null): string {
    const parts = (value ?? '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'TM';
    return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
  }

  private loadArtwork(marks: ITrademark[], requestId: number): void {
    for (const mark of marks) {
      if (mark.id == null || !mark.imgUrl) continue;
      const markId = mark.id;
      this.agentDataService.getTrademarkArtwork(markId).subscribe({
        next: blob => {
          if (requestId !== this.browseRequestId || !this.journalMarks().some(current => current.id === markId && current.imgUrl)) return;
          const url = URL.createObjectURL(blob);
          this.artworkUrls.update(urls => ({ ...urls, [markId]: url }));
        },
        error: () => {
          if (requestId === this.browseRequestId) this.artworkFailures.update(failures => new Set(failures).add(markId));
        },
      });
    }
  }

  private clearArtwork(): void {
    Object.values(this.artworkUrls()).forEach(url => URL.revokeObjectURL(url));
    this.artworkUrls.set({});
    this.artworkFailures.set(new Set());
  }

  private handleSearchInput(): void {
    if (this.searchTerm.trim()) this.portfolioOnly.set(false);
    this.browsePage.set(1);
    this.showingConflicts.set(false);
    this.loadJournalEntries();
  }

  counts = computed(() => {
    const current = this.result();
    return {
      total: current?.totalConflicts ?? 0,
      high: current?.countsByRisk?.HIGH ?? 0,
      medium: current?.countsByRisk?.MEDIUM ?? 0,
      low: current?.countsByRisk?.LOW ?? 0,
    };
  });

  allConflictCount = computed(() => Object.values(this.result()?.countsByRisk ?? {})
    .reduce((total, count) => total + count, 0));

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
    this.portfolioOnly.set(false);
    this.browsePage.set(1);
    this.showingConflicts.set(false);
    this.loadJournalEntries();
  }

  clearClasses(): void {
    this.selectedClasses.set([]);
    this.portfolioOnly.set(false);
    this.browsePage.set(1);
    this.showingConflicts.set(false);
    this.loadJournalEntries();
  }

  run(): void {
    const journal = this.selectedJournal();
    if (journal == null || this.running()) return;
    this.clearWatchPolling();
    this.running.set(true);
    this.classPickerOpen.set(false);
    this.error.set('');
    this.result.set(null);
    this.riskFilter.set('');
    this.historyRequestId++;
    this.clearConflictSelection();
    const classes = [...this.selectedClasses()];
    this.ranWithClasses = classes;
    this.agentDataService.startJournalWatchRun(journal, classes).subscribe({
      next: result => {
        if (this.selectedJournal() === journal) this.receiveWatchResult(result);
      },
      error: () => {
        if (this.selectedJournal() !== journal) return;
        this.error.set('The check could not be started. Please try again.');
        this.running.set(false);
      },
    });
  }

  goToWatchPage(page: number): void {
    const current = this.result();
    if (!current || page < 0 || page >= current.totalPages || page === current.page || this.running()) return;
    this.loadWatchPage(page);
  }

  private loadWatchPage(page: number): void {
    const runId = this.result()?.runId;
    if (runId == null) return;
    this.running.set(true);
    this.error.set('');
    this.agentDataService.getJournalWatchRun(runId, page, this.watchPageSize, this.riskFilter() || undefined).subscribe({
      next: result => this.receiveWatchResult(result),
      error: () => {
        this.error.set('Could not load this page of watch results. Please try again.');
        this.running.set(false);
      },
    });
  }

  private receiveWatchResult(result: AgentJournalWatchResult): void {
    if (this.selectedJournal() !== result.journalNo) return;
    this.result.set(result);
    this.showingConflicts.set(true);
    this.running.set(false);
    this.clearWatchPolling();
    if (result.status === 'QUEUED' || result.status === 'RUNNING') {
      this.watchPollTimer = setTimeout(() => this.refreshWatchProgress(), 1500);
    }
  }

  private refreshWatchProgress(): void {
    const current = this.result();
    if (current?.runId == null || !this.watchProcessing()) return;
    this.agentDataService.getJournalWatchRun(
      current.runId,
      current.page,
      this.watchPageSize,
      this.riskFilter() || undefined,
    ).subscribe({
      next: result => this.receiveWatchResult(result),
      error: () => {
        this.error.set('Could not refresh watch progress. Retrying shortly.');
        this.watchPollTimer = setTimeout(() => this.refreshWatchProgress(), 3000);
      },
    });
  }

  retryWatchRun(): void {
    const runId = this.result()?.runId;
    if (runId == null) return;
    this.error.set('');
    this.running.set(true);
    this.agentDataService.retryJournalWatchRun(runId).subscribe({
      next: () => this.agentDataService.getJournalWatchRun(runId, 0, this.watchPageSize, this.riskFilter() || undefined).subscribe({
        next: result => this.receiveWatchResult(result),
        error: () => {
          this.error.set('The watch restarted, but its progress could not be loaded yet.');
          this.running.set(false);
        },
      }),
      error: () => {
        this.error.set('Could not restart the watch. Please start a new check.');
        this.running.set(false);
      },
    });
  }

  private clearWatchPolling(): void {
    if (this.watchPollTimer !== undefined) {
      clearTimeout(this.watchPollTimer);
      this.watchPollTimer = undefined;
    }
  }

  /** Downloads the run on screen — same issue, same classes — as Excel or PDF. */
  export(format: ExportFormat): void {
    const journal = this.result()?.journalNo;
    if (journal == null || this.exporting() || this.printing()) return;
    if (this.watchProcessing()) {
      this.error.set('Wait for the watch to finish before exporting its complete results.');
      return;
    }
    if (format === 'pdf') {
      const selected = [...this.selectedConflicts.values()];
      if (!selected.length) {
        this.error.set('Select at least one conflict to print.');
        return;
      }
      this.printing.set(true);
      printReport(this.printHtml(journal, selected)).catch(() => this.error.set('Could not prepare the print view. Please try again.'))
        .finally(() => this.printing.set(false));
      return;
    }

    this.exporting.set(format);
    const request = this.agentDataService.downloadWatchReportExcel(journal, this.ranWithClasses);
    request.subscribe({
      next: blob => {
        saveBlob(blob, `watch-report-journal-${journal}.xlsx`);
        this.exporting.set(null);
      },
      error: () => {
        this.error.set('Could not generate the Excel file.');
        this.exporting.set(null);
      },
    });
  }

  isConflictSelected(conflict: AgentJournalConflict): boolean {
    return this.selectedConflictKeys().has(this.cardKey(conflict));
  }

  toggleConflictSelection(conflict: AgentJournalConflict): void {
    const key = this.cardKey(conflict);
    this.selectedConflicts.has(key) ? this.selectedConflicts.delete(key) : this.selectedConflicts.set(key, conflict);
    this.syncSelectedConflictKeys();
  }

  toggleAllVisibleConflicts(selected: boolean): void {
    for (const conflict of this.visibleConflicts()) {
      const key = this.cardKey(conflict);
      selected ? this.selectedConflicts.set(key, conflict) : this.selectedConflicts.delete(key);
    }
    this.syncSelectedConflictKeys();
  }

  private clearConflictSelection(): void {
    this.selectedConflicts.clear();
    this.syncSelectedConflictKeys();
  }

  private syncSelectedConflictKeys(): void {
    this.selectedConflictKeys.set(new Set(this.selectedConflicts.keys()));
  }

  private printHtml(journal: number, conflicts: AgentJournalConflict[]): string {
    const esc = (value: unknown) => String(value ?? '—').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
    const cards = conflicts.map(c => `<article class="conflict risk-${c.riskLevel.toLowerCase()}">
      <div class="score"><strong>${Math.round(c.score * 100)}%</strong><span>${esc(c.riskLevel)} risk</span></div>
      <section><small>Your mark</small><h2>${esc(c.portfolioTrademarkName)}</h2><p>Application ${esc(c.portfolioApplicationNo)} · Class ${esc(c.portfolioTmClass)}</p><h3>Goods / services</h3><p>${esc(c.portfolioDetails || 'No description on record.')}</p></section>
      <section><small>Advertised in Journal ${journal}</small><h2>${esc(c.conflictingTrademarkName)}</h2><p>Application ${esc(c.conflictingApplicationNo)} · Class ${esc(c.conflictingTmClass)} · ${esc(c.conflictingProprietorName)}</p><h3>Goods / services</h3><p>${esc(c.conflictingDetails || 'No description on record.')}</p></section>
      ${c.conflictingImgUrl ? `<img class="mark-image" src="${esc(c.conflictingImgUrl)}" alt="">` : ''}</article>`).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><title>Journal ${journal} watch report</title><style>
      @page{size:A4 portrait;margin:14mm 12mm}*{box-sizing:border-box}body{font:10pt Arial,sans-serif;color:#202a36;margin:0}
      header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid ${this.accentColor};padding-bottom:10px;margin-bottom:18px}
      h1{font-size:20pt;margin:0 0 4px}.firm{color:${this.accentColor};font-size:15pt;font-weight:bold;display:flex;align-items:center;gap:10px}.logo{max-width:100px;max-height:44px;object-fit:contain}
      .conflict{display:grid;grid-template-columns:55px 1fr 1fr;gap:12px;border:1px solid #d8dde4;border-left:4px solid #87909d;padding:12px;margin-bottom:12px;break-inside:avoid;page-break-inside:avoid}
      .risk-high{border-left-color:#a12b2b}.risk-medium{border-left-color:#895600}.score{display:flex;flex-direction:column;align-items:center;justify-content:center}.score strong{font-size:14pt}.score span,small{font-size:8pt;color:#596575}
      h2{font-size:12pt;margin:4px 0}h3{font-size:8pt;text-transform:uppercase;margin:10px 0 3px;color:#596575}p{margin:3px 0;line-height:1.45;overflow-wrap:anywhere}.mark-image{grid-column:2 / 4;max-width:90px;max-height:60px;object-fit:contain}
      footer{margin-top:12px;border-top:1px solid #d8dde4;padding-top:7px;color:#596575;font-size:8pt}
      </style></head><body><header><div><h1>Trademark Watch Report</h1><div>Journal ${journal} · ${conflicts.length} selected conflict${conflicts.length===1?'':'s'}${this.ranWithClasses.length?` · Classes ${this.ranWithClasses.join(', ')}`:' · All classes'}</div></div><div class="firm">${this.logoUrl?`<img class="logo" src="${esc(this.logoUrl)}" alt="">`:''}${esc(this.firmName)}</div></header>
      ${cards}<footer>Generated ${esc(new Date().toLocaleDateString('en-IN'))}. Review the journal and Registry record before taking action.</footer></body></html>`;
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
    if (level === this.riskFilter()) return;
    this.riskFilter.set(level);
    if (this.result()?.runId != null) {
      this.showingConflicts.set(true);
      this.loadWatchPage(0);
    }
  }

  showJournalEntries(): void {
    this.showingConflicts.set(false);
    this.riskFilter.set('');
  }

  scorePercent(score: number): number {
    return Math.round(score * 100);
  }
}

import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentNewFiling, NewFilingWatchRun, WatchConflictHistory } from '../../../models/agent.model';
import { IconComponent } from '../ui/icon.component';

type RiskFilter = '' | 'HIGH' | 'MEDIUM' | 'LOW';
type StatusFilter = 'OPEN' | 'OPPOSING' | 'DISMISSED';
type ConflictSearchField = 'name' | 'agentName' | 'proprietorName' | 'applicationNo';
type FilingWindowDays = 7 | 15 | 30;
type FilingPageSize = 20 | 50 | 100;

/** The portfolio-wide worklist, deliberately sharing the Journal Watch interaction model. */
@Component({
  selector: 'app-agent-conflicts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent],
  templateUrl: './agent-conflicts.component.html',
  styleUrl: './agent-conflicts.component.scss',
})
export class AgentConflictsComponent implements OnInit, OnDestroy {
  readonly allClasses = Array.from({ length: 45 }, (_, index) => index + 1);
  readonly searchFields: { value: ConflictSearchField; label: string; placeholder: string }[] = [
    { value: 'name', label: 'Trademark', placeholder: 'Search trademark name' },
    { value: 'agentName', label: 'Agent', placeholder: 'Search agent name' },
    { value: 'proprietorName', label: 'Party', placeholder: 'Search party name' },
    { value: 'applicationNo', label: 'Application No.', placeholder: 'Enter application number' },
  ];
  readonly filingWindows: { value: FilingWindowDays; label: string }[] = [
    { value: 7, label: 'Last 7 days' },
    { value: 15, label: 'Last 15 days' },
    { value: 30, label: 'Last 30 days' },
  ];
  readonly pageSizes: FilingPageSize[] = [20, 50, 100];

  conflicts = signal<WatchConflictHistory[]>([]);
  filings = signal<AgentNewFiling[]>([]);
  view = signal<'FILINGS' | 'CONFLICTS'>('FILINGS');
  readonly artworkUrls = signal<Record<number, string>>({});
  readonly artworkFailures = signal<Set<number>>(new Set());
  loading = signal(true);
  running = signal(false);
  error = signal('');
  actionMsg = signal('');
  actionError = signal('');
  busyId = signal<number | null>(null);
  searchField = signal<ConflictSearchField>('name');
  searchTerm = signal('');
  classFilter = signal<number | null>(null);
  riskFilter = signal<RiskFilter>('');
  portfolioOnly = signal(false);
  filingWindowDays = signal<FilingWindowDays>(7);
  page = signal(1);
  pageSize = signal<FilingPageSize>(20);
  private pollTimer?: ReturnType<typeof setTimeout>;

  readonly statusOf = (conflict: WatchConflictHistory): StatusFilter => {
    const status = (conflict.status ?? 'OPEN').toUpperCase();
    return status === 'OPPOSING' || status === 'DISMISSED' ? status : 'OPEN';
  };

  readonly searchPlaceholder = computed(() =>
    this.searchFields.find(field => field.value === this.searchField())?.placeholder ?? 'Search conflicts',
  );
  readonly scopedConflicts = computed(() => this.conflicts()
    .filter(conflict => {
      if (!this.isNewFiling(conflict)) return false;
      if (this.classFilter() !== null && conflict.conflictingTmClass !== this.classFilter()) return false;
      if (this.portfolioOnly() && !conflict.trademarkId) return false;
      return this.matchesSearch(conflict);
    })
    // Application date and number are the registry's filing chronology. Watch check time can be
    // much later for a backfill, so it must not determine the default new-filings order.
    .sort((left, right) => this.compareByFilingOrder(left, right)));
  readonly filtered = computed(() => {
    const risk = this.riskFilter();
    const conflicts = this.scopedConflicts();
    return risk === '' ? conflicts : conflicts.filter(conflict => conflict.riskLevel === risk);
  });
  readonly filteredCount = computed(() => this.filtered().length);
  readonly pagedConflicts = computed(() => this.filtered().slice((this.page() - 1) * this.pageSize(), this.page() * this.pageSize()));
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredCount() / this.pageSize())));
  readonly pageStart = computed(() => this.filteredCount() ? (this.page() - 1) * this.pageSize() + 1 : 0);
  readonly pageEnd = computed(() => Math.min(this.page() * this.pageSize(), this.filteredCount()));
  readonly scopedCount = computed(() => this.scopedConflicts().length);
  readonly highRiskCount = computed(() => this.scopedConflicts().filter(conflict => conflict.riskLevel === 'HIGH').length);
  readonly mediumRiskCount = computed(() => this.scopedConflicts().filter(conflict => conflict.riskLevel === 'MEDIUM').length);
  readonly lowRiskCount = computed(() => this.scopedConflicts().filter(conflict => conflict.riskLevel === 'LOW').length);
  readonly filteredFilings = computed(() => this.filings().filter(filing =>
    (this.classFilter() === null || filing.tmClass === this.classFilter()) && this.matchesFiling(filing),
  ));
  readonly pagedFilings = computed(() => this.filteredFilings().slice((this.page() - 1) * this.pageSize(), this.page() * this.pageSize()));
  readonly activeCount = computed(() => this.view() === 'FILINGS' ? this.filteredFilings().length : this.filteredCount());
  readonly activeTotalPages = computed(() => Math.max(1, Math.ceil(this.activeCount() / this.pageSize())));
  readonly activePageStart = computed(() => this.activeCount() ? (this.page() - 1) * this.pageSize() + 1 : 0);
  readonly activePageEnd = computed(() => Math.min(this.page() * this.pageSize(), this.activeCount()));

  constructor(private readonly agentDataService: AgentDataService) {}

  ngOnInit(): void { this.load(); }

  ngOnDestroy(): void {
    if (this.pollTimer) clearTimeout(this.pollTimer);
    Object.values(this.artworkUrls()).forEach(url => URL.revokeObjectURL(url));
  }

  load(showLoading = true): void {
    if (showLoading) this.loading.set(true);
    this.error.set('');
    forkJoin({
      conflicts: this.agentDataService.getAllConflicts(),
      filings: this.agentDataService.getLatestNewFilings(this.filingWindowDays()),
    }).subscribe({
      next: ({ conflicts, filings }) => {
        this.conflicts.set(conflicts);
        this.filings.set(filings);
        conflicts.forEach(conflict => this.loadArtwork(conflict.conflictingTrademarkId, conflict.conflictingImgUrl));
        filings.filter(filing => this.isImageMark(filing)).forEach(filing => this.loadArtwork(filing.id, filing.imgUrl));
        this.ensurePageInRange();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load conflicts. Please try again.');
        this.loading.set(false);
      },
    });
  }

  setSearchField(field: ConflictSearchField): void { this.searchField.set(field); this.resetPage(); }
  setSearchTerm(term: string): void { this.searchTerm.set(term); this.resetPage(); }
  clearSearch(): void { this.searchTerm.set(''); this.resetPage(); }
  setClassFilter(classNo: number | null): void { this.classFilter.set(classNo); this.resetPage(); }
  setRiskFilter(risk: RiskFilter): void { this.riskFilter.set(risk); this.resetPage(); }
  togglePortfolioOnly(): void { this.portfolioOnly.update(value => !value); this.resetPage(); }
  setFilingWindow(days: FilingWindowDays): void {
    if (days === this.filingWindowDays()) return;
    this.filingWindowDays.set(days);
    this.resetPage();
    this.load();
  }
  onPageSizeChange(size: number): void {
    if (![20, 50, 100].includes(size)) return;
    this.pageSize.set(size as FilingPageSize);
    this.resetPage();
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.activeTotalPages() || page === this.page()) return;
    this.page.set(page);
  }

  isNewFiling(conflict: WatchConflictHistory): boolean { return conflict.journalNo == null; }
  scorePercent(score?: number): number { return Math.round((score ?? 0) * 100); }

  run(): void {
    if (this.running()) return;
    this.running.set(true);
    this.actionMsg.set('');
    this.actionError.set('');
    this.agentDataService.runNewFilingConflictWatch().subscribe({
      next: run => this.pollRun(run),
      error: error => {
        this.running.set(false);
        this.actionError.set(error?.error?.detail || 'The conflict watch could not be run. Please try again.');
      },
    });
  }

  private pollRun(run: NewFilingWatchRun): void {
    if (run.status === 'COMPLETED') {
      this.actionMsg.set(`Conflict watch completed. ${run.matchesFound} new filing match${run.matchesFound === 1 ? '' : 'es'} found.`);
      this.view.set('CONFLICTS');
      this.running.set(false);
      this.load(false);
      return;
    }
    if (run.status === 'FAILED') {
      this.running.set(false);
      this.actionError.set(run.errorMessage || 'The conflict watch could not be run. Please try again.');
      return;
    }

    this.actionMsg.set('Checking your portfolio against current new filings…');
    this.pollTimer = setTimeout(() => {
      this.agentDataService.getNewFilingConflictWatchRun(run.runId).subscribe({
        next: nextRun => this.pollRun(nextRun),
        error: error => {
          this.running.set(false);
          this.actionError.set(error?.error?.detail || 'Could not check the watch status. Please try again.');
        },
      });
    }, 1000);
  }

  dismiss(conflict: WatchConflictHistory): void {
    this.mutate(conflict, () => this.agentDataService.setConflictStatus(conflict.id!, 'DISMISSED'), () => {
      conflict.status = 'DISMISSED';
      this.actionMsg.set('Conflict dismissed.');
    });
  }

  restore(conflict: WatchConflictHistory): void {
    this.mutate(conflict, () => this.agentDataService.setConflictStatus(conflict.id!, 'OPEN'), () => {
      conflict.status = 'OPEN';
      this.actionMsg.set('Conflict reopened.');
    });
  }

  oppose(conflict: WatchConflictHistory): void {
    if (this.isNewFiling(conflict) || this.busyId() !== null) return;
    this.busyId.set(conflict.id!);
    this.actionMsg.set('');
    this.actionError.set('');
    this.agentDataService.opposeConflict(conflict.id!).subscribe({
      next: deadline => {
        conflict.status = 'OPPOSING';
        this.busyId.set(null);
        this.conflicts.set([...this.conflicts()]);
        this.actionMsg.set(`Opposition deadline added${deadline?.dueDate ? ` — due ${deadline.dueDate}` : ''}. See it on your Deadlines calendar.`);
      },
      error: error => {
        this.busyId.set(null);
        this.actionError.set(error?.error?.detail || error?.error?.title || 'Could not raise the opposition deadline.');
      },
    });
  }

  private matchesSearch(conflict: WatchConflictHistory): boolean {
    const term = this.searchTerm().trim().toLocaleLowerCase();
    if (!term) return true;
    switch (this.searchField()) {
      case 'agentName': return (conflict.conflictingAgentName ?? '').toLocaleLowerCase().includes(term);
      case 'applicationNo': return String(conflict.conflictingApplicationNo ?? '').includes(term);
      case 'proprietorName': return (conflict.conflictingProprietorName ?? '').toLocaleLowerCase().includes(term);
      default: return (conflict.conflictingTrademarkName ?? '').toLocaleLowerCase().includes(term);
    }
  }

  private matchesFiling(filing: AgentNewFiling): boolean {
    const term = this.searchTerm().trim().toLocaleLowerCase();
    if (!term) return true;
    switch (this.searchField()) {
      case 'applicationNo': return String(filing.applicationNo ?? '').includes(term);
      case 'proprietorName': return (filing.proprietorName ?? '').toLocaleLowerCase().includes(term);
      case 'agentName': return false;
      default: return (filing.name ?? '').toLocaleLowerCase().includes(term);
    }
  }

  markMonogram(value?: string | null): string {
    const parts = (value ?? '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'TM';
    return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[1][0]).toUpperCase();
  }

  artworkUrl(id?: number): string | null { return id == null ? null : this.artworkUrls()[id] ?? null; }
  isImageMark(filing: AgentNewFiling): boolean { return filing.type === 'IMAGEMARK' || filing.type === 'TRADEMARK_WITH_IMAGE'; }
  filingArtworkUrl(filing: AgentNewFiling): string | null { return this.isImageMark(filing) ? this.artworkUrl(filing.id) : null; }

  private loadArtwork(id?: number, imgUrl?: string | null): void {
    if (id == null || !imgUrl || this.artworkUrls()[id] || this.artworkFailures().has(id)) return;
    this.agentDataService.getTrademarkArtwork(id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        this.artworkUrls.update(urls => ({ ...urls, [id]: url }));
      },
      error: () => this.artworkFailures.update(failures => new Set(failures).add(id)),
    });
  }

  private compareByFilingOrder(left: WatchConflictHistory, right: WatchConflictHistory): number {
    const dateOrder = this.dateValue(right.conflictingApplicationDate) - this.dateValue(left.conflictingApplicationDate);
    if (dateOrder !== 0) return dateOrder;

    const applicationOrder = (right.conflictingApplicationNo ?? -1) - (left.conflictingApplicationNo ?? -1);
    if (applicationOrder !== 0) return applicationOrder;

    return this.dateValue(right.checkDate) - this.dateValue(left.checkDate);
  }

  private dateValue(date?: string): number { return date ? Date.parse(date) || 0 : 0; }

  private resetPage(): void { this.page.set(1); }
  private ensurePageInRange(): void { if (this.page() > this.activeTotalPages()) this.page.set(this.activeTotalPages()); }

  private mutate(conflict: WatchConflictHistory, call: () => Observable<unknown>, onOk: () => void): void {
    if (this.busyId() !== null) return;
    this.busyId.set(conflict.id!);
    this.actionMsg.set('');
    this.actionError.set('');
    call().subscribe({
      next: () => {
        onOk();
        this.busyId.set(null);
        this.conflicts.set([...this.conflicts()]);
      },
      error: error => {
        this.busyId.set(null);
        this.actionError.set(error?.error?.detail || 'That action did not go through. Try again.');
      },
    });
  }
}

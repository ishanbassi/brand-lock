import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { WatchConflictHistory } from '../../../models/agent.model';
import { IconComponent } from '../ui/icon.component';

type RiskFilter = '' | 'HIGH' | 'MEDIUM' | 'LOW';
type StatusFilter = 'OPEN' | 'OPPOSING' | 'DISMISSED';
type SourceFilter = 'NEW' | 'JOURNAL' | 'ALL';
type ConflictSearchField = 'name' | 'agentName' | 'proprietorName' | 'applicationNo';

/** The portfolio-wide worklist, deliberately sharing the Journal Watch interaction model. */
@Component({
  selector: 'app-agent-conflicts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent],
  templateUrl: './agent-conflicts.component.html',
  styleUrl: './agent-conflicts.component.scss',
})
export class AgentConflictsComponent implements OnInit {
  readonly allClasses = Array.from({ length: 45 }, (_, index) => index + 1);
  readonly searchFields: { value: ConflictSearchField; label: string; placeholder: string }[] = [
    { value: 'name', label: 'Trademark', placeholder: 'Search trademark name' },
    { value: 'agentName', label: 'Agent', placeholder: 'Search agent name' },
    { value: 'proprietorName', label: 'Party', placeholder: 'Search party name' },
    { value: 'applicationNo', label: 'Application No.', placeholder: 'Enter application number' },
  ];
  readonly pageSize = 20;

  conflicts = signal<WatchConflictHistory[]>([]);
  loading = signal(true);
  running = signal(false);
  error = signal('');
  actionMsg = signal('');
  actionError = signal('');
  busyId = signal<number | null>(null);
  searchField = signal<ConflictSearchField>('name');
  searchTerm = '';
  sourceFilter = signal<SourceFilter>('NEW');
  classFilter = signal<number | null>(null);
  riskFilter = signal<RiskFilter>('');
  portfolioOnly = signal(false);
  page = signal(1);

  readonly statusOf = (conflict: WatchConflictHistory): StatusFilter => {
    const status = (conflict.status ?? 'OPEN').toUpperCase();
    return status === 'OPPOSING' || status === 'DISMISSED' ? status : 'OPEN';
  };

  readonly searchPlaceholder = computed(() =>
    this.searchFields.find(field => field.value === this.searchField())?.placeholder ?? 'Search conflicts',
  );
  readonly scopedConflicts = computed(() => this.conflicts()
    .filter(conflict => {
      if (this.sourceFilter() === 'NEW' && !this.isNewFiling(conflict)) return false;
      if (this.sourceFilter() === 'JOURNAL' && this.isNewFiling(conflict)) return false;
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
  readonly pagedConflicts = computed(() => this.filtered().slice((this.page() - 1) * this.pageSize, this.page() * this.pageSize));
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredCount() / this.pageSize)));
  readonly pageStart = computed(() => this.filteredCount() ? (this.page() - 1) * this.pageSize + 1 : 0);
  readonly pageEnd = computed(() => Math.min(this.page() * this.pageSize, this.filteredCount()));
  readonly scopedCount = computed(() => this.scopedConflicts().length);
  readonly highRiskCount = computed(() => this.scopedConflicts().filter(conflict => conflict.riskLevel === 'HIGH').length);
  readonly mediumRiskCount = computed(() => this.scopedConflicts().filter(conflict => conflict.riskLevel === 'MEDIUM').length);
  readonly lowRiskCount = computed(() => this.scopedConflicts().filter(conflict => conflict.riskLevel === 'LOW').length);
  readonly sourceLabel = computed(() => this.sourceFilter() === 'NEW' ? 'New filings' : this.sourceFilter() === 'JOURNAL' ? 'Journal advertisements' : 'All sources');

  constructor(private readonly agentDataService: AgentDataService) {}

  ngOnInit(): void { this.load(); }

  load(showLoading = true): void {
    if (showLoading) this.loading.set(true);
    this.error.set('');
    this.agentDataService.getAllConflicts().subscribe({
      next: conflicts => {
        this.conflicts.set(conflicts);
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
  onSearchChange(): void { this.resetPage(); }
  clearSearch(): void { this.searchTerm = ''; this.resetPage(); }
  setSourceFilter(source: SourceFilter): void { this.sourceFilter.set(source); this.resetPage(); }
  setClassFilter(classNo: number | null): void { this.classFilter.set(classNo); this.resetPage(); }
  setRiskFilter(risk: RiskFilter): void { this.riskFilter.set(risk); this.resetPage(); }
  togglePortfolioOnly(): void { this.portfolioOnly.update(value => !value); this.resetPage(); }
  toggleHighConflicts(): void { this.setRiskFilter(this.riskFilter() === 'HIGH' ? '' : 'HIGH'); }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.page()) return;
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
      next: () => {
        this.actionMsg.set('Conflict watch completed. Your new filing matches are up to date.');
        this.running.set(false);
        this.load(false);
      },
      error: error => {
        this.running.set(false);
        this.actionError.set(error?.error?.detail || 'The conflict watch could not be run. Please try again.');
      },
    });
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
    const term = this.searchTerm.trim().toLocaleLowerCase();
    if (!term) return true;
    switch (this.searchField()) {
      case 'agentName': return (conflict.conflictingAgentName ?? '').toLocaleLowerCase().includes(term);
      case 'applicationNo': return String(conflict.conflictingApplicationNo ?? '').includes(term);
      case 'proprietorName': return (conflict.conflictingProprietorName ?? '').toLocaleLowerCase().includes(term);
      default: return (conflict.conflictingTrademarkName ?? '').toLocaleLowerCase().includes(term);
    }
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
  private ensurePageInRange(): void { if (this.page() > this.totalPages()) this.page.set(this.totalPages()); }

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

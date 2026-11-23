import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import dayjs from 'dayjs';
import { forkJoin } from 'rxjs';
import { AgentPortfolioTrademark, Deadline } from '../../../models/agent.model';
import { AgentDataService, OVERDUE_RENEWAL_LOOKBACK_DAYS } from '../../shared/services/agent-data.service';
import { ExportFormat, ExportMenuComponent } from '../ui/export-menu.component';
import { printReport } from '../ui/print-report';
import { saveBlob } from '../ui/save-blob';

type RenewalScope = 'renewals' | 'renewals-upcoming' | 'renewals-overdue';
type MilestoneFilter = 'all' | 'overdue' | 'urgent' | 'upcoming';
type SortOrder = 'due' | 'grace' | 'application' | 'fee';

interface RenewalRecord extends Deadline {
  proprietorName?: string;
}

/**
 * The renewal docket intentionally owns its own state and markup. Hearings use different facts
 * and actions, so sharing a calendar component made both screens harder to read and change.
 */
@Component({
  selector: 'app-agent-renewals',
  standalone: true,
  imports: [CommonModule, ExportMenuComponent],
  templateUrl: './agent-renewals.component.html',
  styleUrl: './agent-renewals.component.scss',
})
export class AgentRenewalsComponent implements OnInit {
  private readonly agentData = inject(AgentDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly scope = (this.route.snapshot.data['scope'] as RenewalScope) ?? 'renewals';
  readonly isOverdueScope = this.scope === 'renewals-overdue';
  readonly today = dayjs().format('YYYY-MM-DD');

  readonly renewals = signal<RenewalRecord[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly search = signal('');
  readonly milestone = signal<MilestoneFilter>(this.isOverdueScope ? 'overdue' : 'all');
  readonly classFilter = signal('all');
  readonly clientFilter = signal('all');
  readonly sort = signal<SortOrder>('due');
  readonly selected = signal<Set<string>>(new Set());
  readonly page = signal(1);
  readonly pageSize = signal<5 | 10 | 25 | 50>(10);
  readonly exporting = signal<ExportFormat | null>(null);
  readonly dateFrom = signal('');
  readonly dateTo = signal('');
  readonly appliedDateRange = signal<{ from: string; to: string } | null>(null);

  readonly classes = computed(() => [...new Set(this.renewals().map(item => item.tmClass).filter((value): value is number => value != null))].sort((a, b) => a - b));
  readonly clients = computed(() => [...new Set(this.renewals().map(item => item.proprietorName).filter((value): value is string => !!value))].sort((a, b) => a.localeCompare(b)));

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const selectedClass = this.classFilter();
    const selectedClient = this.clientFilter();
    const milestone = this.milestone();
    const range = this.appliedDateRange();

    const rows = this.renewals().filter(item => {
      const haystack = [item.trademarkName, item.applicationNo, item.tmClass ? `class ${item.tmClass}` : '', item.proprietorName, item.title, item.notes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (term && !haystack.includes(term)) return false;
      if (selectedClass !== 'all' && String(item.tmClass) !== selectedClass) return false;
      if (selectedClient !== 'all' && item.proprietorName !== selectedClient) return false;
      if (range && (item.dueDate < range.from || item.dueDate > range.to)) return false;
      if (milestone === 'overdue' && item.daysUntilDue >= 0) return false;
      if (milestone === 'urgent' && (item.daysUntilDue < 0 || item.daysUntilDue > 30)) return false;
      if (milestone === 'upcoming' && item.daysUntilDue < 0) return false;
      return true;
    });

    return rows.sort((a, b) => {
      switch (this.sort()) {
        case 'grace': return this.graceEnds(a).localeCompare(this.graceEnds(b));
        case 'application': return (a.applicationNo ?? 0) - (b.applicationNo ?? 0);
        case 'fee': return this.fee(b) - this.fee(a);
        default: return a.dueDate.localeCompare(b.dueDate);
      }
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize())));
  readonly paged = computed(() => {
    const current = Math.min(this.page(), this.totalPages());
    return this.filtered().slice((current - 1) * this.pageSize(), current * this.pageSize());
  });
  readonly displayedRange = computed(() => {
    if (this.filtered().length === 0) return '0 to 0';
    const start = (Math.min(this.page(), this.totalPages()) - 1) * this.pageSize() + 1;
    return `${start} to ${Math.min(start + this.pageSize() - 1, this.filtered().length)}`;
  });
  readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = Math.min(this.page(), total);
    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

    const pages: Array<number | null> = [1];
    if (current > 4) pages.push(null);
    for (let page = Math.max(2, current - 2); page <= Math.min(total - 1, current + 2); page++) pages.push(page);
    if (current < total - 3) pages.push(null);
    pages.push(total);
    return pages;
  });
  readonly allPageSelected = computed(() => this.paged().length > 0 && this.paged().every(item => this.selected().has(this.keyOf(item))));
  readonly selectedRecords = computed(() => this.renewals().filter(item => this.selected().has(this.keyOf(item))));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    const range = this.appliedDateRange();
    const from = range?.from ?? this.defaultFrom();
    const to = range?.to ?? this.defaultTo();

    forkJoin({
      deadlines: this.agentData.getDeadlines(from, to),
      portfolio: this.agentData.getPortfolio(0, 1000),
    }).subscribe({
      next: ({ deadlines, portfolio }) => {
        const owners = new Map<number, AgentPortfolioTrademark>();
        for (const mark of portfolio.body ?? []) {
          if (mark.id != null) owners.set(mark.id, mark);
        }
        this.renewals.set((deadlines ?? [])
          .filter(item => item.deadlineType === 'RENEWAL')
          .filter(item => this.isOverdueScope ? item.daysUntilDue < 0 : this.scope === 'renewals-upcoming' ? item.daysUntilDue >= 0 : true)
          .map(item => ({ ...item, proprietorName: item.trademarkId ? owners.get(item.trademarkId)?.proprietorName : undefined })));
        this.loading.set(false);
        this.clampPage();
      },
      error: () => {
        this.error.set('Could not load the renewal docket. Retry, or reload the page.');
        this.loading.set(false);
      },
    });
  }

  setMilestone(value: MilestoneFilter): void { this.milestone.set(value); this.resetPage(); }
  setClass(value: string): void { this.classFilter.set(value); this.resetPage(); }
  setClient(value: string): void { this.clientFilter.set(value); this.resetPage(); }
  setSort(value: SortOrder): void { this.sort.set(value); this.resetPage(); }
  resetPage(): void { this.page.set(1); }

  clearSearch(): void {
    this.search.set('');
    this.resetPage();
  }

  useNextNinetyDays(): void {
    this.dateFrom.set(this.today);
    this.dateTo.set(dayjs().add(90, 'day').format('YYYY-MM-DD'));
    this.applyDateFilter();
  }

  applyDateFilter(): void {
    const from = this.dateFrom();
    const to = this.dateTo();
    if ((from && !to) || (!from && to)) {
      this.error.set('Choose both dates to filter the renewal window.');
      return;
    }
    if (from && to && from > to) {
      this.error.set('The end date must be on or after the start date.');
      return;
    }
    this.error.set('');
    this.appliedDateRange.set(from && to ? { from, to } : null);
    this.resetPage();
    this.load();
  }

  toggleAll(): void {
    const next = new Set(this.selected());
    if (this.allPageSelected()) this.paged().forEach(item => next.delete(this.keyOf(item)));
    else this.paged().forEach(item => next.add(this.keyOf(item)));
    this.selected.set(next);
  }

  toggleRow(item: RenewalRecord): void {
    const next = new Set(this.selected());
    const key = this.keyOf(item);
    next.has(key) ? next.delete(key) : next.add(key);
    this.selected.set(next);
  }

  isSelected(item: RenewalRecord): boolean { return this.selected().has(this.keyOf(item)); }
  goToPage(page: number): void { if (page >= 1 && page <= this.totalPages()) this.page.set(page); }
  onPageSizeChange(size: number): void {
    if (![5, 10, 25, 50].includes(size)) return;
    this.pageSize.set(size as 5 | 10 | 25 | 50);
    this.clearSelection();
    this.resetPage();
  }

  clearSelection(): void { this.selected.set(new Set()); }

  openMark(item: RenewalRecord): void {
    if (item.trademarkId) void this.router.navigate(['/agent-portal/portfolio', item.trademarkId]);
  }

  exportSchedule(): void {
    this.downloadCsv(this.filtered(), `${this.isOverdueScope ? 'overdue' : 'upcoming'}-renewals.csv`);
  }

  exportSelected(format: ExportFormat): void {
    const records = this.selectedRecords();
    if (!records.length || this.exporting()) return;
    this.exporting.set(format);
    if (format === 'excel') {
      this.downloadCsv(records, 'selected-renewals.csv');
      this.exporting.set(null);
      return;
    }
    printReport(this.printableSchedule(records))
      .catch(() => this.error.set('Could not prepare the selected renewal schedule. Please try again.'))
      .finally(() => this.exporting.set(null));
  }

  private downloadCsv(records: RenewalRecord[], filename: string): void {
    const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const content = [
      ['Trademark', 'Application no.', 'Class', 'Proprietor', 'Renewal due', 'Status', 'Fee'].map(escape).join(','),
      ...records.map(item => [item.trademarkName, item.applicationNo, item.tmClass, item.proprietorName, item.dueDate, this.stageLabel(item), this.fee(item)].map(escape).join(',')),
    ].join('\n');
    saveBlob(new Blob([content], { type: 'text/csv;charset=utf-8' }), filename);
  }

  private printableSchedule(records: RenewalRecord[]): string {
    const rows = records.map(item => `<tr><td>${this.escapeHtml(item.trademarkName || 'Trademark record')}</td><td>${this.escapeHtml(item.applicationNo)}</td><td>${this.escapeHtml(item.tmClass)}</td><td>${this.escapeHtml(item.proprietorName || 'Not recorded')}</td><td>${this.escapeHtml(this.dateLabel(item.dueDate))}</td><td>${this.escapeHtml(this.stageLabel(item))}</td><td>${this.escapeHtml(this.feeLabel(item))}</td></tr>`).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><title>Trademark renewal schedule</title><style>@page { size: A4 landscape; margin: 14mm; } body { color:#131b2e; font:10pt Arial,sans-serif; } h1 { margin:0 0 4px; font-size:20pt; } p { margin:0 0 16px; color:#464555; } table { width:100%; border-collapse:collapse; } th { color:#fff; background:#3525cd; text-align:left; } th,td { padding:8px; border-bottom:1px solid #dae2fd; vertical-align:top; } tr:nth-child(even) { background:#f2f3ff; }</style></head><body><h1>Trademark renewal schedule</h1><p>${records.length} selected renewal${records.length === 1 ? '' : 's'} &middot; Generated ${this.escapeHtml(dayjs().format('DD MMM YYYY'))}</p><table><thead><tr><th>Trademark</th><th>Application</th><th>Class</th><th>Proprietor</th><th>Renewal due</th><th>Status</th><th>Fee</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
  }

  private escapeHtml(value: unknown): string {
    return String(value ?? '—').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
  }

  initials(item: RenewalRecord): string {
    return (item.trademarkName ?? 'TM').split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  }

  fee(item: RenewalRecord): number {
    if (item.daysUntilDue >= 0) return 9000;
    return Math.abs(item.daysUntilDue) <= 180 ? 13500 : 18000;
  }

  feeLabel(item: RenewalRecord): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(this.fee(item));
  }

  feeDescription(item: RenewalRecord): string {
    if (item.daysUntilDue >= 0) return 'Government fee';
    return Math.abs(item.daysUntilDue) <= 180 ? 'Govt ₹9k + surcharge ₹4.5k' : 'Govt ₹9k + restoration ₹9k';
  }

  stageLabel(item: RenewalRecord): string {
    if (item.daysUntilDue < -180) return 'Overdue (Sec 25(4))';
    if (item.daysUntilDue < 0) return 'Overdue (Sec 25(3))';
    if (item.daysUntilDue <= 30) return `Expiring in ${item.daysUntilDue} Days`;
    return item.daysUntilDue <= 90 ? `Expiring in ${item.daysUntilDue} Days` : 'Upcoming Renewal (Advance Notice Queue)';
  }

  stageIcon(item: RenewalRecord): string {
    if (item.daysUntilDue < -180) return 'cancel';
    if (item.daysUntilDue < 0) return 'timer_off';
    return item.daysUntilDue <= 30 ? 'alarm' : item.daysUntilDue <= 90 ? 'calendar_month' : 'forward_to_inbox';
  }

  stageClass(item: RenewalRecord): string {
    if (item.daysUntilDue < -180) return 'is-lapsed';
    if (item.daysUntilDue < 0) return 'is-overdue';
    if (item.daysUntilDue <= 30) return 'is-urgent';
    return 'is-upcoming';
  }

  dateLabel(date: string): string { return dayjs(date).format('DD MMM YYYY'); }
  graceEnds(item: RenewalRecord): string { return dayjs(item.dueDate).add(6, 'month').format('YYYY-MM-DD'); }
  restorationEnds(item: RenewalRecord): string { return dayjs(item.dueDate).add(12, 'month').format('YYYY-MM-DD'); }
  daysLabel(item: RenewalRecord): string { return item.daysUntilDue < 0 ? `${Math.abs(item.daysUntilDue)} Days Ago` : item.daysUntilDue === 0 ? 'Today' : `${item.daysUntilDue} Days Left`; }
  keyOf(item: RenewalRecord): string { return item.id ? `id:${item.id}` : `key:${item.derivedKey ?? item.dueDate}-${item.applicationNo ?? ''}`; }

  private defaultFrom(): string { return dayjs().subtract(this.isOverdueScope || this.scope === 'renewals' ? OVERDUE_RENEWAL_LOOKBACK_DAYS : 0, 'day').format('YYYY-MM-DD'); }
  private defaultTo(): string { return dayjs().add(this.isOverdueScope ? 0 : 365, 'day').format('YYYY-MM-DD'); }
  private clampPage(): void { if (this.page() > this.totalPages()) this.page.set(this.totalPages()); }
}

import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { IconComponent } from '../ui/icon.component';
import { ExportFormat, ExportMenuComponent } from '../ui/export-menu.component';
import { saveBlob } from '../ui/save-blob';
import { printReport } from '../ui/print-report';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { AgentDataService } from '../../shared/services/agent-data.service';
import {
  AgentCustomField,
  AgentImportSummary,
  AgentPortfolioFilterOptions,
  AgentPortfolioQuery,
  AgentPortfolioTrademark,
  PortfolioSearchField,
  PortfolioSortField,
} from '../../../models/agent.model';

/** One option of the "search by" dropdown. */
interface SearchFieldOption {
  value: PortfolioSearchField;
  label: string;
  placeholder: string;
}

/** A sortable column header. */
interface SortableColumn {
  field: PortfolioSortField;
  label: string;
  /** Dates open newest-first — "oldest filing" is rarely the first question. Text opens A→Z. */
  firstDir: 'asc' | 'desc';
}

@Component({
  selector: 'app-agent-portfolio',
  standalone: true,
  imports: [IconComponent, ExportMenuComponent, CommonModule, FormsModule, RouterModule],
  templateUrl: './agent-portfolio.component.html',
  styleUrl: './agent-portfolio.component.scss',
})
export class AgentPortfolioComponent implements OnInit, OnDestroy {
  trademarks = signal<AgentPortfolioTrademark[]>([]);
  loading = signal(true);
  error = signal('');

  // Pagination
  page = 0;
  pageSize = 20;
  totalCount = 0;
  totalPages = 0;

  // Filters. Applied by the server: the client holds one page of twenty out of thousands of marks,
  // so filtering what it has in hand searched the wrong 20 rows and normally found nothing.
  searchQuery = '';
  filterStatus = '';
  filterClass = '';
  private searchSubject = new Subject<string>();

  /**
   * Which field the search box matches. One field at a time: searching all three at once meant a
   * number like "25" matched every mark whose name, proprietor or application number contained it.
   */
  searchBy: PortfolioSearchField = 'NAME';
  readonly searchFields: SearchFieldOption[] = [
    { value: 'NAME', label: 'Trademark', placeholder: 'Search by trademark name…' },
    { value: 'APPLICATION_NO', label: 'Application no.', placeholder: 'Search by application number…' },
    { value: 'PROPRIETOR', label: 'Proprietor', placeholder: 'Search by proprietor name…' },
  ];

  // The query the table currently reflects. Tracked here rather than with distinctUntilChanged so
  // that clearing the filters can reset it: the operator would otherwise still be holding the old
  // text, and retyping it after a clear would be swallowed as "no change" while the table below
  // stayed unfiltered.
  private lastSearched = '';

  // Only the buckets and classes this agent actually holds, with counts, so no option can be
  // chosen that is guaranteed to return an empty table.
  filterOptions = signal<AgentPortfolioFilterOptions | null>(null);

  /**
   * Sorting is done by the server across the whole filtered set — sorting the twenty rows on screen
   * would put page one's "A" marks first and leave every other "A" on later pages. Null keeps the
   * default order, most recently added first.
   */
  sortField: PortfolioSortField | null = null;
  sortDir: 'asc' | 'desc' = 'asc';
  readonly columns: SortableColumn[] = [
    { field: 'name', label: 'Trademark', firstDir: 'asc' },
    { field: 'applicationNo', label: 'App No.', firstDir: 'asc' },
    { field: 'tmClass', label: 'Class', firstDir: 'asc' },
    { field: 'proprietorName', label: 'Proprietor', firstDir: 'asc' },
    { field: 'trademarkStatus', label: 'Status', firstDir: 'asc' },
    { field: 'applicationDate', label: 'Filing Date', firstDir: 'desc' },
    { field: 'renewalDate', label: 'Renewal', firstDir: 'asc' },
  ];

  /**
   * The firm's own spreadsheet columns, and which of them are shown in this table.
   *
   * Display only for now: sorting and filtering on them needs the query to reach into the jsonb
   * bag, which the portfolio query does not do yet. An unsortable column is honest about that —
   * a header that looks sortable and silently does nothing would not be.
   */
  customFields = signal<AgentCustomField[]>([]);
  shownCustomFields = signal<AgentCustomField[]>([]);
  showColumnPicker = signal(false);
  columnPickerError = signal('');

  // Delete
  deletingId = signal<number | null>(null);
  confirmDeleteId = signal<number | null>(null);

  // Registry refresh
  refreshingId = signal<number | null>(null);
  refreshMessage = signal('');

  // Uploads still being processed. An agent whose spreadsheet could not be parsed is sent here
  // rather than left on the upload screen, so this is the only place they learn their marks are
  // on the way — without it the portfolio just looks empty and broken.
  pendingImports = signal<AgentImportSummary[]>([]);

  // Export
  exporting = signal<ExportFormat | null>(null);
  printing = signal(false);
  readonly selectedIds = new Set<number>();
  private readonly selectedMarks = new Map<number, AgentPortfolioTrademark>();
  private firmName = 'Trademarx';
  private accentColor = '#1f4e79';
  private logoUrl: string | null = null;

  constructor(private readonly agentDataService: AgentDataService) {}

  ngOnDestroy(): void {
    if (this.logoUrl) URL.revokeObjectURL(this.logoUrl);
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
    this.load();
    this.loadPendingImports();
    this.loadFilterOptions();
    this.loadCustomFields();
    this.searchSubject.pipe(debounceTime(350)).subscribe((q) => {
      if (q.trim() === this.lastSearched) return;
      this.lastSearched = q.trim();
      this.page = 0;
      this.load();
    });
  }

  private loadCustomFields(): void {
    this.agentDataService.getCustomFields().subscribe({
      next: (fields) => {
        this.customFields.set(fields);
        this.shownCustomFields.set(fields.filter((f) => f.showInList));
      },
      // A firm that has never imported a spreadsheet has none. Normal, not an error.
      error: () => this.customFields.set([]),
    });
  }

  /**
   * Adds or removes one of the firm's own columns from the table.
   *
   * Persisted on the field itself rather than in this component, so the choice follows the agent
   * between sessions and devices — the same reason it is capped server-side rather than here.
   */
  toggleColumn(field: AgentCustomField): void {
    const next = !field.showInList;
    this.columnPickerError.set('');
    this.agentDataService.updateCustomField(field.id, { showInList: next }).subscribe({
      next: (updated) => {
        const fields = this.customFields().map((f) => (f.id === updated.id ? updated : f));
        this.customFields.set(fields);
        this.shownCustomFields.set(fields.filter((f) => f.showInList));
      },
      error: (err) => this.columnPickerError.set(err?.error?.detail ?? 'Could not change that column.'),
    });
  }

  /** A mark's value for one of the firm's own fields, or a dash when it has none. */
  customValue(tm: AgentPortfolioTrademark, field: AgentCustomField): string {
    return tm.customFields?.[field.fieldKey] || '—';
  }

  private loadFilterOptions(): void {
    this.agentDataService.getPortfolioFilterOptions().subscribe({
      // Losing the options only costs the dropdowns; the table itself must still render.
      next: (options) => this.filterOptions.set(options),
      error: () => this.filterOptions.set(null),
    });
  }

  /**
   * Queues a fetch from the IP India register for one mark.
   *
   * The fetch is served asynchronously by the shared priority queue, so this reports what happened
   * to the request rather than pretending to return fresh data. Anything else would have the agent
   * staring at unchanged values wondering whether the button worked.
   */
  refreshFromRegistry(tm: AgentPortfolioTrademark): void {
    if (!tm.id || this.refreshingId() !== null) return;
    this.refreshingId.set(tm.id);
    this.refreshMessage.set('');

    this.agentDataService.refreshFromRegistry(tm.id).subscribe({
      next: res => {
        this.refreshingId.set(null);
        switch (res.state) {
          case 'QUEUED':
            this.refreshMessage.set(`Requested an update for ${tm.name || 'this mark'}. It usually lands within a few minutes.`);
            break;
          case 'BUSY':
            this.refreshMessage.set('The register queue is busy right now — please try again shortly.');
            break;
          case 'NO_APPLICATION_NO':
            this.refreshMessage.set('This mark has no application number, so there is nothing to look up yet.');
            break;
          default:
            this.refreshMessage.set('Update requested.');
        }
      },
      error: () => {
        this.refreshingId.set(null);
        this.refreshMessage.set('Could not request an update. Please try again.');
      },
    });
  }

  loadPendingImports(): void {
    this.agentDataService.getOwnImports().subscribe({
      // A failure here must not disturb the portfolio itself; the banner is supplementary.
      next: (imports) => this.pendingImports.set(imports.filter((i) => i.pending)),
      error: () => this.pendingImports.set([]),
    });
  }

  /** The filter and sort the table reflects — sent with the listing and with both exports. */
  private currentQuery(): AgentPortfolioQuery {
    return {
      search: this.searchQuery,
      searchBy: this.searchBy,
      status: this.filterStatus,
      tmClass: this.filterClass === '' ? null : Number(this.filterClass),
      sort: this.sortField ? { field: this.sortField, dir: this.sortDir } : null,
    };
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.agentDataService
      .getPortfolio(this.page, this.pageSize, this.currentQuery())
      .subscribe({
        next: (res) => {
          this.trademarks.set(res.body || []);
          const total = res.headers.get('X-Total-Count');
          // Counts the filtered set, so the pager shrinks with the filter rather than offering
          // pages that render empty.
          this.totalCount = total ? parseInt(total, 10) : (res.body?.length || 0);
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load portfolio.');
          this.loading.set(false);
        },
      });
  }

  /** True whenever the table is showing a subset, so the header can say so. */
  get hasFilters(): boolean {
    return !!(this.searchQuery.trim() || this.filterStatus || this.filterClass);
  }

  get searchPlaceholder(): string {
    return this.searchFields.find(f => f.value === this.searchBy)?.placeholder ?? 'Search…';
  }

  onSearchChange(): void {
    this.clearSelection();
    this.searchSubject.next(this.searchQuery);
  }

  /** Switching the field only changes the results when there is text to match. */
  onSearchByChange(): void {
    if (!this.searchQuery.trim()) return;
    this.onFilterChange();
  }

  /** Any dropdown change restarts at page one - page 483 of an unfiltered list means nothing now. */
  onFilterChange(): void {
    this.clearSelection();
    this.lastSearched = this.searchQuery.trim();
    this.page = 0;
    this.load();
  }

  clearFilters(): void {
    this.clearSelection();
    this.searchQuery = '';
    this.lastSearched = '';
    this.filterStatus = '';
    this.filterClass = '';
    this.page = 0;
    this.load();
  }

  /** First click sorts by the column, the next reverses it. Restarts at page one either way. */
  toggleSort(column: SortableColumn): void {
    if (this.sortField === column.field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = column.field;
      this.sortDir = column.firstDir;
    }
    this.page = 0;
    this.load();
  }

  ariaSort(field: PortfolioSortField): 'ascending' | 'descending' | 'none' {
    if (this.sortField !== field) return 'none';
    return this.sortDir === 'asc' ? 'ascending' : 'descending';
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages) return;
    this.page = p;
    this.load();
  }

  startDelete(id: number): void {
    this.confirmDeleteId.set(id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  confirmDelete(id: number): void {
    this.deletingId.set(id);
    this.confirmDeleteId.set(null);
    this.agentDataService.deletePortfolioItem(id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.trademarks.update(list => list.filter(t => t.id !== id));
        this.totalCount--;
      },
      error: () => this.deletingId.set(null),
    });
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'unknown';
    const s = status.toLowerCase();
    if (s.includes('register') || s.includes('renew')) return 'active';
    if (s.includes('object') || s.includes('oppos')) return 'warning';
    if (s.includes('abandon') || s.includes('refused')) return 'inactive';
    if (s.includes('advertis') || s.includes('filed')) return 'pending';
    return 'unknown';
  }

  isExpiringSoon(date: string | Date | undefined): boolean {
    if (!date) return false;
    const d = new Date(date);
    const diffDays = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 90;
  }

  getPageRange(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const cur = this.page;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i);
    }
    pages.push(0);
    if (cur > 2) pages.push(-1);
    for (let p = Math.max(1, cur - 1); p <= Math.min(total - 2, cur + 1); p++) pages.push(p);
    if (cur < total - 3) pages.push(-1);
    pages.push(total - 1);
    return pages;
  }

  trackById(_: number, tm: AgentPortfolioTrademark): any {
    return tm.id;
  }

  /**
   * Downloads what the table shows — the same search, filters and order — across every page, not
   * just the twenty rows on screen.
   */
  export(format: ExportFormat): void {
    if (this.exporting() || this.printing()) return;
    this.error.set('');
    if (format === 'pdf') {
      const selected = [...this.selectedMarks.values()];
      if (!selected.length) {
        this.error.set('Select at least one trademark to print.');
        return;
      }
      this.printing.set(true);
      printReport(this.printHtml(selected)).catch(() => this.error.set('Could not prepare the print view. Please try again.'))
        .finally(() => this.printing.set(false));
      return;
    }

    this.exporting.set(format);
    const query = this.currentQuery();
    const request = this.agentDataService.exportPortfolioExcel(query);
    request.subscribe({
      next: (blob) => {
        saveBlob(blob, 'trademark-portfolio.xlsx');
        this.exporting.set(null);
      },
      error: () => {
        this.error.set('Could not generate the Excel file. Please try again.');
        this.exporting.set(null);
      },
    });
  }

  isSelected(tm: AgentPortfolioTrademark): boolean {
    return tm.id != null && this.selectedIds.has(tm.id);
  }

  isPageSelected(): boolean {
    const rows = this.trademarks().filter(tm => tm.id != null);
    return rows.length > 0 && rows.every(tm => this.selectedIds.has(tm.id!));
  }

  togglePageSelection(): void {
    const rows = this.trademarks().filter(tm => tm.id != null);
    const remove = this.isPageSelected();
    for (const tm of rows) this.setSelected(tm, !remove);
  }

  toggleSelection(tm: AgentPortfolioTrademark): void {
    if (tm.id == null) return;
    this.setSelected(tm, !this.selectedIds.has(tm.id));
  }

  private setSelected(tm: AgentPortfolioTrademark, selected: boolean): void {
    if (tm.id == null) return;
    if (selected) {
      this.selectedIds.add(tm.id);
      this.selectedMarks.set(tm.id, tm);
    } else {
      this.selectedIds.delete(tm.id);
      this.selectedMarks.delete(tm.id);
    }
  }

  private clearSelection(): void {
    this.selectedIds.clear();
    this.selectedMarks.clear();
  }

  private printHtml(marks: AgentPortfolioTrademark[]): string {
    const esc = (value: unknown) => String(value ?? '—').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
    const rows = marks.map(tm => `<tr><td><strong>${esc(tm.name)}</strong>${tm.type ? `<br><small>${esc(tm.type)}</small>` : ''}</td><td>${esc(tm.applicationNo)}</td><td>${esc(tm.tmClass)}</td><td>${esc(tm.proprietorName)}</td><td>${esc(tm.trademarkStatus || 'Unknown')}</td><td>${esc(tm.applicationDate)}</td><td>${esc(tm.renewalDate)}</td></tr>`).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><title>Trademark portfolio</title><style>
      @page{size:A4 landscape;margin:14mm 12mm}*{box-sizing:border-box}body{font:10pt Arial,sans-serif;color:#202a36;margin:0}
      header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid ${this.accentColor};padding-bottom:10px;margin-bottom:18px}
      h1{font-size:20pt;margin:0 0 4px}.firm{color:${this.accentColor};font-size:15pt;font-weight:bold;display:flex;align-items:center;gap:10px}.logo{max-width:100px;max-height:44px;object-fit:contain}
      table{width:100%;border-collapse:collapse;table-layout:fixed}thead{display:table-header-group}th{background:${this.accentColor};color:white;text-align:left;padding:7px;font-size:8pt}td{padding:7px;border-bottom:1px solid #d8dde4;vertical-align:top;overflow-wrap:anywhere}tr{break-inside:avoid;page-break-inside:avoid}
      footer{margin-top:12px;border-top:1px solid #d8dde4;padding-top:7px;color:#596575;font-size:8pt}
      </style></head><body><header><div><h1>Trademark Portfolio</h1><div>${marks.length} selected trademark${marks.length===1?'':'s'}</div></div><div class="firm">${this.logoUrl?`<img class="logo" src="${esc(this.logoUrl)}" alt="">`:''}${esc(this.firmName)}</div></header>
      <table><thead><tr><th>Trademark</th><th>Application</th><th>Class</th><th>Proprietor</th><th>Status</th><th>Filed</th><th>Renewal</th></tr></thead><tbody>${rows}</tbody></table><footer>Generated ${esc(new Date().toLocaleDateString('en-IN'))}. Renewal dates should be verified against the Register before relying on them.</footer></body></html>`;
  }
}

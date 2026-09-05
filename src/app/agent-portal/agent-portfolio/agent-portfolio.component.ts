import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, Subject } from 'rxjs';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentImportSummary, AgentPortfolioFilterOptions, AgentPortfolioTrademark } from '../../../models/agent.model';

@Component({
  selector: 'app-agent-portfolio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './agent-portfolio.component.html',
  styleUrl: './agent-portfolio.component.scss',
})
export class AgentPortfolioComponent implements OnInit {
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

  // The query the table currently reflects. Tracked here rather than with distinctUntilChanged so
  // that clearing the filters can reset it: the operator would otherwise still be holding the old
  // text, and retyping it after a clear would be swallowed as "no change" while the table below
  // stayed unfiltered.
  private lastSearched = '';

  // Only the buckets and classes this agent actually holds, with counts, so no option can be
  // chosen that is guaranteed to return an empty table.
  filterOptions = signal<AgentPortfolioFilterOptions | null>(null);

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
  exportingExcel = signal(false);
  exportingPdf = signal(false);

  constructor(private readonly agentDataService: AgentDataService) {}

  ngOnInit(): void {
    this.load();
    this.loadPendingImports();
    this.loadFilterOptions();
    this.searchSubject.pipe(debounceTime(350)).subscribe((q) => {
      if (q.trim() === this.lastSearched) return;
      this.lastSearched = q.trim();
      this.page = 0;
      this.load();
    });
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

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.agentDataService
      .getPortfolio(this.page, this.pageSize, {
        search: this.searchQuery,
        status: this.filterStatus,
        tmClass: this.filterClass === '' ? null : Number(this.filterClass),
      })
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

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  /** Any dropdown change restarts at page one - page 483 of an unfiltered list means nothing now. */
  onFilterChange(): void {
    this.lastSearched = this.searchQuery.trim();
    this.page = 0;
    this.load();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.lastSearched = '';
    this.filterStatus = '';
    this.filterClass = '';
    this.page = 0;
    this.load();
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

  exportExcel(): void {
    this.exportingExcel.set(true);
    this.agentDataService.exportPortfolioExcel().subscribe({
      next: (blob) => {
        this.downloadBlob(blob, 'trademark-portfolio.xlsx');
        this.exportingExcel.set(false);
      },
      error: () => this.exportingExcel.set(false),
    });
  }

  exportPdf(): void {
    this.exportingPdf.set(true);
    this.agentDataService.exportPortfolioPdf().subscribe({
      next: (blob) => {
        this.downloadBlob(blob, 'trademark-portfolio.pdf');
        this.exportingPdf.set(false);
      },
      error: () => this.exportingPdf.set(false),
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

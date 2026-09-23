import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchReport, SearchReportRow, SearchReportType } from '../../../models/agent.model';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { ExportFormat, ExportMenuComponent } from '../ui/export-menu.component';
import { fileSlug, saveBlob } from '../ui/save-blob';

/**
 * Availability search, previewed on screen and downloadable on the firm's letterhead.
 *
 * <p>The preview is the same result the PDF renders, not a summary of it. An agent is putting their
 * name on this and sending it to a client — they will not do that for a document they have not
 * seen first.
 */
@Component({
  selector: 'app-agent-search-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ExportMenuComponent],
  templateUrl: './agent-search-report.component.html',
  styleUrl: './agent-search-report.component.scss',
})
export class AgentSearchReportComponent {
  private readonly agentData = inject(AgentDataService);
  private readonly destroyRef = inject(DestroyRef);

  query = '';
  clientName = '';
  searchType: SearchReportType = 'phonetic';
  pageSize: 10 | 100 | 1000 = 100;
  currentPage = 0;
  readonly selectedIds = new Set<number>();
  readonly artworkUrls = signal<Record<number, string>>({});
  reportSearchType: SearchReportType = 'phonetic';

  /**
   * Classes to confine the search to. Empty means every class.
   *
   * <p>A set rather than one class because a single mark is commonly filed in several — a clothing
   * brand in 25 and 35 — and running that as one report per class leaves the agent reconciling
   * three documents by hand.
   */
  readonly selectedClasses = signal<number[]>([]);
  readonly classPickerOpen = signal(false);

  readonly report = signal<SearchReport | null>(null);
  readonly loading = signal(false);
  readonly exporting = signal<ExportFormat | null>(null);
  readonly error = signal('');

  /** All 45 Nice classes. Optional, but choosing some changes what the report means. */
  readonly classes = Array.from({ length: 45 }, (_, i) => i + 1);

  constructor() {
    this.destroyRef.onDestroy(() => this.clearArtwork());
  }

  toggleClassPicker(): void {
    this.classPickerOpen.update(open => !open);
  }

  isClassSelected(c: number): boolean {
    return this.selectedClasses().includes(c);
  }

  toggleClass(c: number): void {
    // Kept sorted so the summary, the request and the report all read in the same order.
    this.selectedClasses.update(current =>
      current.includes(c) ? current.filter(x => x !== c) : [...current, c].sort((a, b) => a - b),
    );
  }

  clearClasses(): void {
    this.selectedClasses.set([]);
  }

  /** What the closed picker reads as. Spelled out up to three, counted beyond that. */
  classSummary(): string {
    const selected = this.selectedClasses();
    if (selected.length === 0) return 'All classes';
    if (selected.length <= 3) return selected.map(c => `Class ${c}`).join(', ');
    return `${selected.length} classes`;
  }

  /** The same phrasing the PDF uses, so screen and document agree. */
  classSentence(classes: number[]): string {
    if (classes.length === 1) return `class ${classes[0]}`;
    return `classes ${classes.slice(0, -1).join(', ')} and ${classes[classes.length - 1]}`;
  }

  run(): void {
    const term = this.query.trim();
    if (!term || this.loading()) {
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.classPickerOpen.set(false);
    this.currentPage = 0;
    this.selectedIds.clear();

    this.loadPage(term, 0);
  }

  private loadPage(term: string, page: number): void {
    this.loading.set(true);
    this.error.set('');

    this.agentData.previewSearchReport(term, this.selectedClasses(), this.searchType, page, this.pageSize).subscribe({
      next: result => {
        this.clearArtwork();
        this.report.set(result);
        this.reportSearchType = this.searchType;
        this.currentPage = page;
        this.loadArtwork(result.rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not run that search. Please try again.');
        this.loading.set(false);
      },
    });
  }

  onSearchTypeChange(): void {
    if (this.report() && this.query.trim()) this.run();
  }

  onPageSizeChange(): void {
    if (!this.report() || !this.query.trim()) return;
    this.currentPage = 0;
    this.loadPage(this.query.trim(), 0);
  }

  previousPage(): void {
    if (this.currentPage > 0 && !this.loading()) this.loadPage(this.report()!.query, this.currentPage - 1);
  }

  nextPage(): void {
    if (this.currentPage + 1 < this.totalPages && !this.loading()) this.loadPage(this.report()!.query, this.currentPage + 1);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil((this.report()?.totalResults ?? 0) / this.pageSize));
  }

  get firstResult(): number {
    return this.report()?.totalResults ? this.currentPage * this.pageSize + 1 : 0;
  }

  get lastResult(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.report()?.totalResults ?? 0);
  }

  isPageSelected(): boolean {
    const rows = this.report()?.rows ?? [];
    return rows.length > 0 && rows.every(row => this.selectedIds.has(row.trademarkId));
  }

  togglePageSelection(): void {
    const rows = this.report()?.rows ?? [];
    const remove = this.isPageSelected();
    for (const row of rows) remove ? this.selectedIds.delete(row.trademarkId) : this.selectedIds.add(row.trademarkId);
  }

  toggleRowSelection(row: SearchReportRow): void {
    this.selectedIds.has(row.trademarkId) ? this.selectedIds.delete(row.trademarkId) : this.selectedIds.add(row.trademarkId);
  }

  artworkUrl(row: SearchReportRow): string | null {
    return this.artworkUrls()[row.trademarkId] ?? null;
  }

  private loadArtwork(rows: SearchReportRow[]): void {
    for (const row of rows.filter(item => item.hasArtwork)) {
      this.agentData.getSearchResultArtwork(row.trademarkId).subscribe({
        next: blob => this.artworkUrls.update(urls => ({ ...urls, [row.trademarkId]: URL.createObjectURL(blob) })),
      });
    }
  }

  private clearArtwork(): void {
    Object.values(this.artworkUrls()).forEach(url => URL.revokeObjectURL(url));
    this.artworkUrls.set({});
  }

  /** The search on screen as Excel (every row) or PDF (on letterhead, with the client name). */
  export(format: ExportFormat): void {
    const current = this.report();
    if (!current || this.exporting()) {
      return;
    }
    if (this.selectedIds.size === 0) {
      this.error.set('Select at least one result to download.');
      return;
    }
    this.exporting.set(format);
    const selected = [...this.selectedIds];

    const request = format === 'excel'
      ? this.agentData.downloadSearchReportExcel(current.query, current.tmClasses, this.reportSearchType, selected)
      : this.agentData.downloadSearchReport(
          current.query,
          current.tmClasses,
          this.reportSearchType,
          selected,
          this.clientName.trim() || null,
        );
    request.subscribe({
      next: blob => {
        saveBlob(blob, `search-report-${fileSlug(current.query, 'mark')}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
        this.exporting.set(null);
      },
      error: () => {
        this.error.set(`Could not generate the ${format === 'excel' ? 'Excel file' : 'PDF'}.`);
        this.exporting.set(null);
      },
    });
  }

  countFor(band: 'HIGH' | 'MEDIUM' | 'LOW'): number {
    return this.report()?.countsByRisk?.[band] ?? 0;
  }

  bandLabel(band: string): string {
    // Spelled out rather than left to colour alone — these reports get printed and photocopied.
    return band === 'HIGH' ? 'Close' : band === 'MEDIUM' ? 'Moderate' : 'Distant';
  }

  statusLabel(row: SearchReportRow): string {
    const status = row.trademarkStatus;
    return !status || status.toUpperCase() === 'UNKNOWN' ? 'Not recorded' : status;
  }

  formatDate(iso?: string): string {
    if (!iso) return '—';
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}

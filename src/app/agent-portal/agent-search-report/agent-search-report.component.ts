import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
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
  private printFrame: HTMLIFrameElement | null = null;
  private readonly selectedRows = new Map<number, SearchReportRow>();
  private firmName = 'Trademarx';
  private accentColor = '#1f4e79';
  private logoUrl: string | null = null;

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

  /** Printable report is rendered in an isolated frame so the portal UI never appears on paper. */
  readonly printing = signal(false);

  /** All 45 Nice classes. Optional, but choosing some changes what the report means. */
  readonly classes = Array.from({ length: 45 }, (_, i) => i + 1);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearArtwork();
      if (this.logoUrl) URL.revokeObjectURL(this.logoUrl);
      this.printFrame?.remove();
    });
    this.agentData.getProfile().subscribe({
      next: profile => {
        const branding = profile as typeof profile & { firmDisplayName?: string; reportAccentColor?: string };
        this.firmName = branding.firmDisplayName || profile.companyName || 'Trademarx';
        if (branding.reportAccentColor && /^#?[\da-f]{6}$/i.test(branding.reportAccentColor)) {
          this.accentColor = branding.reportAccentColor.startsWith('#') ? branding.reportAccentColor : `#${branding.reportAccentColor}`;
        }
        this.agentData.getLogo().subscribe({
          next: blob => {
            if (this.logoUrl) URL.revokeObjectURL(this.logoUrl);
            this.logoUrl = URL.createObjectURL(blob);
          },
        });
      },
    });
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
    this.selectedRows.clear();

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
    for (const row of rows) {
      if (remove) {
        this.selectedIds.delete(row.trademarkId);
        this.selectedRows.delete(row.trademarkId);
      } else {
        this.selectedIds.add(row.trademarkId);
        this.selectedRows.set(row.trademarkId, row);
      }
    }
  }

  toggleRowSelection(row: SearchReportRow): void {
    if (this.selectedIds.has(row.trademarkId)) {
      this.selectedIds.delete(row.trademarkId);
      this.selectedRows.delete(row.trademarkId);
    } else {
      this.selectedIds.add(row.trademarkId);
      this.selectedRows.set(row.trademarkId, row);
    }
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

  /** Excel remains a server export; PDF is printed in the browser from selected visible results. */
  export(format: ExportFormat): void {
    const current = this.report();
    if (!current || this.exporting() || this.printing()) {
      return;
    }
    if (this.selectedIds.size === 0) {
      this.error.set('Select at least one result to download.');
      return;
    }
    if (format === 'pdf') {
      this.printSelected(current);
      return;
    }

    this.exporting.set(format);
    const selected = [...this.selectedIds];
    const request = this.agentData.downloadSearchReportExcel(current.query, current.tmClasses, this.reportSearchType, selected);
    request.subscribe({
      next: blob => {
        saveBlob(blob, `search-report-${fileSlug(current.query, 'mark')}.xlsx`);
        this.exporting.set(null);
      },
      error: () => {
        this.error.set('Could not generate the Excel file.');
        this.exporting.set(null);
      },
    });
  }

  private async printSelected(current: SearchReport): Promise<void> {
    const selectedRows = [...this.selectedRows.values()];

    this.printing.set(true);
    await this.loadSelectedArtwork(selectedRows);
    const frame = this.ensurePrintFrame();
    const doc = frame.contentDocument;
    if (!doc) {
      this.printing.set(false);
      this.error.set('Could not prepare the print view. Please try again.');
      return;
    }

    const accent = this.accentColor;
    const firmName = this.firmName;
    const classes = current.tmClasses.length
      ? `Class${current.tmClasses.length === 1 ? '' : 'es'} ${current.tmClasses.join(', ')}`
      : 'All classes';
    const rows = selectedRows.map(row => {
      const image = this.artworkUrl(row);
      return `<tr>
        <td class="artwork">${image ? `<img src="${this.escapeAttribute(image)}" alt="">` : '—'}</td>
        <td><strong>${this.escapeHtml(row.name || '—')}</strong></td>
        <td>${this.escapeHtml(row.applicationNo ?? '—')}</td>
        <td>${this.escapeHtml(row.tmClass ?? '—')}</td>
        <td>${this.escapeHtml(row.proprietorName || '—')}</td>
        <td>${this.escapeHtml(row.trademarkStatus && row.trademarkStatus.toUpperCase() !== 'UNKNOWN' ? row.trademarkStatus : 'Not recorded')}</td>
        ${this.reportSearchType === 'phonetic' ? `<td><span class="risk ${row.riskBand.toLowerCase()}">${this.bandLabel(row.riskBand)}</span></td>` : ''}
      </tr>`;
    }).join('');
    const similarityHead = this.reportSearchType === 'phonetic' ? '<th>Similarity</th>' : '';
    const client = this.clientName.trim();

    doc.open();
    doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>Search report — ${this.escapeHtml(current.query)}</title>
      <style>
        @page { size: A4 landscape; margin: 14mm 12mm 16mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #202a36; font: 10pt Arial, sans-serif; }
        header { border-bottom: 3px solid ${accent}; padding-bottom: 9px; margin-bottom: 16px; display:flex; justify-content:space-between; align-items:center; }
        .firm { color:${accent}; font-size:16pt; font-weight:700; display:flex; align-items:center; gap:10px; }
        .logo { max-width:100px; max-height:45px; object-fit:contain; }
        .title { margin: 0 0 3px; font-size: 20pt; }
        .meta { color:#596575; font-size:9pt; line-height:1.5; }
        table { width:100%; border-collapse:collapse; table-layout:fixed; }
        th { background:${accent}; color:#fff; text-align:left; font-size:8pt; padding:7px 6px; }
        td { border-bottom:1px solid #d8dde4; padding:6px; vertical-align:top; overflow-wrap:anywhere; }
        tbody tr { break-inside:avoid; page-break-inside:avoid; }
        th:first-child, td:first-child { width:7%; }
        th:nth-child(2), td:nth-child(2) { width:19%; }
        th:nth-child(3), td:nth-child(3), th:nth-child(4), td:nth-child(4) { width:10%; }
        th:nth-child(5), td:nth-child(5) { width:24%; }
        th:nth-child(6), td:nth-child(6) { width:15%; }
        td.artwork img { width:54px; height:42px; object-fit:contain; }
        .risk { font-weight:700; }
        .risk.high { color:#a12b2b; } .risk.medium { color:#895600; } .risk.low { color:#24643a; }
        footer { margin-top:12px; padding-top:7px; border-top:1px solid #d8dde4; color:#596575; font-size:8pt; }
        @media screen { body { padding:24px; } }
      </style></head><body>
      <header><div><h1 class="title">Trademark Search Report</h1><div class="meta">${this.escapeHtml(current.query)} · ${this.escapeHtml(this.reportSearchType)} search · ${this.escapeHtml(classes)}${client ? ` · For ${this.escapeHtml(client)}` : ''}</div></div>
      <div class="firm">${this.logoUrl ? `<img class="logo" src="${this.escapeAttribute(this.logoUrl)}" alt="">` : ''}${this.escapeHtml(firmName)}</div></header>
      <table><thead><tr><th>Image</th><th>Mark</th><th>Application</th><th>Class</th><th>Proprietor</th><th>Status</th>${similarityHead}</tr></thead><tbody>${rows}</tbody></table>
      <footer>${selectedRows.length} selected result${selectedRows.length === 1 ? '' : 's'} · Generated ${this.escapeHtml(new Date().toLocaleDateString('en-IN'))}. This search is not an opinion on registrability. Verify status against the Registry before relying on it.</footer>
      </body></html>`);
    doc.close();

    const images = Array.from(doc.images);
    Promise.all(images.map(image => image.complete ? Promise.resolve() : new Promise<void>(resolve => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener('error', () => resolve(), { once: true });
    }))).then(() => {
      window.setTimeout(() => {
        this.printing.set(false);
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
      }, 50);
    });
  }

  private ensurePrintFrame(): HTMLIFrameElement {
    if (!this.printFrame) {
      const frame = document.createElement('iframe');
      frame.setAttribute('aria-hidden', 'true');
      frame.title = 'Printable search report';
      Object.assign(frame.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
      document.body.appendChild(frame);
      this.printFrame = frame;
    }
    return this.printFrame;
  }

  private async loadSelectedArtwork(rows: SearchReportRow[]): Promise<void> {
    const missing = rows.filter(row => row.hasArtwork && !this.artworkUrl(row));
    await Promise.all(missing.map(async row => {
      try {
        const blob = await firstValueFrom(this.agentData.getSearchResultArtwork(row.trademarkId));
        this.artworkUrls.update(urls => ({ ...urls, [row.trademarkId]: URL.createObjectURL(blob) }));
      } catch {
        // The report remains printable if registry artwork is unavailable.
      }
    }));
  }

  private escapeHtml(value: unknown): string {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
  }

  private escapeAttribute(value: string): string {
    return this.escapeHtml(value);
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

import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchReport, SearchReportRow } from '../../../models/agent.model';
import { AgentDataService } from '../../shared/services/agent-data.service';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-search-report.component.html',
  styleUrl: './agent-search-report.component.scss',
})
export class AgentSearchReportComponent {
  private readonly agentData = inject(AgentDataService);

  query = '';
  clientName = '';

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
  readonly downloading = signal(false);
  readonly error = signal('');

  /** All 45 Nice classes. Optional, but choosing some changes what the report means. */
  readonly classes = Array.from({ length: 45 }, (_, i) => i + 1);

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

    this.agentData.previewSearchReport(term, this.selectedClasses()).subscribe({
      next: result => {
        this.report.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not run that search. Please try again.');
        this.loading.set(false);
      },
    });
  }

  download(): void {
    const current = this.report();
    if (!current || this.downloading()) {
      return;
    }
    this.downloading.set(true);

    this.agentData.downloadSearchReport(current.query, current.tmClasses, this.clientName.trim() || null).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `search-report-${current.query.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`;
        anchor.click();
        URL.revokeObjectURL(url);
        this.downloading.set(false);
      },
      error: () => {
        this.error.set('Could not generate the PDF.');
        this.downloading.set(false);
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

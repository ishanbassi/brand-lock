import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SearchReport, SearchReportRow } from '../../../models/agent.model';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentPortalFooterComponent } from '../ui/agent-portal-footer.component';
import { AgentPortalNavbarComponent } from '../ui/agent-portal-navbar.component';
import { AgentPricingPlansComponent } from '../ui/agent-pricing-plans.component';

type SearchMode = 'contains' | 'starts' | 'phonetic';

@Component({
  selector: 'app-agent-search-report-feature',
  standalone: true,
  imports: [FormsModule, AgentPortalNavbarComponent, AgentPortalFooterComponent, AgentPricingPlansComponent],
  templateUrl: './agent-search-report-feature.component.html',
  styleUrl: './agent-search-report-feature.component.scss',
})
export class AgentSearchReportFeatureComponent {
  private readonly agentData = inject(AgentDataService);
  private searchRequestId = 0;

  query = 'KAVACH';
  readonly searchMode = signal<SearchMode>('contains');
  readonly selectedClasses = signal(new Set(['05', '10', '42']));
  readonly searching = signal(false);
  readonly report = signal<SearchReport | null>(null);
  readonly searchError = signal('');

  selectMode(mode: SearchMode): void {
    this.searchMode.set(mode);
  }

  toggleClass(trademarkClass: string): void {
    const selected = new Set(this.selectedClasses());
    selected.has(trademarkClass) ? selected.delete(trademarkClass) : selected.add(trademarkClass);
    this.selectedClasses.set(selected);
  }

  toggleAllClasses(): void {
    this.selectedClasses.set(
      this.selectedClasses().size === 4 ? new Set() : new Set(['05', '10', '35', '42']),
    );
  }

  modeClasses(mode: SearchMode): string {
    const selected = this.searchMode() === mode;
    return `query-pill px-3 py-1.5 rounded-md font-label-md ${selected ? 'bg-primary-container text-on-primary shadow-sm' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`;
  }

  classTagClasses(trademarkClass: string): string {
    const selected = trademarkClass === 'all'
      ? this.selectedClasses().size === 4
      : this.selectedClasses().has(trademarkClass);
    return `class-tag px-2.5 py-1.5 rounded-md font-label-md ${selected ? 'bg-primary-fixed text-on-primary-fixed font-bold shadow-sm' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`;
  }

  runSearch(): void {
    const query = this.query.trim();
    if (!query) return;
    const mode = this.searchMode();
    const searchType = mode === 'starts' ? 'startswith' : mode;
    const requestId = ++this.searchRequestId;
    this.searching.set(true);
    this.searchError.set('');
    this.agentData.previewSearchReport(
      query,
      [...this.selectedClasses()].map(Number),
      searchType,
      0,
      10,
    ).subscribe({
      next: report => {
        if (requestId !== this.searchRequestId) return;
        this.report.set(report);
        this.searching.set(false);
      },
      error: () => {
        if (requestId !== this.searchRequestId) return;
        this.report.set(null);
        this.searchError.set('We could not run the registry search. Please try again.');
        this.searching.set(false);
      },
    });
  }

  riskClasses(row: SearchReportRow): string {
    return row.riskBand === 'HIGH'
      ? 'bg-error-container text-on-error-container'
      : row.riskBand === 'MEDIUM'
        ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
        : 'bg-secondary-fixed text-on-secondary-fixed-variant';
  }
}

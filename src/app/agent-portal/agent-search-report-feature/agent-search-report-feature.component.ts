import { Component, signal } from '@angular/core';
import { AgentPortalFooterComponent } from '../ui/agent-portal-footer.component';
import { AgentPortalNavbarComponent } from '../ui/agent-portal-navbar.component';

type SearchMode = 'contains' | 'starts' | 'phonetic';

@Component({
  selector: 'app-agent-search-report-feature',
  standalone: true,
  imports: [AgentPortalNavbarComponent, AgentPortalFooterComponent],
  templateUrl: './agent-search-report-feature.component.html',
  styleUrl: './agent-search-report-feature.component.scss',
})
export class AgentSearchReportFeatureComponent {
  readonly searchMode = signal<SearchMode>('contains');
  readonly selectedClasses = signal(new Set(['05', '10', '42']));
  readonly searching = signal(false);

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
    if (this.searching()) return;
    this.searching.set(true);
    window.setTimeout(() => this.searching.set(false), 350);
  }
}


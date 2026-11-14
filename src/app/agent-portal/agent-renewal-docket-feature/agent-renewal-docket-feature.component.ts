import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
} from 'rxjs';
import {
  AgentHomeDirectoryEntry,
  AgentHomeRenewalMarkPreview,
  AgentHomeRenewalPreview,
} from '../../../models/agent.model';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentOnboardingModalComponent } from '../ui/agent-onboarding-modal.component';
import { AgentPortalFooterComponent } from '../ui/agent-portal-footer.component';
import { AgentPortalNavbarComponent } from '../ui/agent-portal-navbar.component';
import { AgentPricingPlansComponent } from '../ui/agent-pricing-plans.component';

type DocketFilter = 'all' | 'UPCOMING' | 'SECTION_25_3' | 'SECTION_25_4';

@Component({
  selector: 'app-agent-renewal-docket-feature',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    FormsModule,
    AgentOnboardingModalComponent,
    AgentPortalNavbarComponent,
    AgentPortalFooterComponent,
    AgentPricingPlansComponent,
  ],
  templateUrl: './agent-renewal-docket-feature.component.html',
  styleUrl: './agent-renewal-docket-feature.component.scss',
})
export class AgentRenewalDocketFeatureComponent {
  private readonly agentData = inject(AgentDataService);
  private readonly search$ = new Subject<string>();

  agentQuery = 'BASSI & ASSOCIATES[16629]';
  readonly suggestions = signal<AgentHomeDirectoryEntry[]>([]);
  readonly searching = signal(false);
  readonly searchError = signal('');
  readonly previewLoading = signal(true);
  readonly previewError = signal('');
  readonly selectedPreview = signal<AgentHomeRenewalPreview | null>(null);
  readonly onboardingModalOpen = signal(false);
  readonly activeFilter = signal<DocketFilter>('all');
  readonly docketMarks = computed(() => {
    const marks = this.selectedPreview()?.marks ?? [];
    const filter = this.activeFilter();
    return filter === 'all'
      ? marks
      : marks.filter((mark) => mark.renewalStage === filter);
  });

  constructor() {
    this.search$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((query) => {
          if (query.trim().length < 2) return of<AgentHomeDirectoryEntry[]>([]);
          this.searching.set(true);
          this.searchError.set('');
          return this.agentData.searchPublicAgentPreview(query.trim());
        }),
      )
      .subscribe({
        next: (results) => {
          this.suggestions.set(results);
          this.searching.set(false);
        },
        error: () => {
          this.suggestions.set([]);
          this.searching.set(false);
          this.searchError.set(
            'We could not search the public registry right now. Please try again.',
          );
        },
      });

    this.loadDefaultRenewalPreview();
  }

  onAgentQueryChange(query: string): void {
    this.agentQuery = query;
    this.selectedPreview.set(null);
    this.previewError.set('');
    this.activeFilter.set('all');
    if (query.trim().length < 2) {
      this.suggestions.set([]);
      this.searching.set(false);
      return;
    }
    this.search$.next(this.directoryQuery(query));
  }

  searchNow(): void {
    if (this.agentQuery.trim().length < 2) {
      this.searchError.set(
        'Type at least two characters to search by agent or firm name.',
      );
      return;
    }
    this.search$.next(this.directoryQuery(this.agentQuery));
  }

  selectAgent(entry: AgentHomeDirectoryEntry): void {
    this.loadRenewalPreview(entry.agentName, entry.displayName);
  }

  setFilter(filter: DocketFilter): void {
    this.activeFilter.set(filter);
  }

  startOnboarding(): void {
    this.onboardingModalOpen.set(true);
  }

  stageLabel(mark: AgentHomeRenewalMarkPreview): string {
    if (mark.renewalStage === 'UPCOMING')
      return mark.daysUntilRenewal === 0
        ? 'Due today'
        : `${mark.daysUntilRenewal} days left`;
    if (mark.renewalStage === 'SECTION_25_3')
      return `${Math.abs(mark.daysUntilRenewal)} days overdue · Section 25(3)`;
    return `${Math.abs(mark.daysUntilRenewal)} days overdue · Section 25(4)`;
  }

  stageIcon(mark: AgentHomeRenewalMarkPreview): string {
    return mark.renewalStage === 'UPCOMING'
      ? 'verified'
      : mark.renewalStage === 'SECTION_25_3'
        ? 'warning'
        : 'gpp_maybe';
  }

  private loadRenewalPreview(agentName: string, displayName: string): void {
    this.agentQuery = displayName;
    this.suggestions.set([]);
    this.previewLoading.set(true);
    this.previewError.set('');
    this.activeFilter.set('all');
    this.agentData.previewPublicAgentRenewals(agentName).subscribe({
      next: (preview) => {
        this.selectedPreview.set(preview);
        this.previewLoading.set(false);
      },
      error: () => {
        this.previewError.set(
          'We could not load this renewal preview. Choose the firm again or try again shortly.',
        );
        this.previewLoading.set(false);
      },
    });
  }

  /** Resolve the visible default through the directory first: its bracketed record code is display-only. */
  private loadDefaultRenewalPreview(): void {
    this.previewLoading.set(true);
    this.previewError.set('');
    this.agentData
      .searchPublicAgentPreview(this.directoryQuery(this.agentQuery))
      .subscribe({
        next: (entries) => {
          const defaultEntry =
            entries.find(
              (entry) =>
                entry.displayName.toUpperCase() ===
                  this.agentQuery.toUpperCase() ||
                entry.agentName.toUpperCase().includes('[16629]'),
            ) ?? entries[0];
          if (!defaultEntry) {
            this.previewError.set(
              'The default firm could not be found in the public registry. Try the search below.',
            );
            this.previewLoading.set(false);
            return;
          }
          this.loadRenewalPreview(defaultEntry.agentName, this.agentQuery);
        },
        error: () => {
          this.previewError.set(
            'We could not load the default firm from the public registry. Please try again.',
          );
          this.previewLoading.set(false);
        },
      });
  }

  /** The bracketed firm code helps people recognise the default record but is not part of its registry name. */
  private directoryQuery(value: string): string {
    return value.replace(/\s*\[\d+\]\s*$/, '').trim();
  }
}

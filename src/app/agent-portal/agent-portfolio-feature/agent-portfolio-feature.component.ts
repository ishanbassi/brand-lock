import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { AgentHomeDirectoryEntry, AgentHomePortfolioPreview, AgentHomeMarkPreview } from '../../../models/agent.model';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentOnboardingIntentService } from '../../shared/services/agent-onboarding-intent.service';
import { AgentPortalFooterComponent } from '../ui/agent-portal-footer.component';
import { AgentPortalNavbarComponent } from '../ui/agent-portal-navbar.component';

const FEATURED_PREVIEWS: readonly AgentHomePortfolioPreview[] = [
  {
    agentName: 'singhania-and-partners',
    displayName: 'Singhania & Partners',
    totalMarks: 1428,
    marks: [
      { name: 'KRONOS PAY', applicationNo: 3912048, tmClass: 36, trademarkStatus: 'Registered' },
      { name: 'AURA FLOW', applicationNo: 2841920, tmClass: 42, trademarkStatus: 'Examination' },
      { name: 'GLOVIA HEALTHCARE', applicationNo: 4108221, tmClass: 5, trademarkStatus: 'Advertised' },
      { name: 'NEXUS CONNECT', applicationNo: 4389201, tmClass: 35, trademarkStatus: 'Objected' },
    ],
  },
  {
    agentName: 'anand-and-anand',
    displayName: 'Anand & Anand',
    totalMarks: 986,
    marks: [
      { name: 'NORTHSTAR SYSTEMS', applicationNo: 4583071, tmClass: 9, trademarkStatus: 'Registered' },
      { name: 'VERDE LIVING', applicationNo: 4726194, tmClass: 20, trademarkStatus: 'Accepted' },
      { name: 'CIRRUS WELLNESS', applicationNo: 4910286, tmClass: 44, trademarkStatus: 'Advertised' },
      { name: 'FORTERRA', applicationNo: 5098142, tmClass: 37, trademarkStatus: 'Formalities Check Pass' },
    ],
  },
];

@Component({
  selector: 'app-agent-portfolio-feature',
  standalone: true,
  imports: [DecimalPipe, FormsModule, AgentPortalNavbarComponent, AgentPortalFooterComponent],
  templateUrl: './agent-portfolio-feature.component.html',
  styleUrl: './agent-portfolio-feature.component.scss',
})
export class AgentPortfolioFeatureComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly agentData = inject(AgentDataService);
  private readonly onboardingIntent = inject(AgentOnboardingIntentService);
  private readonly search$ = new Subject<string>();
  private previewRequestId = 0;
  private demoTimer?: number;
  private demoIndex = 0;
  private demoCharacterCount = 0;
  private demoHoldTicks = 0;
  private demoPhase: 'typing' | 'holding' | 'erasing' = 'typing';

  /** Retained while the original, illustrative simulator markup remains disabled below. */
  readonly selectedAgent = signal<'singhania' | 'anand'>('singhania');
  readonly agentDiscoveryText = computed(() =>
    this.selectedAgent() === 'anand'
      ? '986 marks discovered across 5 TMR offices'
      : '1,428 marks discovered across 5 TMR offices',
  );

  selectAgent(agent: 'singhania' | 'anand'): void {
    this.selectedAgent.set(agent);
  }

  agentQuery = '';
  readonly suggestions = signal<AgentHomeDirectoryEntry[]>([]);
  readonly searching = signal(false);
  readonly searchError = signal('');
  readonly previewLoading = signal(false);
  readonly previewError = signal('');
  readonly selectedPreview = signal<AgentHomePortfolioPreview | null>(FEATURED_PREVIEWS[0]);
  readonly previewSource = signal<'example' | 'public'>('example');
  readonly demoTyping = signal(true);

  constructor() {
    this.search$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap(query => {
          if (query.trim().length < 2) return of<AgentHomeDirectoryEntry[]>([]);
          this.searching.set(true);
          this.searchError.set('');
          return this.agentData.searchPublicAgentPreview(query.trim());
        }),
      )
      .subscribe({
        next: results => {
          this.suggestions.set(results);
          this.searching.set(false);
        },
        error: () => {
          this.suggestions.set([]);
          this.searching.set(false);
          this.searchError.set('We could not search the public register right now. Please try again.');
        },
      });
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.agentQuery = FEATURED_PREVIEWS[0].displayName;
      this.demoTyping.set(false);
      return;
    }
    this.startFeaturedPreviewDemo();
  }

  ngOnDestroy(): void {
    this.stopFeaturedPreviewDemo();
  }

  onAgentQueryChange(query: string): void {
    this.stopFeaturedPreviewDemo();
    this.agentQuery = query;
    this.previewRequestId++;
    this.selectedPreview.set(null);
    this.previewError.set('');
    if (query.trim().length < 2) {
      this.suggestions.set([]);
      this.searchError.set('');
      this.searching.set(false);
      return;
    }
    this.search$.next(query);
  }

  searchNow(): void {
    const query = this.agentQuery.trim();
    if (query.length < 2) {
      this.searchError.set('Type at least two characters to search the public register.');
      return;
    }
    this.search$.next(query);
  }

  selectPublicAgent(entry: AgentHomeDirectoryEntry): void {
    this.stopFeaturedPreviewDemo();
    const requestId = ++this.previewRequestId;
    this.agentQuery = entry.displayName;
    this.suggestions.set([]);
    this.searchError.set('');
    this.previewError.set('');
    this.previewLoading.set(true);
    this.selectedPreview.set(null);
    this.previewSource.set('public');
    this.agentData.previewPublicAgentPortfolio(entry.agentName).subscribe({
      next: preview => {
        if (requestId !== this.previewRequestId) return;
        this.selectedPreview.set(preview);
        this.previewLoading.set(false);
      },
      error: () => {
        if (requestId !== this.previewRequestId) return;
        this.previewError.set('We could not load this portfolio preview. Please choose the firm again.');
        this.previewLoading.set(false);
      },
    });
  }

  clearPreview(input: HTMLInputElement): void {
    this.stopFeaturedPreviewDemo();
    this.previewRequestId++;
    this.agentQuery = '';
    this.suggestions.set([]);
    this.searchError.set('');
    this.previewError.set('');
    this.previewLoading.set(false);
    this.selectedPreview.set(null);
    input.focus();
  }

  markInitials(mark: AgentHomeMarkPreview): string {
    return (mark.name || '?')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(word => word[0])
      .join('')
      .toUpperCase();
  }

  startPreviewOnboarding(): void {
    const preview = this.selectedPreview();
    if (!preview) return;
    this.onboardingIntent.set({ kind: 'agent-preview', agentName: preview.agentName });
    void this.router.navigate(['/create-agent-account']);
  }

  startOnboarding(event: SubmitEvent): void {
    event.preventDefault();
    this.startPreviewOnboarding();
  }

  private startFeaturedPreviewDemo(): void {
    this.selectedPreview.set(FEATURED_PREVIEWS[this.demoIndex]);
    this.previewSource.set('example');
    this.demoTyping.set(true);
    this.demoTimer = window.setInterval(() => this.advanceFeaturedPreviewDemo(), 85);
  }

  private stopFeaturedPreviewDemo(): void {
    if (this.demoTimer !== undefined) window.clearInterval(this.demoTimer);
    this.demoTimer = undefined;
    this.demoTyping.set(false);
  }

  private advanceFeaturedPreviewDemo(): void {
    const name = FEATURED_PREVIEWS[this.demoIndex].displayName;
    if (this.demoPhase === 'typing') {
      this.demoCharacterCount++;
      this.agentQuery = name.slice(0, this.demoCharacterCount);
      if (this.demoCharacterCount === name.length) {
        this.demoPhase = 'holding';
        this.demoHoldTicks = 0;
      }
      return;
    }

    if (this.demoPhase === 'holding') {
      this.demoHoldTicks++;
      if (this.demoHoldTicks >= 24) this.demoPhase = 'erasing';
      return;
    }

    this.demoCharacterCount--;
    this.agentQuery = name.slice(0, this.demoCharacterCount);
    if (this.demoCharacterCount === 0) {
      this.demoIndex = (this.demoIndex + 1) % FEATURED_PREVIEWS.length;
      this.selectedPreview.set(FEATURED_PREVIEWS[this.demoIndex]);
      this.previewSource.set('example');
      this.demoPhase = 'typing';
    }
  }
}


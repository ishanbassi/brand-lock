import { DecimalPipe, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, PLATFORM_ID, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, forkJoin, of, switchMap } from 'rxjs';
import { AgentHomeDirectoryEntry, AgentHomePortfolioPreview, AgentHomeMarkPreview } from '../../../models/agent.model';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentPortalFooterComponent } from '../ui/agent-portal-footer.component';
import { AgentPortalNavbarComponent } from '../ui/agent-portal-navbar.component';
import { AgentPricingPlansComponent } from '../ui/agent-pricing-plans.component';
import { AgentOnboardingModalComponent } from '../ui/agent-onboarding-modal.component';

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
  {
    agentName: 'k-and-s-partners',
    displayName: 'K & S Partners',
    totalMarks: 764,
    marks: [
      { name: 'NIMBUS WORKS', applicationNo: 5349182, tmClass: 9, trademarkStatus: 'Registered' },
      { name: 'HELIOS FOODS', applicationNo: 4937104, tmClass: 30, trademarkStatus: 'Accepted' },
      { name: 'MINTWAVE', applicationNo: 5289027, tmClass: 35, trademarkStatus: 'Advertised' },
      { name: 'ORBITAL CARE', applicationNo: 5062381, tmClass: 44, trademarkStatus: 'Objected' },
    ],
  },
  {
    agentName: 'remfry-and-sagar',
    displayName: 'Remfry & Sagar',
    totalMarks: 1152,
    marks: [
      { name: 'TERRA NOVA', applicationNo: 4629318, tmClass: 3, trademarkStatus: 'Registered' },
      { name: 'CIRCA HOME', applicationNo: 5147390, tmClass: 20, trademarkStatus: 'Examination' },
      { name: 'LOOM & LEAF', applicationNo: 5421067, tmClass: 24, trademarkStatus: 'Advertised' },
      { name: 'VERA WELL', applicationNo: 5261843, tmClass: 5, trademarkStatus: 'Formalities Check Pass' },
    ],
  },
];

@Component({
  selector: 'app-agent-portfolio-feature',
  standalone: true,
  imports: [DecimalPipe, FormsModule, AgentPortalNavbarComponent, AgentPortalFooterComponent, AgentPricingPlansComponent, AgentOnboardingModalComponent],
  templateUrl: './agent-portfolio-feature.component.html',
  styleUrl: './agent-portfolio-feature.component.scss',
})
export class AgentPortfolioFeatureComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly agentData = inject(AgentDataService);
  private readonly search$ = new Subject<string>();
  private previewRequestId = 0;
  private demoTimer?: number;
  private demoIndex = 0;
  private demoCharacterCount = 0;
  private demoHoldTicks = 0;
  private demoPhase: 'typing' | 'holding' | 'erasing' = 'typing';
  private previewTransitionTimer?: number;
  @ViewChild('agentInput') private agentInput?: ElementRef<HTMLInputElement>;

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
  readonly selectedAgentVariations = signal<AgentHomeDirectoryEntry[]>([]);
  readonly searching = signal(false);
  readonly searchError = signal('');
  readonly previewLoading = signal(false);
  readonly previewError = signal('');
  readonly selectedPreview = signal<AgentHomePortfolioPreview | null>(FEATURED_PREVIEWS[0]);
  readonly previewSource = signal<'example' | 'public'>('example');
  readonly demoTyping = signal(true);
  readonly previewTransitioning = signal(false);
  readonly onboardingModalOpen = signal(false);

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

  isAgentVariationSelected(entry: AgentHomeDirectoryEntry): boolean {
    return this.selectedAgentVariations().some(selected => selected.agentName === entry.agentName);
  }

  selectedAgentNames(): string[] {
    return this.selectedAgentVariations().map(entry => entry.agentName);
  }

  toggleAgentVariation(entry: AgentHomeDirectoryEntry): void {
    this.stopFeaturedPreviewDemo();
    const selected = this.selectedAgentVariations();
    this.selectedAgentVariations.set(
      this.isAgentVariationSelected(entry)
        ? selected.filter(candidate => candidate.agentName !== entry.agentName)
        : [...selected, entry],
    );
    this.selectedPreview.set(null);
    this.previewError.set('');
  }

  previewSelectedVariations(): void {
    const selections = this.selectedAgentVariations();
    if (!selections.length) return;

    const requestId = ++this.previewRequestId;
    this.suggestions.set([]);
    this.searchError.set('');
    this.previewError.set('');
    this.previewLoading.set(true);
    this.selectedPreview.set(null);
    this.previewSource.set('public');
    forkJoin(selections.map(entry => this.agentData.previewPublicAgentPortfolio(entry.agentName))).subscribe({
      next: previews => {
        if (requestId !== this.previewRequestId) return;
        this.selectedPreview.set({
          agentName: selections[0].agentName,
          displayName: selections.length === 1 ? previews[0].displayName : `${selections.length} selected name variations`,
          totalMarks: previews.reduce((total, preview) => total + preview.totalMarks, 0),
          marks: previews.flatMap(preview => preview.marks).slice(0, 4),
        });
        this.previewLoading.set(false);
      },
      error: () => {
        if (requestId !== this.previewRequestId) return;
        this.previewError.set('We could not load this portfolio preview. Please choose the names again.');
        this.previewLoading.set(false);
      },
    });
  }

  focusPortfolioSearch(): void {
    this.stopFeaturedPreviewDemo();
    if (this.previewSource() === 'example') {
      this.agentQuery = '';
      this.suggestions.set([]);
      this.searchError.set('');
      this.previewError.set('');
      this.selectedPreview.set(null);
    }
    const input = this.agentInput?.nativeElement;
    if (!input) return;

    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => input.focus(), 300);
  }

  clearPreview(input: HTMLInputElement): void {
    this.stopFeaturedPreviewDemo();
    this.previewRequestId++;
    this.agentQuery = '';
    this.suggestions.set([]);
    this.selectedAgentVariations.set([]);
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
    this.openPreviewOnboardingModal();
  }

  openPreviewOnboardingModal(): void {
    if (!this.selectedPreview()) return;
    this.onboardingModalOpen.set(true);
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
    if (this.previewTransitionTimer !== undefined) window.clearTimeout(this.previewTransitionTimer);
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
      this.previewTransitioning.set(true);
      this.selectedPreview.set(FEATURED_PREVIEWS[this.demoIndex]);
      this.previewTransitionTimer = window.setTimeout(() => this.previewTransitioning.set(false), 280);
      this.previewSource.set('example');
      this.demoPhase = 'typing';
    }
  }
}


import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, PLATFORM_ID, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, forkJoin, of, switchMap } from 'rxjs';
import {
  AgentHomeDirectoryEntry,
  AgentHomeLiveSnapshot,
  AgentHomePortfolioPreview,
} from '../../../models/agent.model';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentOnboardingIntentService } from '../../shared/services/agent-onboarding-intent.service';
import { AgentPortalNavbarComponent } from '../ui/agent-portal-navbar.component';
import { AgentPortalFooterComponent } from '../ui/agent-portal-footer.component';
import { AgentPricingPlansComponent } from '../ui/agent-pricing-plans.component';
import { AgentOnboardingModalComponent } from '../ui/agent-onboarding-modal.component';

@Component({
  selector: 'app-agent-home',
  standalone: true,
imports: [CommonModule, FormsModule, AgentPortalNavbarComponent, AgentPortalFooterComponent, AgentPricingPlansComponent, AgentOnboardingModalComponent],
  templateUrl: './agent-home.component.html',
  styleUrl: './agent-home.component.scss',
})
export class AgentHomeComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly agentData = inject(AgentDataService);
  private readonly onboardingIntent = inject(AgentOnboardingIntentService);
  private readonly search$ = new Subject<string>();
  private liveRefreshTimer?: number;
  private liveRotationTimer?: number;
  @ViewChild('heroAgentInput') private heroAgentInput?: ElementRef<HTMLInputElement>;
  @ViewChild('pricingPlans') private pricingPlans?: ElementRef<HTMLElement>;

  agentQuery = '';
  readonly suggestions = signal<AgentHomeDirectoryEntry[]>([]);
  readonly selectedAgentVariations = signal<AgentHomeDirectoryEntry[]>([]);
  readonly searching = signal(false);
  readonly searchError = signal('');
  readonly previewLoading = signal(false);
  readonly previewError = signal('');
  readonly selectedPreview = signal<AgentHomePortfolioPreview | null>(null);
  readonly liveSnapshots = signal<AgentHomeLiveSnapshot[]>([]);
  readonly liveSnapshotIndex = signal(0);
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
          this.searchError.set('We could not search the register right now. Please try again.');
          this.suggestions.set([]);
          this.searching.set(false);
        },
      });
  }

  ngOnInit(): void {
    this.title.setTitle('Trademarx Agent Portal | Trademark practice intelligence');
    this.meta.updateTag({
      name: 'description',
      content: 'A dedicated workspace for trademark practitioners to organise portfolios, monitor the journal, and manage deadlines.',
    });

    if (isPlatformBrowser(this.platformId)) {
      this.refreshLiveSnapshots();
      this.liveRefreshTimer = window.setInterval(() => this.refreshLiveSnapshots(), 60_000);
      this.liveRotationTimer = window.setInterval(() => this.advanceLiveSnapshot(), 8_000);
    }
  }

  ngOnDestroy(): void {
    if (this.liveRefreshTimer) window.clearInterval(this.liveRefreshTimer);
    if (this.liveRotationTimer) window.clearInterval(this.liveRotationTimer);
  }

  onAgentQueryChange(query: string): void {
    this.agentQuery = query;
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
      this.searchError.set('Type at least two characters to search the register.');
      return;
    }
    this.search$.next(query);
  }

  focusPortfolioSearch(): void {
    const input = this.heroAgentInput?.nativeElement;
    if (!input) return;
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => input.focus(), 300);
  }

  scrollToPricing(): void {
    this.pricingPlans?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  isAgentVariationSelected(entry: AgentHomeDirectoryEntry): boolean {
    return this.selectedAgentVariations().some(selected => selected.agentName === entry.agentName);
  }

  selectedAgentNames(): string[] {
    return this.selectedAgentVariations().map(entry => entry.agentName);
  }

  toggleAgentVariation(entry: AgentHomeDirectoryEntry): void {
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

    this.suggestions.set([]);
    this.previewLoading.set(true);
    this.previewError.set('');
    this.selectedPreview.set(null);
    forkJoin(selections.map(entry => this.agentData.previewPublicAgentPortfolio(entry.agentName))).subscribe({
      next: previews => {
        this.selectedPreview.set({
          agentName: selections[0].agentName,
          displayName: selections.length === 1 ? previews[0].displayName : `${selections.length} selected name variations`,
          totalMarks: previews.reduce((total, preview) => total + preview.totalMarks, 0),
          marks: previews.flatMap(preview => preview.marks).slice(0, 4),
        });
        this.previewLoading.set(false);
      },
      error: () => {
        this.previewError.set('We could not load this portfolio preview. Please choose the names again.');
        this.previewLoading.set(false);
      },
    });
  }

  beginPortfolioOnboarding(): void {
    if (this.selectedAgentVariations().length) {
      this.previewSelectedVariations();
      return;
    }
    this.searchNow();
  }

  startAgentOnboarding(): void {
    const preview = this.selectedPreview();
    if (!preview) return;
    this.openOnboardingModal();
  }

  openPricingOnboarding(): void {
    this.openOnboardingModal();
  }

  private openOnboardingModal(): void {
    this.onboardingModalOpen.set(true);
  }

  startSpreadsheetOnboarding(): void {
    this.onboardingIntent.set({ kind: 'spreadsheet' });
    void this.router.navigate(['/create-agent-account']);
  }


  liveSnapshot(): AgentHomeLiveSnapshot | null {
    const snapshots = this.liveSnapshots();
    return snapshots.length ? snapshots[this.liveSnapshotIndex() % snapshots.length] : null;
  }

  toggleFaq(event: MouseEvent): void {
    const trigger = event.currentTarget as HTMLElement | null;
    trigger?.nextElementSibling?.classList.toggle('hidden');
  }


  private refreshLiveSnapshots(): void {
    this.agentData.livePublicAgentSnapshots().subscribe({
      next: snapshots => {
        this.liveSnapshots.set(snapshots);
        this.liveSnapshotIndex.set(0);
      },
      error: () => this.liveSnapshots.set([]),
    });
  }

  private advanceLiveSnapshot(): void {
    if (this.liveSnapshots().length > 1) this.liveSnapshotIndex.update(index => index + 1);
  }
}

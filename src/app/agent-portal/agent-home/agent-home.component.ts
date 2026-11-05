import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import {
  AgentHomeDirectoryEntry,
  AgentHomeLiveSnapshot,
  AgentHomePortfolioPreview,
} from '../../../models/agent.model';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentOnboardingIntentService } from '../../shared/services/agent-onboarding-intent.service';
import { AgentPortalNavbarComponent } from '../ui/agent-portal-navbar.component';
import { AgentPortalFooterComponent } from '../ui/agent-portal-footer.component';

@Component({
  selector: 'app-agent-home',
  standalone: true,
  imports: [CommonModule, FormsModule, AgentPortalNavbarComponent, AgentPortalFooterComponent],
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
  private annualBilling = true;
  private liveRefreshTimer?: number;
  private liveRotationTimer?: number;

  agentQuery = '';
  readonly suggestions = signal<AgentHomeDirectoryEntry[]>([]);
  readonly searching = signal(false);
  readonly searchError = signal('');
  readonly previewLoading = signal(false);
  readonly previewError = signal('');
  readonly selectedPreview = signal<AgentHomePortfolioPreview | null>(null);
  readonly liveSnapshots = signal<AgentHomeLiveSnapshot[]>([]);
  readonly liveSnapshotIndex = signal(0);

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

  selectAgent(entry: AgentHomeDirectoryEntry): void {
    this.agentQuery = entry.displayName;
    this.suggestions.set([]);
    this.previewLoading.set(true);
    this.previewError.set('');
    this.agentData.previewPublicAgentPortfolio(entry.agentName).subscribe({
      next: preview => {
        this.selectedPreview.set(preview);
        this.previewLoading.set(false);
      },
      error: () => {
        this.previewError.set('We could not load this portfolio preview. Please choose the name again.');
        this.previewLoading.set(false);
      },
    });
  }

  startAgentOnboarding(): void {
    const preview = this.selectedPreview();
    if (!preview) return;
    this.onboardingIntent.set({ kind: 'agent-preview', agentName: preview.agentName });
    void this.router.navigate(['/create-agent-account']);
  }

  startSpreadsheetOnboarding(): void {
    this.onboardingIntent.set({ kind: 'spreadsheet' });
    void this.router.navigate(['/create-agent-account']);
  }

  liveSnapshot(): AgentHomeLiveSnapshot | null {
    const snapshots = this.liveSnapshots();
    return snapshots.length ? snapshots[this.liveSnapshotIndex() % snapshots.length] : null;
  }

  togglePricing(): void {
    this.annualBilling = !this.annualBilling;
    const toggle = document.getElementById('billingToggle');
    const price = document.getElementById('proPriceVal');
    const period = document.getElementById('proPricePeriod');
    toggle?.classList.toggle('justify-end', this.annualBilling);
    toggle?.classList.toggle('justify-start', !this.annualBilling);
    if (price) price.textContent = this.annualBilling ? 'INR 999' : 'INR 1,500';
    if (period) period.textContent = this.annualBilling ? '/ month (INR 12,000 billed annually)' : '/ month (Billed monthly)';
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

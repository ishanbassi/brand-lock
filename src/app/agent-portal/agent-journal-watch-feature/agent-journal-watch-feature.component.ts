import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ITrademark } from '../../../models/trademark.model';
import { TrademarkService } from '../../shared/services/trademark.service';
import { AgentPortalFooterComponent } from '../ui/agent-portal-footer.component';
import { AgentPortalNavbarComponent } from '../ui/agent-portal-navbar.component';
import { AgentPricingPlansComponent } from '../ui/agent-pricing-plans.component';
import { AgentOnboardingModalComponent } from '../ui/agent-onboarding-modal.component';

type JournalSummary = {
  journalNo: number;
  count: number;
  publishedDate: string;
};

@Component({
  selector: 'app-agent-journal-watch-feature',
  standalone: true,
  imports: [DecimalPipe, RouterLink, AgentPortalNavbarComponent, AgentPortalFooterComponent, AgentPricingPlansComponent, AgentOnboardingModalComponent],
  templateUrl: './agent-journal-watch-feature.component.html',
  styleUrl: './agent-journal-watch-feature.component.scss',
})
export class AgentJournalWatchFeatureComponent implements OnInit {
  private readonly trademarkService = inject(TrademarkService);

  readonly latestIssue = signal<JournalSummary | null>(null);
  readonly journalEntries = signal<ITrademark[]>([]);
  readonly loading = signal(true);
  readonly entriesLoading = signal(false);
  readonly loadError = signal('');
  readonly onboardingModalOpen = signal(false);

  ngOnInit(): void {
    // Use the same unauthenticated source as the public Trade Marks Journal page.
    // Journal Watch only displays published registry data here; portfolio matching remains private.
    this.trademarkService.getJournalSummaries({ page: 0, size: 1 }).subscribe({
      next: response => {
        const latestIssue = response.body?.[0] as JournalSummary | undefined;
        this.latestIssue.set(latestIssue ?? null);
        if (latestIssue?.journalNo != null) this.loadJournalEntries(latestIssue.journalNo);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('The latest journal issue could not be loaded. Please try again later.');
        this.loading.set(false);
      },
    });
  }

  latestJournal(): number | null {
    return this.latestIssue()?.journalNo ?? null;
  }

  private loadJournalEntries(journalNo: number): void {
    this.entriesLoading.set(true);
    this.trademarkService.queryByJournal(journalNo, {
      page: 0,
      size: 6,
      sort: 'applicationNo,desc',
    }).subscribe({
      next: response => {
        this.journalEntries.set(response.body ?? []);
        this.entriesLoading.set(false);
      },
      error: () => {
        this.journalEntries.set([]);
        this.entriesLoading.set(false);
      },
    });
  }
}

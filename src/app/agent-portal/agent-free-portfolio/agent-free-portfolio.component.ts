import { Component, OnInit, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { AgentOnboardingModalComponent } from '../ui/agent-onboarding-modal.component';
import { AgentPortalFooterComponent } from '../ui/agent-portal-footer.component';
import { AgentPortalNavbarComponent } from '../ui/agent-portal-navbar.component';

@Component({
  selector: 'app-agent-free-portfolio',
  standalone: true,
  imports: [AgentPortalNavbarComponent, AgentPortalFooterComponent, AgentOnboardingModalComponent],
  templateUrl: './agent-free-portfolio.component.html',
  styleUrl: './agent-free-portfolio.component.scss',
})
export class AgentFreePortfolioComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly onboardingModalOpen = signal(false);

  ngOnInit(): void {
    this.title.setTitle('Free Trademark Portfolio Management Software | Trademarx');
    this.meta.updateTag({
      name: 'description',
      content: 'Free trademark portfolio management software for attorneys and boutique IP practices. Manage up to 100 trademarks with journal conflict alerts, deadlines and client reports.',
    });
  }

  openOnboardingModal(): void {
    this.onboardingModalOpen.set(true);
  }
}

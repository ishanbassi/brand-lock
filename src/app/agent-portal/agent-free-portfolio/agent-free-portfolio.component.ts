import { Component, signal } from '@angular/core';
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
export class AgentFreePortfolioComponent {
  readonly onboardingModalOpen = signal(false);

  openOnboardingModal(): void {
    this.onboardingModalOpen.set(true);
  }
}

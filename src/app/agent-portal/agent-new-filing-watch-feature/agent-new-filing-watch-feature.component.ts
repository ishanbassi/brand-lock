import { Component, signal } from '@angular/core';
import { AgentPortalFooterComponent } from '../ui/agent-portal-footer.component';
import { AgentPortalNavbarComponent } from '../ui/agent-portal-navbar.component';
import { AgentOnboardingModalComponent } from '../ui/agent-onboarding-modal.component';
import { AgentPricingPlansComponent } from '../ui/agent-pricing-plans.component';

@Component({
  selector: 'app-agent-new-filing-watch-feature',
  standalone: true,
  imports: [
    AgentPortalNavbarComponent,
    AgentPortalFooterComponent,
    AgentOnboardingModalComponent,
    AgentPricingPlansComponent,
  ],
  templateUrl: './agent-new-filing-watch-feature.component.html',
  styleUrl: './agent-new-filing-watch-feature.component.scss',
})
export class AgentNewFilingWatchFeatureComponent {
  readonly onboardingModalOpen = signal(false);

  startOnboarding(event: SubmitEvent): void {
    event.preventDefault();
    this.onboardingModalOpen.set(true);
  }
}


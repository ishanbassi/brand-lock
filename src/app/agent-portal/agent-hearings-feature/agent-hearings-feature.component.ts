import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AgentPortalFooterComponent } from '../ui/agent-portal-footer.component';
import { AgentPortalNavbarComponent } from '../ui/agent-portal-navbar.component';
import { AgentOnboardingModalComponent } from '../ui/agent-onboarding-modal.component';

@Component({
  selector: 'app-agent-hearings-feature',
  standalone: true,
  imports: [RouterLink, AgentPortalNavbarComponent, AgentPortalFooterComponent, AgentOnboardingModalComponent],
  templateUrl: './agent-hearings-feature.component.html',
  styleUrl: './agent-hearings-feature.component.scss',
})
export class AgentHearingsFeatureComponent {
  readonly onboardingModalOpen = signal(false);
}

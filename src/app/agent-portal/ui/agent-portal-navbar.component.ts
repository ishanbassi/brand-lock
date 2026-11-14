import { Component, Input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AgentOnboardingModalComponent } from './agent-onboarding-modal.component';

@Component({
  selector: 'app-agent-portal-navbar',
  standalone: true,
  imports: [RouterLink, AgentOnboardingModalComponent],
  templateUrl: './agent-portal-navbar.component.html',
  styleUrl: './agent-portal-navbar.component.scss',
})
export class AgentPortalNavbarComponent {
  /** Identifies the highlighted navigation item on marketing feature pages. */
  @Input() activeLink = 'features';

  readonly onboardingModalOpen = signal(false);
  readonly onboardingMode = signal<'sign-up' | 'sign-in'>('sign-up');

  openOnboarding(mode: 'sign-up' | 'sign-in'): void {
    this.onboardingMode.set(mode);
    this.onboardingModalOpen.set(true);
  }
}

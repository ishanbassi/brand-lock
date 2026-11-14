import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AgentPortalFooterComponent } from '../ui/agent-portal-footer.component';
import { AgentPortalNavbarComponent } from '../ui/agent-portal-navbar.component';
import { AgentPricingPlansComponent } from '../ui/agent-pricing-plans.component';

@Component({
  selector: 'app-agent-new-filing-watch-feature',
  standalone: true,
  imports: [AgentPortalNavbarComponent, AgentPortalFooterComponent, AgentPricingPlansComponent],
  templateUrl: './agent-new-filing-watch-feature.component.html',
  styleUrl: './agent-new-filing-watch-feature.component.scss',
})
export class AgentNewFilingWatchFeatureComponent {
  private readonly router = inject(Router);

  startOnboarding(event: SubmitEvent): void {
    event.preventDefault();
    void this.router.navigate(['/create-agent-account']);
  }
}


import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AgentPortalFooterComponent } from '../ui/agent-portal-footer.component';
import { AgentPortalNavbarComponent } from '../ui/agent-portal-navbar.component';

@Component({
  selector: 'app-agent-renewal-docket-feature',
  standalone: true,
  imports: [AgentPortalNavbarComponent, AgentPortalFooterComponent],
  templateUrl: './agent-renewal-docket-feature.component.html',
  styleUrl: './agent-renewal-docket-feature.component.scss',
})
export class AgentRenewalDocketFeatureComponent {
  private readonly router = inject(Router);

  startOnboarding(event: SubmitEvent): void {
    event.preventDefault();
    void this.router.navigate(['/create-agent-account']);
  }
}


import { Component, signal } from '@angular/core';
import { AgentPortalFooterComponent } from '../ui/agent-portal-footer.component';
import { AgentPortalNavbarComponent } from '../ui/agent-portal-navbar.component';

type Competitor = 'all' | 'anand' | 'lall' | 'shardul';

@Component({
  selector: 'app-agent-competitor-watch-feature',
  standalone: true,
  imports: [AgentPortalNavbarComponent, AgentPortalFooterComponent],
  templateUrl: './agent-competitor-watch-feature.component.html',
  styleUrl: './agent-competitor-watch-feature.component.scss',
})
export class AgentCompetitorWatchFeatureComponent {
  readonly selectedCompetitor = signal<Competitor>('all');
  readonly competitorQuery = signal('');
  readonly scanFeedback = signal('');
  readonly scanning = signal(false);

  selectCompetitor(competitor: Competitor): void {
    this.selectedCompetitor.set(competitor);
  }

  agentFilterClasses(competitor: Competitor): string {
    const selected = this.selectedCompetitor() === competitor;
    return `agent-filter px-3 py-1.5 rounded-lg font-label-md text-label-md transition-all ${selected ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`;
  }

  scanCompetitor(): void {
    const query = this.competitorQuery().trim();
    if (!query || this.scanning()) {
      if (!query) this.scanFeedback.set('Enter an agent code or competitor firm to scan recent filings.');
      return;
    }

    this.scanning.set(true);
    this.scanFeedback.set(`Connecting to CGPDTM telemetry for "${query}"...`);
    window.setTimeout(() => {
      this.scanFeedback.set(`Found 14 recent filings for ${query} (Delhi: 6, Mumbai: 5, Ahmedabad: 3). Initializing the 14-day trial sandbox.`);
      this.scanning.set(false);
    }, 1200);
  }
}


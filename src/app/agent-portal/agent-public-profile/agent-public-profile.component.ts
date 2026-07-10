import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentPublicProfile } from '../../../models/agent.model';

@Component({
  selector: 'app-agent-public-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agent-public-profile.component.html',
  styleUrl: './agent-public-profile.component.scss',
})
export class AgentPublicProfileComponent implements OnInit {
  profile = signal<AgentPublicProfile | null>(null);
  loading = signal(true);
  error = signal('');

  constructor(
    private readonly route: ActivatedRoute,
    private readonly agentDataService: AgentDataService,
  ) {}

  ngOnInit(): void {
    const agentCode = this.route.snapshot.paramMap.get('agentCode');
    if (!agentCode) {
      this.error.set('Agent not found.');
      this.loading.set(false);
      return;
    }
    this.agentDataService.getPublicAgentProfile(agentCode).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load agent profile.');
        this.loading.set(false);
      },
    });
  }

  get statusClass(): string {
    const s = this.profile()?.profileStatus?.toLowerCase() ?? '';
    if (s === 'active') return 'status-active';
    if (s === 'suspended') return 'status-suspended';
    return 'status-pending';
  }
}

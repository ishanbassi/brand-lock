import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentDashboardStats, AgentPortfolioTrademark } from '../../../models/agent.model';
import { AuthService } from '../../../models/auth.services';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agent-dashboard.component.html',
  styleUrl: './agent-dashboard.component.scss',
})
export class AgentDashboardComponent implements OnInit {
  stats = signal<AgentDashboardStats | null>(null);
  loading = signal(true);
  error = signal('');

  constructor(
    private readonly agentDataService: AgentDataService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.agentDataService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load dashboard stats.');
        this.loading.set(false);
      },
    });
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  get agentFirstName(): string {
    const user = this.authService.getUser();
    return user?.firstName || 'Agent';
  }

  getStatusBadge(status: string | undefined): string {
    if (!status) return 'unknown';
    const s = status.toLowerCase();
    if (s.includes('register') || s.includes('active') || s.includes('renew')) return 'active';
    if (s.includes('object') || s.includes('oppos')) return 'objected';
    if (s.includes('abandon') || s.includes('refused')) return 'inactive';
    return 'pending';
  }

  trackById(_: number, item: AgentPortfolioTrademark): any {
    return item.id;
  }
}

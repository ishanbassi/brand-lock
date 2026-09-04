import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { WatchConflictHistory } from '../../../models/agent.model';

type RiskFilter = 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';

@Component({
  selector: 'app-agent-conflicts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agent-conflicts.component.html',
  styleUrl: './agent-conflicts.component.scss',
})
export class AgentConflictsComponent implements OnInit {
  conflicts = signal<WatchConflictHistory[]>([]);
  loading = signal(true);
  error = signal('');
  riskFilter = signal<RiskFilter>('ALL');

  visible = computed(() => {
    const filter = this.riskFilter();
    const all = this.conflicts();
    return filter === 'ALL' ? all : all.filter(c => c.riskLevel === filter);
  });

  highRiskCount = computed(() => this.conflicts().filter(c => c.riskLevel === 'HIGH').length);
  mediumRiskCount = computed(() => this.conflicts().filter(c => c.riskLevel === 'MEDIUM').length);

  constructor(private readonly agentDataService: AgentDataService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.agentDataService.getAllConflicts().subscribe({
      next: (data) => {
        this.conflicts.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load conflicts.');
        this.loading.set(false);
      },
    });
  }

  setFilter(f: RiskFilter): void {
    this.riskFilter.set(f);
  }

  scorePercent(score?: number): number {
    return Math.round((score ?? 0) * 100);
  }

  riskClass(level?: string): string {
    return level === 'HIGH' ? 'risk-high' : level === 'MEDIUM' ? 'risk-medium' : 'risk-low';
  }
}

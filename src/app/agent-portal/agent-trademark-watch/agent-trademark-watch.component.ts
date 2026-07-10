import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { TrademarkConflict, AgentPortfolioTrademark, WatchConflictHistory } from '../../../models/agent.model';

@Component({
  selector: 'app-agent-trademark-watch',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agent-trademark-watch.component.html',
  styleUrl: './agent-trademark-watch.component.scss',
})
export class AgentTrademarkWatchComponent implements OnInit {
  trademark = signal<AgentPortfolioTrademark | null>(null);
  conflicts = signal<TrademarkConflict[]>([]);
  conflictHistory = signal<WatchConflictHistory[]>([]);
  loading = signal(true);
  error = signal('');
  showHistory = signal(false);

  id!: number;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly agentDataService: AgentDataService,
  ) {}

  ngOnInit(): void {
    this.id = parseInt(this.route.snapshot.paramMap.get('id')!, 10);
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.agentDataService.getPortfolioItem(this.id).subscribe({
      next: (tm) => {
        this.trademark.set(tm);
        this.loadConflicts();
      },
      error: () => {
        this.error.set('Failed to load trademark.');
        this.loading.set(false);
      },
    });
  }

  loadConflicts(): void {
    this.agentDataService.getConflicts(this.id).subscribe({
      next: (data) => {
        this.conflicts.set(data);
        this.loading.set(false);
        this.loadConflictHistory();
      },
      error: () => {
        this.error.set('Failed to load conflict results.');
        this.loading.set(false);
      },
    });
  }

  loadConflictHistory(): void {
    this.agentDataService.getConflictHistory(this.id).subscribe({
      next: (history) => this.conflictHistory.set(history),
      error: () => {},
    });
  }

  toggleHistory(): void {
    this.showHistory.update(v => !v);
  }

  getScore(c: TrademarkConflict): number {
    return c.score ?? c.similarityScore ?? 0;
  }

  getRiskLabelForConflict(c: TrademarkConflict): 'HIGH' | 'MEDIUM' | 'LOW' {
    return this.getRiskLabel(this.getScore(c));
  }

  getRiskClassForConflict(c: TrademarkConflict): string {
    return this.getRiskClass(this.getScore(c));
  }

  scorePercentForConflict(c: TrademarkConflict): number {
    return this.scorePercent(this.getScore(c));
  }

  getRiskLabel(score: number): 'HIGH' | 'MEDIUM' | 'LOW' {
    if (score >= 0.85) return 'HIGH';
    if (score >= 0.70) return 'MEDIUM';
    return 'LOW';
  }

  getRiskClass(score: number): string {
    const r = this.getRiskLabel(score);
    return r === 'HIGH' ? 'risk-high' : r === 'MEDIUM' ? 'risk-medium' : 'risk-low';
  }

  scorePercent(score: number): number {
    return Math.round(score * 100);
  }

  get highRiskCount(): number {
    return this.conflicts().filter(c => this.getScore(c) >= 0.85).length;
  }

  get mediumRiskCount(): number {
    return this.conflicts().filter(c => { const s = this.getScore(c); return s >= 0.70 && s < 0.85; }).length;
  }
}

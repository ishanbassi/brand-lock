import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentDashboardStats, AgentPortfolioTrademark, AgentStatusCount } from '../../../models/agent.model';
import { AuthService } from '../../../models/auth.services';

/**
 * Bucket key to the colour it is drawn in, everywhere it appears.
 *
 * One map rather than a palette array so a slice and its stat card always agree: with an array,
 * the chart's colour is positional and the card's is looked up, and the two silently diverge the
 * moment a bucket is added or reordered.
 */
const BUCKET_COLORS: Record<AgentStatusCount['key'], string> = {
  REGISTERED: '#10b981',
  UNDER_EXAMINATION_OR_ADVERTISED: '#6366f1',
  OBJECTED_OR_OPPOSED: '#f59e0b',
  ABANDONED_WITHDRAWN_REJECTED: '#ef4444',
  OTHER_UNKNOWN: '#94a3b8',
};

const BUCKET_ICONS: Record<AgentStatusCount['key'], string> = {
  REGISTERED: '✅',
  UNDER_EXAMINATION_OR_ADVERTISED: '🔍',
  OBJECTED_OR_OPPOSED: '⚠️',
  ABANDONED_WITHDRAWN_REJECTED: '⛔',
  OTHER_UNKNOWN: '❔',
};

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './agent-dashboard.component.html',
  styleUrl: './agent-dashboard.component.scss',
})
export class AgentDashboardComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);

  /** Chart.js measures a canvas, so the chart is browser-only and the server renders the legend. */
  readonly isBrowser = isPlatformBrowser(this.platformId);

  stats = signal<AgentDashboardStats | null>(null);
  loading = signal(true);
  error = signal('');

  /** Buckets in the order they are shown, largest first, with colour and icon attached. */
  statusRows = computed(() => {
    const breakdown = this.stats()?.statusBreakdown ?? [];
    return [...breakdown]
      .sort((a, b) => b.count - a.count)
      .map(row => ({
        ...row,
        color: BUCKET_COLORS[row.key] ?? BUCKET_COLORS.OTHER_UNKNOWN,
        icon: BUCKET_ICONS[row.key] ?? BUCKET_ICONS.OTHER_UNKNOWN,
        share: this.shareOf(row.count),
      }));
  });

  /**
   * Empty buckets are dropped from the chart but kept as cards.
   *
   * A doughnut with zero-width slices renders a legend of things that are not there, while a card
   * reading 0 is the useful answer to "how many are opposed?" — so the two views differ on purpose.
   */
  doughnutData = computed<ChartData<'doughnut', number[], string>>(() => {
    const rows = this.statusRows().filter(r => r.count > 0);
    return {
      labels: rows.map(r => r.label),
      datasets: [
        {
          data: rows.map(r => r.count),
          backgroundColor: rows.map(r => r.color),
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };
  });

  readonly doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '62%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => {
            const value = ctx.parsed;
            return ` ${ctx.label}: ${value} (${this.shareOf(value)}%)`;
          },
        },
      },
    },
  };

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

  /** Percentage of the portfolio, rounded to a whole number. */
  private shareOf(count: number): number {
    const total = this.stats()?.totalTrademarks ?? 0;
    return total > 0 ? Math.round((count / total) * 100) : 0;
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

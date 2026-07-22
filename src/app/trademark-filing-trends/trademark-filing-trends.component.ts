import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { SeoService } from '../shared/services/seo.service';
import {
  IClassBreakdown,
  IJournalActivity,
  IStatusBreakdown,
  ITrendsPage,
  ITrendsSummary,
  TrademarkTrendsService,
} from '../shared/services/trademark-trends.service';

type RangeOption = '30d' | '90d' | '180d' | '365d';

@Component({
  selector: 'app-trademark-filing-trends',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './trademark-filing-trends.component.html',
  styleUrl: './trademark-filing-trends.component.scss',
})
export class TrademarkFilingTrendsComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly seo = inject(SeoService);
  private readonly trendsService = inject(TrademarkTrendsService);

  /** Chart canvases only ever render in the browser — SSR shows the loading skeleton instead. */
  readonly isBrowser = isPlatformBrowser(this.platformId);

  readonly rangeOptions: { value: RangeOption; label: string }[] = [
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '180d', label: '180 Days' },
    { value: '365d', label: '1 Year' },
  ];
  selectedRange: RangeOption = '90d';

  summary: ITrendsSummary | null = null;
  summaryLoading = true;

  volumeLoading = true;
  volumeError = false;
  volumeChartData: ChartData<'line'> = { labels: [], datasets: [] };
  readonly volumeChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } },
    plugins: { legend: { display: false } },
  };

  classLoading = true;
  classError = false;
  classBreakdown: IClassBreakdown[] = [];
  classChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  readonly classChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
  };

  statusLoading = true;
  statusError = false;
  statusBreakdown: IStatusBreakdown[] = [];
  statusChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  readonly statusChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
  };

  journalLoading = true;
  journalError = false;
  journalActivity: IJournalActivity[] = [];

  private static readonly STATUS_COLORS: Record<string, string> = {
    Registered: '#10b981',
    'Objected / Opposed': '#ef4444',
    'Under Examination / Advertised': '#0ea5e9',
    'Abandoned / Withdrawn / Rejected': '#f59e0b',
    'Other / Unknown': '#94a3b8',
  };

  ngOnInit(): void {
    this.setSeoTags();
    this.loadTrends(false);
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd('trademark-filing-trends');
  }

  onRangeChange(range: RangeOption): void {
    if (range === this.selectedRange) return;
    this.selectedRange = range;
    // Only filing volume + class breakdown are scoped to the selected range server-side,
    // so only those two flicker to a loading state - summary/status/journal stay put.
    this.loadTrends(true);
  }

  /** Fetches everything the page needs in one call. rangeChangeOnly skips resetting the loading/error flags for the range-independent sections. */
  private loadTrends(rangeChangeOnly: boolean): void {
    this.volumeLoading = true;
    this.volumeError = false;
    this.classLoading = true;
    this.classError = false;
    if (!rangeChangeOnly) {
      this.summaryLoading = true;
      this.statusLoading = true;
      this.statusError = false;
      this.journalLoading = true;
      this.journalError = false;
    }

    this.trendsService.getTrendsPage(this.selectedRange, 'day', 10, 12).subscribe({
      next: (res: ITrendsPage) => {
        this.summary = res.summary;
        this.summaryLoading = false;

        this.volumeChartData = {
          labels: res.filingVolume.points.map(p => p.bucketDate),
          datasets: [
            {
              data: res.filingVolume.points.map(p => p.count),
              label: 'Filings',
              fill: true,
              tension: 0.3,
              borderColor: '#0ea5e9',
              backgroundColor: 'rgba(14, 165, 233, 0.12)',
              pointRadius: 0,
            },
          ],
        };
        this.volumeLoading = false;

        this.classBreakdown = res.classBreakdown;
        this.classChartData = {
          labels: res.classBreakdown.map(c => c.className || `Class ${c.tmClass ?? '?'}`),
          datasets: [
            {
              data: res.classBreakdown.map(c => c.count),
              label: 'Filings',
              backgroundColor: '#8b5cf6',
            },
          ],
        };
        this.classLoading = false;

        this.statusBreakdown = res.statusBreakdown;
        this.statusChartData = {
          labels: res.statusBreakdown.map(s => s.bucket),
          datasets: [
            {
              data: res.statusBreakdown.map(s => s.count),
              backgroundColor: res.statusBreakdown.map(s => TrademarkFilingTrendsComponent.STATUS_COLORS[s.bucket] ?? '#94a3b8'),
            },
          ],
        };
        this.statusLoading = false;

        this.journalActivity = res.journalActivity;
        this.journalLoading = false;
      },
      error: () => {
        this.volumeError = true;
        this.volumeLoading = false;
        this.classError = true;
        this.classLoading = false;
        if (!rangeChangeOnly) {
          this.summaryLoading = false;
          this.statusLoading = false;
          this.statusError = true;
          this.journalLoading = false;
          this.journalError = true;
        }
      },
    });
  }

  private setSeoTags(): void {
    const title = 'India Trademark Filing Trends — Volume, Classes & Status Data | Trademarx';
    const description =
      'Explore India trademark filing trends: daily filing volume, the most active NICE classes, status breakdown and journal activity — sourced from the official IP India registry, updated hourly.';
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://trademarx.in/trademark-filing-trends' });
    this.meta.updateTag({ property: 'og:image', content: 'https://trademarx.in/assets/images/trademarx.png' });
    this.seo.setCanonical('https://trademarx.in/trademark-filing-trends');
    this.seo.injectJsonLd(
      [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trademarx.in/' },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Trademark Filing Trends',
              item: 'https://trademarx.in/trademark-filing-trends',
            },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'India Trademark Filing Trends',
          description,
          url: 'https://trademarx.in/trademark-filing-trends',
          isPartOf: { '@type': 'WebSite', name: 'Trademarx', url: 'https://trademarx.in' },
        },
      ],
      'trademark-filing-trends',
    );
  }
}

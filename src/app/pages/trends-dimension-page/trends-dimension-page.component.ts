import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { SeoService } from '../../shared/services/seo.service';
import { IDimensionTrends, TrademarkTrendsService } from '../../shared/services/trademark-trends.service';
import { buildRecentMonths, RecentMonth } from '../../shared/utils/recent-months.util';
import { stateSlug as slugifyState } from '../../shared/utils/trends-slug.util';

/**
 * One programmatic page per state (/trademark-filings/:state) or per NICE class
 * (/trademark-trends/class/:n). The route's data.dimension picks which. Data is a live
 * SSR query — the URL is stable, the numbers refresh on every render, so it never goes stale.
 */
@Component({
  selector: 'app-trends-dimension-page',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './trends-dimension-page.component.html',
  styleUrl: './trends-dimension-page.component.scss',
})
export class TrendsDimensionPageComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly seo = inject(SeoService);
  private readonly trendsService = inject(TrademarkTrendsService);

  readonly isBrowser = isPlatformBrowser(this.platformId);

  dimension: 'state' | 'class' = 'state';
  data: IDimensionTrends | null = null;
  loading = true;

  /** Last 6 complete months, for a compact "Recent Monthly Reports" links row. */
  readonly recentMonths: RecentMonth[] = buildRecentMonths(6);

  volumeChartData: ChartData<'line'> = { labels: [], datasets: [] };
  readonly volumeChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } },
    plugins: { legend: { display: false } },
  };

  ngOnInit(): void {
    this.dimension = (this.route.snapshot.data['dimension'] as 'state' | 'class') ?? 'state';

    const request$ =
      this.dimension === 'state'
        ? this.trendsService.getStateTrends(this.route.snapshot.paramMap.get('state') ?? '')
        : this.trendsService.getClassTrends(Number(this.route.snapshot.paramMap.get('tmClass')));

    request$.subscribe({
      next: res => {
        this.data = res;
        this.loading = false;
        this.volumeChartData = {
          labels: res.filingVolume.map(p => p.bucketDate),
          datasets: [
            {
              data: res.filingVolume.map(p => p.count),
              label: 'Filings',
              fill: true,
              tension: 0.3,
              borderColor: '#0ea5e9',
              backgroundColor: 'rgba(14, 165, 233, 0.12)',
              pointRadius: 0,
            },
          ],
        };
        this.setSeoTags(res);
      },
      error: () => this.router.navigateByUrl('/not-found', { skipLocationChange: true }),
    });
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd('trends-dimension');
    this.seo.removeCanonical();
    this.meta.removeTag("name='robots'");
  }

  /** "Tamil Nadu" -> "tamil-nadu", matching the backend's slugify so the link round-trips. */
  stateSlug(label: string): string {
    return slugifyState(label);
  }

  private setSeoTags(res: IDimensionTrends): void {
    const isState = this.dimension === 'state';
    const url = isState
      ? `https://trademarx.in/trademark-filings/${res.value}`
      : `https://trademarx.in/trademark-trends/class/${res.value}`;
    const title = isState
      ? `Trademark Filings in ${res.displayName} — Trends & Top Classes | Trademarx`
      : `${res.displayName} Trademark Filings in India — Trends | Trademarx`;
    const description = isState
      ? `${res.totalFilings.toLocaleString()} trademark filings from ${res.displayName}: monthly filing volume and the most active NICE classes, sourced live from the official IP India registry.`
      : `${res.totalFilings.toLocaleString()} trademark filings in ${res.displayName}: monthly filing volume and the top filing states, sourced live from the official IP India registry.`;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: 'https://trademarx.in/assets/images/trademarx.png' });
    this.seo.setCanonical(url);
    this.seo.injectJsonLd(
      [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trademarx.in/' },
            { '@type': 'ListItem', position: 2, name: 'Trademark Filing Trends', item: 'https://trademarx.in/trademark-filing-trends' },
            { '@type': 'ListItem', position: 3, name: res.displayName, item: url },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Dataset',
          name: title,
          description,
          url,
          creator: { '@type': 'Organization', name: 'Trademarx' },
          isBasedOn: 'https://ipindia.gov.in',
        },
      ],
      'trends-dimension',
    );
  }
}

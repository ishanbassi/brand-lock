import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { SeoService } from '../shared/services/seo.service';
import {
  IClassBreakdown,
  IJournalActivity,
  INamedBreakdown,
  IStatusBreakdown,
  ITrendsPage,
  ITrendsSummary,
  TrademarkTrendsService,
} from '../shared/services/trademark-trends.service';
import { buildRecentMonths, RecentMonth } from '../shared/utils/recent-months.util';
import { stateSlug as slugifyState } from '../shared/utils/trends-slug.util';
import {
  COLLECTION_LAG_NOTE,
  FaqItem,
  SOURCE_NOTE,
  dateRange,
  faqSchema,
  num,
  share,
  signedPercent,
} from '../shared/utils/trends-copy.util';

type RangeOption = '30d' | '90d' | '180d' | '365d';

@Component({
  selector: 'app-trademark-filing-trends',
  standalone: true,
  imports: [CommonModule, RouterLink, BaseChartDirective],
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

  /** Last 12 complete calendar months, newest first, for the "Monthly Reports" index links. */
  readonly recentMonths: RecentMonth[] = buildRecentMonths(12);

  // Generated prose. The charts are <canvas> and the headline figures are <div>s — neither
  // is readable by a crawler or quotable by an answer engine. These are.
  intro = '';
  windowLabel = '';
  volumeCaption = '';
  classCaption = '';
  statusCaption = '';
  classTrendCaption = '';
  stateCaption = '';
  wordsCaption = '';
  faqs: FaqItem[] = [];

  readonly collectionLagNote = COLLECTION_LAG_NOTE;
  readonly sourceNote = SOURCE_NOTE;

  // Extra insight dimensions — rendered as CSS percentage-bar lists (no extra canvases,
  // so no Chart.js overhead or mobile-overflow risk).
  stateBreakdown: INamedBreakdown[] = [];
  typeBreakdown: INamedBreakdown[] = [];
  orgTypeBreakdown: INamedBreakdown[] = [];
  filingModeBreakdown: INamedBreakdown[] = [];
  usageBreakdown: INamedBreakdown[] = [];
  topWords: INamedBreakdown[] = [];

  // Multi-line "classes over time" chart.
  classTrendData: ChartData<'line'> = { labels: [], datasets: [] };
  readonly classTrendOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: { y: { beginAtZero: true } },
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
  };

  private static readonly SERIES_COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

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

        // Extra dimensions (all part of the same single response).
        this.stateBreakdown = res.stateBreakdown ?? [];
        this.typeBreakdown = res.typeBreakdown ?? [];
        this.orgTypeBreakdown = res.orgTypeBreakdown ?? [];
        this.filingModeBreakdown = res.filingModeBreakdown ?? [];
        this.usageBreakdown = res.usageBreakdown ?? [];
        this.topWords = res.topWords ?? [];

        const trends = res.classTrends ?? [];
        this.classTrendData = {
          labels: trends.length ? trends[0].points.map(p => p.bucketDate) : [],
          datasets: trends.map((s, i) => ({
            data: s.points.map(p => p.count),
            label: s.className || `Class ${s.tmClass}`,
            borderColor: TrademarkFilingTrendsComponent.SERIES_COLORS[i % TrademarkFilingTrendsComponent.SERIES_COLORS.length],
            backgroundColor: 'transparent',
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
          })),
        };

        this.buildCopy(res);
        // Re-inject the schema so the FAQ answers stay consistent with the figures now
        // on screen (the range toggle re-fetches and the numbers change).
        this.setSeoTags();
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

  /** "Tamil Nadu" -> "tamil-nadu", matching the backend's slugify so the link round-trips. */
  stateSlug(label: string): string {
    return slugifyState(label);
  }

  /** Label for the currently selected range, for captions ("last 90 days"). */
  get rangeLabel(): string {
    return this.rangeOptions.find(o => o.value === this.selectedRange)?.label.toLowerCase() ?? this.selectedRange;
  }

  /** Turns the response into the sentences and Q&As the page renders. */
  private buildCopy(res: ITrendsPage): void {
    const s = res.summary;
    this.windowLabel = dateRange(s.windowFrom, s.windowTo);

    const topClass = res.classBreakdown.find(c => c.tmClass !== null) ?? null;
    const topState = res.stateBreakdown.find(x => x.label !== 'Other') ?? null;
    const topType = res.typeBreakdown[0] ?? null;

    const parts: string[] = [
      `${num(s.totalFilingsInRange)} trademark applications were filed in India between ${this.windowLabel}` +
        (s.momChangePercent !== null ? `, ${signedPercent(s.momChangePercent)} on the preceding 30 days.` : '.'),
    ];
    if (topClass) {
      parts.push(
        `${topClass.className || 'Class ' + topClass.tmClass} is the most active NICE class over the ${this.rangeLabel} shown, ` +
          `with ${num(topClass.count)} applications (${topClass.percentage.toFixed(1)}% of the period).`,
      );
    }
    if (topState) {
      parts.push(`${topState.label} files the most applications of any state, ${topState.percentage.toFixed(1)}% of the period's total.`);
    }
    if (topType) {
      parts.push(`${topType.label} marks account for ${topType.percentage.toFixed(1)}% of filings by mark type.`);
    }
    this.intro = parts.join(' ');

    this.volumeCaption = `Daily trademark applications filed in India over the ${this.rangeLabel}, counted by application date. ${COLLECTION_LAG_NOTE}`;
    this.classCaption = `The most-filed NICE classes over the ${this.rangeLabel}, with each class's share of the period's applications.`;
    this.classTrendCaption = `Monthly application volume for the six most active NICE classes over the ${this.rangeLabel}. Months with no filings in a class are plotted as zero.`;
    this.stateCaption = `Applicant states ranked by applications filed over the ${this.rangeLabel}.`;
    this.wordsCaption = `The words appearing most often in Indian trademark names filed over the ${this.rangeLabel}, excluding common company suffixes and filler words.`;

    // The status chart is deliberately computed only from records where the registry has
    // published a status — the large majority have none. Stating the denominator keeps a
    // chart summing to 100% from implying it covers the whole register.
    this.statusCaption =
      s.registryTotalCount > 0
        ? `Based on the ${num(s.statusCapturedCount)} applications (${share(
            s.statusCapturedCount,
            s.registryTotalCount,
          )} of ${num(s.registryTotalCount)} records) for which IP India has published a status. Percentages are shares of that subset, ` +
          'not of the whole register, and this chart is all-time rather than scoped to the range selected above.'
        : '';

    this.faqs = [
      {
        question: 'How many trademarks are filed in India each month?',
        answer: `${num(s.totalFilingsInRange)} trademark applications were filed between ${this.windowLabel}${
          s.momChangePercent !== null ? `, ${signedPercent(s.momChangePercent)} on the preceding 30 days` : ''
        }. Monthly volume varies; this page recalculates from the official register every hour.`,
      },
      ...(topClass
        ? [
            {
              question: 'Which trademark class is filed most in India?',
              answer: `${
                topClass.className || 'Class ' + topClass.tmClass
              } leads over the ${this.rangeLabel}, with ${num(topClass.count)} applications — ${topClass.percentage.toFixed(
                1,
              )}% of the period. Class 35 (business and retail services) and Class 25 (clothing) are consistently among the busiest.`,
            },
          ]
        : []),
      ...(topState
        ? [
            {
              question: 'Which Indian state files the most trademarks?',
              answer: `${topState.label} leads with ${num(topState.count)} applications over the ${this.rangeLabel}, ${topState.percentage.toFixed(
                1,
              )}% of the national total. The state recorded is the applicant's address — an Indian trademark registration is national regardless of where it is filed.`,
            },
          ]
        : []),
      {
        question: 'Where does this trademark data come from?',
        answer: `${SOURCE_NOTE} ${COLLECTION_LAG_NOTE}`,
      },
      {
        question: 'Why do so many records show no trademark status?',
        answer:
          'The registry does not publish a status for every application in the bulk data we index — only a minority carry one. ' +
          `The status chart on this page is computed from the ${num(s.statusCapturedCount)} records that do, so its percentages describe ` +
          'that subset rather than the whole register.',
      },
    ];
  }

  private setSeoTags(): void {
    const title = 'India Trademark Filing Trends — Volume, Classes, States & Status Data | Trademarx';
    const description =
      'Live India trademark filing trends: daily filing volume, most active NICE classes over time, filings by state, applicant & filing-mode splits, the most common words in trademarks, status breakdown and journal activity — sourced from the official IP India registry, updated hourly.';
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://trademarx.in/trademark-filing-trends' });
    this.meta.updateTag({ property: 'og:image', content: 'https://trademarx.in/assets/images/trademarx.png' });
    this.seo.setCanonical('https://trademarx.in/trademark-filing-trends');

    const url = 'https://trademarx.in/trademark-filing-trends';
    const schema: object[] = [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trademarx.in/' },
          { '@type': 'ListItem', position: 2, name: 'Trademark Filing Trends', item: url },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: 'India Trademark Filing Trends',
        description,
        url,
        spatialCoverage: { '@type': 'Place', name: 'India' },
        ...(this.summary ? { temporalCoverage: `${this.summary.windowFrom}/${this.summary.windowTo}` } : {}),
        ...(this.summary
          ? {
              variableMeasured: [
                { '@type': 'PropertyValue', name: 'Trademark applications (last 30 days)', value: this.summary.totalFilingsInRange },
                { '@type': 'PropertyValue', name: 'Records in national register', value: this.summary.registryTotalCount },
              ],
            }
          : {}),
        dateModified: new Date().toISOString().slice(0, 10),
        license: 'https://creativecommons.org/licenses/by/4.0/',
        isAccessibleForFree: true,
        creator: { '@type': 'Organization', name: 'Trademarx', url: 'https://trademarx.in' },
        includedInDataCatalog: { '@type': 'DataCatalog', name: 'IP India Trade Marks Register', url: 'https://ipindia.gov.in' },
        isBasedOn: 'https://ipindia.gov.in',
        isPartOf: { '@type': 'WebSite', name: 'Trademarx', url: 'https://trademarx.in' },
      },
    ];
    if (this.faqs.length) {
      schema.push(faqSchema(this.faqs));
    }

    // injectJsonLd is a no-op when a block with this id is already present, so drop the
    // previous one first — this runs again once the data (and the range toggle) resolve.
    this.seo.removeJsonLd('trademark-filing-trends');
    this.seo.injectJsonLd(schema, 'trademark-filing-trends');
  }
}

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
import {
  COLLECTION_LAG_NOTE,
  FaqItem,
  SOURCE_NOTE,
  dateRange,
  faqSchema,
  hl,
  num,
  share,
} from '../../shared/utils/trends-copy.util';

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

  /** Generated-from-the-data prose, so the page's findings exist as quotable sentences. */
  intro = '';
  volumeCaption = '';
  breakdownCaption = '';
  windowLabel = '';
  faqs: FaqItem[] = [];

  readonly collectionLagNote = COLLECTION_LAG_NOTE;
  readonly sourceNote = SOURCE_NOTE;

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
        this.buildCopy(res);
        this.setSeoTags(res);
      },
      error: () => this.router.navigateByUrl('/not-found', { skipLocationChange: true }),
    });
  }

  /**
   * Turns the DTO into the sentences the page shows. Templated off values that differ per
   * page (name, totals, leading category) rather than a fixed sentence with a number
   * swapped in, so the ~80 state and class pages don't read as one duplicated page.
   */
  private buildCopy(res: IDimensionTrends): void {
    const isState = this.dimension === 'state';
    const top = res.breakdown.find(b => !b.label.startsWith('Other')) ?? null;
    const second = res.breakdown.filter(b => !b.label.startsWith('Other'))[1] ?? null;
    this.windowLabel = dateRange(res.windowFrom, res.windowTo);

    // HTML: hl() lifts each figure out of the running text. See trends-copy.util.
    const where = isState ? `from applicants in ${res.displayName}` : `in ${res.displayName}`;
    const lead =
      `The IP India register holds ${hl(num(res.totalFilings))} trademark applications ${where}, ` +
      `of which ${hl(num(res.filingsInWindow))} were filed in the ${hl(this.windowLabel)} window charted below.`;

    let leader = '';
    if (top) {
      leader = isState
        ? ` The most-filed category is ${hl(top.label)}, accounting for ${hl(share(top.count, res.totalFilings))} of the state's filings`
        : ` Filings are led by ${hl(top.label)}, which accounts for ${hl(share(top.count, res.totalFilings))} of the class`;
      leader += second ? `, followed by ${hl(second.label)} at ${hl(share(second.count, res.totalFilings))}.` : '.';
    }

    this.intro = lead + leader;

    this.volumeCaption = `Monthly trademark applications ${where}, ${this.windowLabel}. ${
      res.filingVolume.length ? `${res.filingVolume.length} monthly data points.` : ''
    }`;

    this.breakdownCaption = isState
      ? `NICE classes ranked by all-time filings from ${res.displayName}, with each class's share of the state total.`
      : `States ranked by all-time filings in ${res.displayName}, with each state's share of the class total.`;

    this.faqs = isState ? this.stateFaqs(res, top) : this.classFaqs(res, top);
  }

  private stateFaqs(res: IDimensionTrends, top: { label: string; count: number } | null): FaqItem[] {
    return [
      {
        question: `How many trademarks have been filed in ${res.displayName}?`,
        answer: `${num(res.totalFilings)} trademark applications from ${res.displayName} appear in the IP India register, ${num(
          res.filingsInWindow,
        )} of them in the ${this.windowLabel} window shown on this page.`,
      },
      ...(top
        ? [
            {
              question: `Which trademark class is most used in ${res.displayName}?`,
              answer: `${top.label} is the most-filed class in ${res.displayName}, with ${num(
                top.count,
              )} applications — ${share(top.count, res.totalFilings)} of all filings from the state.`,
            },
          ]
        : []),
      {
        question: `Do I have to file a trademark in ${res.displayName} to protect it there?`,
        answer:
          'No. An Indian trademark registration is national: one application filed at any registry office protects the mark across all of India, ' +
          `including ${res.displayName}. The state recorded on an application is the applicant's address, not the scope of protection.`,
      },
      {
        question: 'How current is this data?',
        answer: `${COLLECTION_LAG_NOTE} ${SOURCE_NOTE}`,
      },
    ];
  }

  private classFaqs(res: IDimensionTrends, top: { label: string; count: number } | null): FaqItem[] {
    return [
      {
        question: `How many trademarks are registered under ${res.displayName}?`,
        answer: `The register holds ${num(res.totalFilings)} applications in ${res.displayName}, ${num(
          res.filingsInWindow,
        )} of them filed during ${this.windowLabel}.`,
      },
      ...(top
        ? [
            {
              question: `Where are ${res.displayName} trademarks filed from?`,
              answer: `${top.label} leads filings in ${res.displayName} with ${num(top.count)} applications, ${share(
                top.count,
                res.totalFilings,
              )} of the class total.`,
            },
          ]
        : []),
      {
        question: `Do I need more than one class for my ${res.displayName.toLowerCase()} business?`,
        answer:
          'Each NICE class covers a distinct set of goods or services, and protection only extends to the classes you file in. ' +
          'A business that both manufactures and sells, or that offers a service alongside a product, usually needs more than one class — ' +
          'each is charged as a separate application by the registry.',
      },
      {
        question: 'How current is this data?',
        answer: `${COLLECTION_LAG_NOTE} ${SOURCE_NOTE}`,
      },
    ];
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
          // Spelled out rather than left to inference: temporal/spatial coverage and the
          // measured variables are what make a Dataset node eligible for dataset search
          // and quotable by answer engines.
          temporalCoverage: `${res.windowFrom}/${res.windowTo}`,
          spatialCoverage: isState
            ? { '@type': 'Place', name: `${res.displayName}, India` }
            : { '@type': 'Place', name: 'India' },
          variableMeasured: [
            { '@type': 'PropertyValue', name: 'Trademark applications (all time)', value: res.totalFilings },
            { '@type': 'PropertyValue', name: 'Trademark applications in charted window', value: res.filingsInWindow },
          ],
          dateModified: new Date().toISOString().slice(0, 10),
          license: 'https://creativecommons.org/licenses/by/4.0/',
          isAccessibleForFree: true,
          creator: { '@type': 'Organization', name: 'Trademarx', url: 'https://trademarx.in' },
          includedInDataCatalog: { '@type': 'DataCatalog', name: 'IP India Trade Marks Register', url: 'https://ipindia.gov.in' },
          isBasedOn: 'https://ipindia.gov.in',
        },
        faqSchema(this.faqs),
      ],
      'trends-dimension',
    );
  }
}

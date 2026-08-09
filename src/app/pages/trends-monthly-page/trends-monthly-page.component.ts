import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

import { SeoService } from '../../shared/services/seo.service';
import { IMonthlyReport, TrademarkTrendsService } from '../../shared/services/trademark-trends.service';
import { stateSlug as slugifyState } from '../../shared/utils/trends-slug.util';
import {
  COLLECTION_LAG_NOTE,
  FaqItem,
  SOURCE_NOTE,
  faqSchema,
  longDate,
  num,
  share,
  signedPercent,
} from '../../shared/utils/trends-copy.util';

/**
 * A single calendar month's filing report at /trademark-trends/:yearMonth (e.g. 2026-06).
 * Genuine periodic-report cadence (12/year), each a distinct data-rich dataset.
 */
@Component({
  selector: 'app-trends-monthly-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './trends-monthly-page.component.html',
  styleUrl: './trends-monthly-page.component.scss',
})
export class TrendsMonthlyPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly seo = inject(SeoService);
  private readonly trendsService = inject(TrademarkTrendsService);

  data: IMonthlyReport | null = null;
  loading = true;

  intro = '';
  classCaption = '';
  stateCaption = '';
  typeCaption = '';
  faqs: FaqItem[] = [];

  readonly collectionLagNote = COLLECTION_LAG_NOTE;
  readonly sourceNote = SOURCE_NOTE;

  ngOnInit(): void {
    const ym = this.route.snapshot.paramMap.get('yearMonth') ?? '';
    const match = /^(\d{4})-(\d{2})$/.exec(ym);
    if (!match) {
      this.router.navigateByUrl('/not-found', { skipLocationChange: true });
      return;
    }
    const year = Number(match[1]);
    const month = Number(match[2]);
    if (month < 1 || month > 12) {
      this.router.navigateByUrl('/not-found', { skipLocationChange: true });
      return;
    }

    this.trendsService.getMonthlyReport(year, month).subscribe({
      next: res => {
        this.data = res;
        this.loading = false;
        this.buildCopy(res);
        this.setSeoTags(res);
      },
      error: () => this.router.navigateByUrl('/not-found', { skipLocationChange: true }),
    });
  }

  /** Renders the month's figures as sentences — see trends-copy.util for the rationale. */
  private buildCopy(res: IMonthlyReport): void {
    const topClass = res.classBreakdown.find(c => !c.label.startsWith('Other')) ?? null;
    const topState = res.stateBreakdown.find(s => s.label !== 'Other') ?? null;
    const topType = res.typeBreakdown[0] ?? null;
    const scope = res.partial ? `so far in ${res.monthLabel} (to ${longDate(res.coverageThrough)})` : `in ${res.monthLabel}`;

    const parts: string[] = [`${num(res.totalFilings)} trademark applications were filed in India ${scope}.`];

    if (res.momChangePercent !== null) {
      parts.push(
        res.partial
          ? `That is ${signedPercent(res.momChangePercent)} against the same stretch of the previous month.`
          : `That is ${signedPercent(res.momChangePercent)} on the previous month.`,
      );
    }
    if (topClass) {
      parts.push(`${topClass.label} was the most-filed category at ${share(topClass.count, res.totalFilings)} of the month's filings.`);
    }
    if (topState) {
      parts.push(`${topState.label} led by applicant location with ${num(topState.count)} applications.`);
    }
    if (topType) {
      parts.push(`${topType.label} marks made up ${topType.percentage.toFixed(1)}% of the month's applications by mark type.`);
    }

    this.intro = parts.join(' ');
    this.classCaption = `NICE classes ranked by applications filed ${scope}, with each class's share of the month's total.`;
    this.stateCaption = `Applicant states ranked by applications filed ${scope}.`;
    this.typeCaption = `Share of applications by mark type (word mark, device/logo and others) ${scope}.`;

    this.faqs = [
      {
        question: `How many trademarks were filed in India in ${res.monthLabel}?`,
        answer: `${num(res.totalFilings)} trademark applications were recorded ${scope}${
          res.momChangePercent !== null ? `, ${signedPercent(res.momChangePercent)} on the previous month` : ''
        }.`,
      },
      ...(topClass
        ? [
            {
              question: `Which trademark class was filed most in ${res.monthLabel}?`,
              answer: `${topClass.label}, with ${num(topClass.count)} applications — ${share(
                topClass.count,
                res.totalFilings,
              )} of everything filed that month.`,
            },
          ]
        : []),
      ...(topState
        ? [
            {
              question: `Which state filed the most trademarks in ${res.monthLabel}?`,
              answer: `${topState.label}, with ${num(topState.count)} applications, ${share(
                topState.count,
                res.totalFilings,
              )} of the national total. The state reflects the applicant's address; Indian trademark protection itself is national.`,
            },
          ]
        : []),
      {
        question: res.partial ? 'Why is this month incomplete?' : 'How reliable are these monthly totals?',
        answer: res.partial
          ? `${res.monthLabel} is still running, so this report covers 1 ${res.monthLabel.split(' ')[0]} to ${longDate(
              res.coverageThrough,
            )} and is compared against the same day range of the previous month. ${COLLECTION_LAG_NOTE}`
          : COLLECTION_LAG_NOTE,
      },
    ];
  }

  /** "Class 25 — Clothing" -> "/trademark-trends/class/25"; null for the "Other classes" bucket. */
  classLink(label: string): string | null {
    const match = /^Class (\d+)/.exec(label);
    return match ? `/trademark-trends/class/${match[1]}` : null;
  }

  /** "Tamil Nadu" -> "tamil-nadu", matching the backend's slugify so the link round-trips. */
  stateSlug(label: string): string {
    return slugifyState(label);
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd('trends-monthly');
    this.seo.removeCanonical();
    this.meta.removeTag("name='robots'");
  }

  private setSeoTags(res: IMonthlyReport): void {
    const slug = `${res.year}-${String(res.month).padStart(2, '0')}`;
    const url = `https://trademarx.in/trademark-trends/${slug}`;
    const title = `India Trademark Filings — ${res.monthLabel} Report | Trademarx`;
    const description = res.partial
      ? `${num(res.totalFilings)} trademarks filed in India so far in ${res.monthLabel} (to ${longDate(
          res.coverageThrough,
        )}). Live breakdown by NICE class, state and mark type from the official IP India registry.`
      : `${num(res.totalFilings)} trademarks were filed in India in ${res.monthLabel}. Full breakdown by NICE class, state and mark type from the official IP India registry.`;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
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
            { '@type': 'ListItem', position: 2, name: 'Filing Trends', item: 'https://trademarx.in/trademark-filing-trends' },
            { '@type': 'ListItem', position: 3, name: res.monthLabel, item: url },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Dataset',
          name: title,
          description,
          url,
          temporalCoverage: `${res.year}-${String(res.month).padStart(2, '0')}-01/${res.coverageThrough}`,
          spatialCoverage: { '@type': 'Place', name: 'India' },
          variableMeasured: [{ '@type': 'PropertyValue', name: 'Trademark applications filed', value: res.totalFilings }],
          dateModified: new Date().toISOString().slice(0, 10),
          license: 'https://creativecommons.org/licenses/by/4.0/',
          isAccessibleForFree: true,
          creator: { '@type': 'Organization', name: 'Trademarx', url: 'https://trademarx.in' },
          includedInDataCatalog: { '@type': 'DataCatalog', name: 'IP India Trade Marks Register', url: 'https://ipindia.gov.in' },
          isBasedOn: 'https://ipindia.gov.in',
        },
        faqSchema(this.faqs),
      ],
      'trends-monthly',
    );
  }
}

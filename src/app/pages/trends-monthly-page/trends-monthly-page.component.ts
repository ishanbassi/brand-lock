import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

import { SeoService } from '../../shared/services/seo.service';
import { IMonthlyReport, TrademarkTrendsService } from '../../shared/services/trademark-trends.service';
import { stateSlug as slugifyState } from '../../shared/utils/trends-slug.util';

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
        this.setSeoTags(res);
      },
      error: () => this.router.navigateByUrl('/not-found', { skipLocationChange: true }),
    });
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
    const description = `${res.totalFilings.toLocaleString()} trademarks were filed in India in ${res.monthLabel}. Full breakdown by NICE class, state and mark type from the official IP India registry.`;

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
          temporalCoverage: slug,
          creator: { '@type': 'Organization', name: 'Trademarx' },
          isBasedOn: 'https://ipindia.gov.in',
        },
      ],
      'trends-monthly',
    );
  }
}

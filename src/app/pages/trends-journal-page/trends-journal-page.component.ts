import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

import { SeoService } from '../../shared/services/seo.service';
import { IJournalDetail, TrademarkTrendsService } from '../../shared/services/trademark-trends.service';
import { stateSlug as slugifyState } from '../../shared/utils/trends-slug.util';

/**
 * Per-journal page at /trademark-journal/:no. Each Trade Marks Journal is a real, dated event
 * carrying thousands of newly-advertised marks, so these pages have substantial unique data.
 */
@Component({
  selector: 'app-trends-journal-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './trends-journal-page.component.html',
  styleUrl: './trends-journal-page.component.scss',
})
export class TrendsJournalPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly seo = inject(SeoService);
  private readonly trendsService = inject(TrademarkTrendsService);

  data: IJournalDetail | null = null;
  loading = true;

  /** The monthly report covering this journal's published date, if known - the one genuinely relevant month, not a generic list. */
  monthlyReportLink: { slug: string; label: string } | null = null;

  ngOnInit(): void {
    const raw = this.route.snapshot.paramMap.get('journalNo') ?? '';
    const journalNo = Number(raw);
    if (!raw || !Number.isInteger(journalNo) || journalNo <= 0) {
      this.router.navigateByUrl('/not-found', { skipLocationChange: true });
      return;
    }

    this.trendsService.getJournalDetail(journalNo).subscribe({
      next: res => {
        this.data = res;
        this.loading = false;
        this.monthlyReportLink = this.buildMonthlyReportLink(res.publishedDate);
        this.setSeoTags(res);
      },
      error: () => this.router.navigateByUrl('/not-found', { skipLocationChange: true }),
    });
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd('trends-journal');
    this.seo.removeCanonical();
    this.meta.removeTag("name='robots'");
  }

  /** "Tamil Nadu" -> "tamil-nadu", matching the backend's slugify so the link round-trips. */
  stateSlug(label: string): string {
    return slugifyState(label);
  }

  private buildMonthlyReportLink(publishedDate: string | null): { slug: string; label: string } | null {
    if (!publishedDate) return null;
    const d = new Date(publishedDate);
    if (Number.isNaN(d.getTime())) return null;
    const slug = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return { slug, label };
  }

  private setSeoTags(res: IJournalDetail): void {
    const url = `https://trademarx.in/trademark-journal/${res.journalNo}`;
    const title = `Trade Marks Journal No. ${res.journalNo} — Filings Breakdown | Trademarx`;
    const description = `Trade Marks Journal No. ${res.journalNo} carried ${res.totalMarks.toLocaleString()} trademark entries. See the class and state breakdown of marks published in this journal, from the official IP India registry.`;

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
            { '@type': 'ListItem', position: 3, name: `Journal ${res.journalNo}`, item: url },
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
      'trends-journal',
    );
  }
}

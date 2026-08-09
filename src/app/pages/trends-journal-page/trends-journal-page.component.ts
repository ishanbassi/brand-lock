import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

import { SeoService } from '../../shared/services/seo.service';
import { IJournalDetail, TrademarkTrendsService } from '../../shared/services/trademark-trends.service';
import { stateSlug as slugifyState } from '../../shared/utils/trends-slug.util';
import { FaqItem, SOURCE_NOTE, faqSchema, longDate, num, share } from '../../shared/utils/trends-copy.util';

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

  /** The monthly report covering this journal's indexed date, if known - the one genuinely relevant month, not a generic list. */
  monthlyReportLink: { slug: string; label: string } | null = null;

  intro = '';
  classCaption = '';
  stateCaption = '';
  faqs: FaqItem[] = [];

  readonly sourceNote = SOURCE_NOTE;

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
        this.monthlyReportLink = this.buildMonthlyReportLink(res.indexedDate);
        this.buildCopy(res);
        this.setSeoTags(res);
      },
      error: () => this.router.navigateByUrl('/not-found', { skipLocationChange: true }),
    });
  }

  /** Renders the journal's figures as sentences — see trends-copy.util for the rationale. */
  private buildCopy(res: IJournalDetail): void {
    const topClass = res.classBreakdown.find(c => !c.label.startsWith('Other')) ?? null;
    const topState = res.stateBreakdown.find(s => !s.label.startsWith('Other')) ?? null;
    const indexed = longDate(res.indexedDate);

    const parts: string[] = [
      `Trade Marks Journal No. ${res.journalNo} carries ${num(res.totalMarks)} trademark entries advertised by the Indian registry` +
        (indexed ? `, first indexed by Trademarx on ${indexed}.` : '.'),
    ];
    if (topClass) {
      parts.push(`${topClass.label} is the largest category in this issue at ${share(topClass.count, res.totalMarks)} of its entries.`);
    }
    if (topState) {
      parts.push(`Applicants from ${topState.label} account for the most entries, ${num(topState.count)} in total.`);
    }
    parts.push(
      'Publication in the journal opens a four-month window in which any third party may oppose a mark, ' +
        'so this issue is the starting point for opposition deadlines on every application listed in it.',
    );
    this.intro = parts.join(' ');

    this.classCaption = `NICE classes ranked by the number of marks advertised in Trade Marks Journal No. ${res.journalNo}.`;
    this.stateCaption = `Applicant states ranked by the number of marks advertised in Trade Marks Journal No. ${res.journalNo}.`;

    this.faqs = [
      {
        question: `How many trademarks were published in Trade Marks Journal No. ${res.journalNo}?`,
        answer: `${num(res.totalMarks)} trademark entries from this journal appear in our index of the official IP India Trade Marks Journal.`,
      },
      {
        question: 'What happens once a trademark is advertised in the journal?',
        answer:
          'Advertisement starts a four-month opposition period. If nobody files a notice of opposition in that window, the application ' +
          'proceeds to registration and the registry issues the certificate. If an opposition is filed, the applicant must file a counter-statement ' +
          'within two months or the application is treated as abandoned.',
      },
      ...(topClass
        ? [
            {
              question: `Which class had the most marks in journal ${res.journalNo}?`,
              answer: `${topClass.label}, with ${num(topClass.count)} advertised marks — ${share(
                topClass.count,
                res.totalMarks,
              )} of the issue.`,
            },
          ]
        : []),
      {
        question: 'Is the date shown on this page the journal’s publication date?',
        answer:
          'No. It is the date we first indexed a mark from this issue, which is a close proxy but not the registry’s own publication date. ' +
          'Opposition deadlines run from the registry’s publication date, which is printed on the journal itself.',
      },
    ];
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

  private buildMonthlyReportLink(indexedDate: string | null): { slug: string; label: string } | null {
    if (!indexedDate) return null;
    const d = new Date(indexedDate);
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
          spatialCoverage: { '@type': 'Place', name: 'India' },
          variableMeasured: [{ '@type': 'PropertyValue', name: 'Trademark entries advertised', value: res.totalMarks }],
          ...(res.indexedDate ? { dateCreated: res.indexedDate.slice(0, 10) } : {}),
          dateModified: new Date().toISOString().slice(0, 10),
          license: 'https://creativecommons.org/licenses/by/4.0/',
          isAccessibleForFree: true,
          creator: { '@type': 'Organization', name: 'Trademarx', url: 'https://trademarx.in' },
          includedInDataCatalog: { '@type': 'DataCatalog', name: 'IP India Trade Marks Journal', url: 'https://ipindia.gov.in' },
          isBasedOn: 'https://ipindia.gov.in',
        },
        faqSchema(this.faqs),
      ],
      'trends-journal',
    );
  }
}

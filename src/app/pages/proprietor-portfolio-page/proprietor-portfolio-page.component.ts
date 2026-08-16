import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { Subscription, combineLatest, forkJoin } from 'rxjs';

import { SeoService } from '../../shared/services/seo.service';
import { IProprietorProfile, TrademarkProprietorService } from '../../shared/services/trademark-proprietor.service';
import { ITrademark } from '../../../models/trademark.model';
import { environment } from '../../../environments/environment';
import { proprietorSlug } from '../../shared/utils/proprietor-slug.util';
import { FaqItem, faqSchema, hl, longDate, num, share, stripHl, SOURCE_NOTE } from '../../shared/utils/trends-copy.util';

/**
 * One programmatic page per proprietor (/trademarks-by/:slug): everything the public registry
 * records under one company / LLP / firm / individual applicant name.
 *
 * The slug is a slugified proprietor name, so every stored spelling of an entity ("ABC PVT
 * LTD", "Abc Pvt. Ltd.") resolves to this one page rather than scattering the portfolio.
 * Data is a live SSR query — the URL is stable, the numbers refresh on every render.
 *
 * Thin portfolios still render and still work from a link, but carry noindex and are kept out
 * of the sitemap (see the `indexable` flag, set backend-side from MIN_INDEXABLE_FILINGS).
 */
@Component({
  selector: 'app-proprietor-portfolio-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './proprietor-portfolio-page.component.html',
  styleUrl: './proprietor-portfolio-page.component.scss',
})
export class ProprietorPortfolioPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly seo = inject(SeoService);
  private readonly proprietorService = inject(TrademarkProprietorService);

  readonly baseUrl = environment.BaseApiUrl;
  readonly pageSize = 20;
  readonly sourceNote = SOURCE_NOTE;

  profile: IProprietorProfile | null = null;
  marks: ITrademark[] = [];
  loading = true;
  page = 0;
  totalItems = 0;

  /** Generated-from-the-data prose, so the page's findings exist as quotable sentences. */
  intro = '';
  portfolioCaption = '';
  faqs: FaqItem[] = [];

  private slug = '';
  private routeSub?: Subscription;

  ngOnInit(): void {
    // Both maps, not the route snapshot: pagination lives in a query param so page 2+ has its
    // own crawlable, self-canonical URL, and Angular reuses this component across both a
    // ?page change and a slug change, so neither would re-run ngOnInit on its own.
    this.routeSub = combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params, query]) => {
      this.slug = params.get('slug') ?? '';

      const requested = Number(query.get('page') ?? '1');
      this.page = Number.isFinite(requested) && requested > 1 ? Math.floor(requested) - 1 : 0;
      this.load();
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.seo.removeJsonLd('proprietor-portfolio');
    this.seo.removeCanonical();
    this.meta.removeTag("name='robots'");
  }

  private load(): void {
    this.loading = true;
    forkJoin({
      profile: this.proprietorService.getProfile(this.slug),
      marks: this.proprietorService.getMarks(this.slug, this.page, this.pageSize),
    }).subscribe({
      next: ({ profile, marks }) => {
        const rows = marks.body ?? [];
        // A ?page past the end of the portfolio has no content of its own. Answering 404
        // rather than rendering an empty list keeps a mistyped or stale page number from
        // becoming a soft 404 on a URL set this large.
        if (this.page > 0 && !rows.length) {
          this.router.navigateByUrl('/not-found', { skipLocationChange: true });
          return;
        }

        this.profile = profile;
        this.marks = rows;
        this.totalItems = Number(marks.headers.get('X-Total-Count')) || profile.totalFilings;
        this.loading = false;
        this.buildCopy(profile);
        this.setSeoTags(profile);
      },
      // An unknown slug 404s at the API, and the error page sets the real HTTP status —
      // without this a dead /trademarks-by/ URL would serve an empty page under a 200.
      error: () => this.router.navigateByUrl('/not-found', { skipLocationChange: true }),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Generated copy. Templated off values that differ per page (name, totals, leading
  // class, filing span) rather than one fixed sentence with a number swapped in, so a
  // large set of these pages doesn't read as one duplicated page.
  // ─────────────────────────────────────────────────────────────────────────────

  private buildCopy(p: IProprietorProfile): void {
    const top = p.classBreakdown.find(b => !b.label.startsWith('Other')) ?? null;
    const second = p.classBreakdown.filter(b => !b.label.startsWith('Other'))[1] ?? null;
    const liveStatus = p.statusBreakdown.find(b => !b.label.startsWith('Other') && b.label !== 'Unknown') ?? null;

    let lead =
      `The IP India register records ${hl(num(p.totalFilings))} trademark ` +
      `application${p.totalFilings === 1 ? '' : 's'} filed by ${hl(p.displayName)}`;
    lead += p.primaryState ? `, filed predominantly from ${hl(p.primaryState)}.` : '.';

    let span = '';
    if (p.firstFilingDate && p.latestFilingDate) {
      span =
        p.firstFilingDate === p.latestFilingDate
          ? ` The single filing on record is dated ${hl(longDate(p.firstFilingDate))}.`
          : ` Filings run from ${hl(longDate(p.firstFilingDate))} to ${hl(longDate(p.latestFilingDate))}.`;
    }

    let classes = '';
    if (top) {
      classes = ` The portfolio is concentrated in ${hl(top.label)}, which accounts for ${hl(
        share(top.count, p.totalFilings),
      )} of the filings`;
      classes += second ? `, followed by ${hl(second.label)} at ${hl(share(second.count, p.totalFilings))}.` : '.';
    }

    let status = '';
    if (liveStatus) {
      status = ` The most common registry status across the portfolio is ${hl(liveStatus.label)} (${hl(
        num(liveStatus.count),
      )} mark${liveStatus.count === 1 ? '' : 's'}).`;
    }

    this.intro = lead + span + classes + status;

    this.portfolioCaption =
      `Every trademark application the register attributes to ${p.displayName}, newest filing first. ` +
      `Each row links to that mark's full registry record.`;

    this.faqs = this.buildFaqs(p, top);
  }

  private buildFaqs(p: IProprietorProfile, top: { label: string; count: number } | null): FaqItem[] {
    const classCount = p.classBreakdown.filter(b => !b.label.startsWith('Other')).length;
    return [
      {
        question: `How many trademarks does ${p.displayName} have?`,
        answer:
          `${num(p.totalFilings)} trademark application${p.totalFilings === 1 ? '' : 's'} in the IP India register ` +
          `are filed under the name ${p.displayName}` +
          (p.firstFilingDate && p.latestFilingDate && p.firstFilingDate !== p.latestFilingDate
            ? `, spanning ${longDate(p.firstFilingDate)} to ${longDate(p.latestFilingDate)}.`
            : '.') +
          ' This counts filings recorded against that applicant name; marks held under a group company, ' +
          'a subsidiary, or a founder\'s personal name are recorded separately.',
      },
      ...(top
        ? [
            {
              question: `Which trademark classes does ${p.displayName} file in?`,
              answer:
                `${top.label} is the most-used class, with ${num(top.count)} filings — ${share(
                  top.count,
                  p.totalFilings,
                )} of the portfolio. ` +
                `In total the portfolio covers ${classCount} NICE class${classCount === 1 ? '' : 'es'}. ` +
                'Indian trademark protection only extends to the classes actually filed in, so classes absent ' +
                'from this list are not covered by these registrations.',
            },
          ]
        : []),
      {
        question: `Can I use a brand name similar to one filed by ${p.displayName}?`,
        answer:
          'Not safely, if it is in a class this applicant already covers. A mark that is identical or ' +
          'deceptively similar to an earlier filing in the same or a related class can be refused by the ' +
          'registry or opposed after publication. Run a clearance search across the relevant classes before adopting a name.',
      },
      ...(p.nameVariants.length
        ? [
            {
              question: `Why does this page show more than one spelling of the name?`,
              answer:
                'Registry records carry whatever name was typed on each application, so the same business often ' +
                `appears under several spellings (${[p.displayName, ...p.nameVariants].slice(0, 3).join('; ')}). ` +
                'This page groups them so the full portfolio is visible in one place.',
            },
          ]
        : []),
      {
        question: 'How current is this data?',
        answer: `${SOURCE_NOTE} Status and class shown reflect what the Registry has on file at the time of the most recent refresh.`,
      },
    ];
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Template helpers.
  // ─────────────────────────────────────────────────────────────────────────────

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  /** 1-based, for links and the "Page X of Y" label — the API is 0-based. */
  get humanPage(): number {
    return this.page + 1;
  }

  /** A fresh array each read, so a slug change is actually picked up by routerLink. */
  get pageLink(): string[] {
    return ['/trademarks-by', this.slug];
  }

  /** Page 1 drops the param entirely, so the canonical URL has no ?page=1 duplicate. */
  pageQueryParams(humanPage: number): Record<string, unknown> {
    return humanPage <= 1 ? { page: null } : { page: humanPage };
  }

  imgSrc(trademark: ITrademark): string {
    return trademark.imgUrl ? `${this.baseUrl}files/${trademark.imgUrl}` : '/assets/images/trademark.png';
  }

  getStatusClass(status?: string | null): string {
    const s = (status ?? '').toLowerCase();
    if (s.includes('regist') || s.includes('accept') || s.includes('protect')) return 'status-active';
    if (s.includes('object') || s.includes('oppos') || s.includes('refus') || s.includes('abandon')) return 'status-expired';
    if (s.includes('pend') || s.includes('formalit') || s.includes('exam') || s.includes('advertis')) return 'status-pending';
    return '';
  }

  /** Class label "Class 25 — Clothing…" -> 25, for linking to that class's trends page. */
  classNumber(label: string): number | null {
    const match = /^Class (\d+)/.exec(label);
    return match ? Number(match[1]) : null;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SEO.
  // ─────────────────────────────────────────────────────────────────────────────

  private setSeoTags(p: IProprietorProfile): void {
    const base = `https://trademarx.in/trademarks-by/${p.slug}`;
    const url = this.page > 0 ? `${base}?page=${this.humanPage}` : base;
    const pageSuffix = this.page > 0 ? ` — Page ${this.humanPage}` : '';

    const title = `Trademarks Filed by ${p.displayName} — All ${num(p.totalFilings)} Applications${pageSuffix} | Trademarx`;
    const description = stripHl(this.intro).slice(0, 300);

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    // Thin portfolios are followable but not indexable: one filing is already covered by that
    // mark's own /trademarks/:slug page, and publishing the long tail of them at scale is the
    // pattern that gets programmatic sites demoted.
    this.meta.updateTag({ name: 'robots', content: p.indexable ? 'index, follow' : 'noindex, follow' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: 'https://trademarx.in/assets/images/trademarx.png' });
    // Self-canonical per page rather than folding page 2+ onto page 1: the marks listed differ,
    // so collapsing them would hide most of a large portfolio from the index.
    this.seo.setCanonical(url);

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
              name: 'Trademark Search by Company Name',
              item: 'https://trademarx.in/trademark-search-by-company',
            },
            { '@type': 'ListItem', position: 3, name: p.displayName, item: base },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: title,
          description,
          url,
          isPartOf: { '@type': 'WebSite', name: 'Trademarx', url: 'https://trademarx.in' },
          // Describes the applicant without asserting an entity type — a proprietor on the
          // register may be a company, a firm, or an individual, and the record doesn't say which.
          about: { '@type': 'Thing', name: p.displayName, alternateName: p.nameVariants.slice(0, 5) },
          dateModified: new Date().toISOString().slice(0, 10),
          isBasedOn: 'https://ipindia.gov.in',
          mainEntity: {
            '@type': 'ItemList',
            name: `Trademarks filed by ${p.displayName}`,
            numberOfItems: p.totalFilings,
            itemListElement: this.marks.slice(0, 20).map((mark, i) => ({
              '@type': 'ListItem',
              position: this.page * this.pageSize + i + 1,
              url: `https://trademarx.in${mark.url ?? ''}`,
              name: mark.name || `Application No. ${mark.applicationNo}`,
            })),
          },
        },
        faqSchema(this.faqs),
      ],
      'proprietor-portfolio',
    );
  }

  /** Re-derives the slug for a variant name, so "also recorded as" entries can be checked. */
  variantSlug(name: string): string {
    return proprietorSlug(name);
  }
}

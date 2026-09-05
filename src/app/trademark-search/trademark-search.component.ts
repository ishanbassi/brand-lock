import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { environment } from '../../environments/environment';
import { ITrademark } from '../../models/trademark.model';
import { LiveSearchComponent } from '../live-search/live-search.component';
import { MobileBottomNavbarComponent } from '../mobile-bottom-navbar/mobile-bottom-navbar.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { TrademarkPlanCardsComponent } from '../trademark-plan-cards/trademark-plan-cards.component';
import { TrademarkPulseComponent } from '../trademark-pulse/trademark-pulse.component';
import { TrademarkSearchContentComponent } from '../trademark-search-content/trademark-search-content.component';
import { SeoService } from '../shared/services/seo.service';

/** The one address this page is canonical at. Query parameters never change what it renders. */
const SEARCH_URL = 'https://trademarx.in/search';

/**
 * One string for both `<title>` and `og:title`. They used to disagree — the tab said "Find a
 * trademark" while shares said "Check Trademark Availability" — which splits how the same page is
 * described across search results and social cards.
 *
 * No brand suffix: the name is carried by `og:site_name` on social cards, and dropping it from the
 * title spends the whole width on the query the page is competing for.
 */
const SEARCH_TITLE = 'Check Trademark Availability | Free Trademark Search';

const SEARCH_DESCRIPTION =
  'Run a free trademark search in India. Instantly check brand name availability, phonetic matches, and class-wise conflicts before trademark filing.';

const SEARCH_IMAGE =
  'https://cms.trademarx.in/uploads/Chat_GPT_Image_Mar_9_2026_10_00_37_AM_66fd097b9a.jpg';

export interface Statistic {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-trademark-search',
  imports: [LiveSearchComponent, CommonModule, RouterModule, TrademarkPlanCardsComponent, TrademarkSearchContentComponent, MobileBottomNavbarComponent,TrademarkPulseComponent,RatingReviewComponent],
  templateUrl: './trademark-search.component.html',
  styleUrl: './trademark-search.component.scss'
})
export class TrademarkSearchComponent implements OnInit {
  
  constructor(

    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private title: Title,
    private meta: Meta,
    private seo: SeoService,

  ) {

  }

  query?: string | null;
  results: ITrademark[] | null = [];
  baseUrl = environment.BaseApiUrl;
  isLoading = false;
  totalResults = 0;
  @ViewChild('searchBoxWrapper') searchBoxWrapper!: ElementRef;

   statistics: Statistic[] = [
    {
      value: '15,000+',
      label: 'Trademarks Filed',
      icon: 'file-text',
    },
    {
      value: '98%',
      label: 'Success Rate',
      icon: 'trending-up',
    },
    {
      value: '24/7',
      label: 'Expert Support',
      icon: 'headphones',
    },
  ];


  ngOnInit(): void {
    
    this.setSeoTags();
  }


  trackById(_: number, item: ITrademark) {
    return item.id;
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'Active':
        return 'status-active';
      case 'Pending':
        return 'status-pending';
      case 'Expired':
        return 'status-expired';
      default:
        return '';
    }
  }



  highlight(text?: string | null): string {
    if (!text) return '';

    if (!this.query) return text;
    const regex = new RegExp(`(${this.query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  focusOnSearchBar() {
    if (this.searchBoxWrapper) {
      const firstInput = this.searchBoxWrapper.nativeElement.querySelector('input#trademarkSearchBar');
      if (firstInput) {
        firstInput.focus();
      }
    }



  }
  setSeoTags() {
    this.title.setTitle(SEARCH_TITLE);
    this.meta.updateTag({ name: 'description', content: SEARCH_DESCRIPTION });

    this.meta.updateTag({ property: 'og:title', content: SEARCH_TITLE });
    this.meta.updateTag({ property: 'og:description', content: SEARCH_DESCRIPTION });
    this.meta.updateTag({ property: 'og:image', content: SEARCH_IMAGE });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Trademarx' });
    // Set from the constant rather than document.location so the server-rendered HTML carries it
    // too. Reading location.href only worked in the browser, so crawlers and social scrapers — which
    // take the SSR response and do not run the app — saw no og:url at all.
    this.meta.updateTag({ property: 'og:url', content: SEARCH_URL });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: SEARCH_TITLE });
    this.meta.updateTag({ name: 'twitter:description', content: SEARCH_DESCRIPTION });
    this.meta.updateTag({ name: 'twitter:image', content: SEARCH_IMAGE });

    this.seo.setCanonical(SEARCH_URL);
    this.injectJsonLd();
  }

  /**
   * Breadcrumb and page-level markup. The organisation itself is defined once on the homepage, so
   * this references that `@id` instead of restating the business details and risking two
   * definitions of one entity drifting apart.
   */
  private injectJsonLd(): void {
    this.seo.injectJsonLd(
      [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://trademarx.in/' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Trademark Search', 'item': SEARCH_URL }
          ]
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${SEARCH_URL}#webpage`,
          'url': SEARCH_URL,
          'name': SEARCH_TITLE,
          'description': SEARCH_DESCRIPTION,
          'inLanguage': 'en-IN',
          'isPartOf': { '@id': 'https://trademarx.in/#organization' },
          'about': { '@type': 'Thing', 'name': 'Trademark search in India' },
          'primaryImageOfPage': { '@type': 'ImageObject', 'url': SEARCH_IMAGE }
        }
      ],
      'trademark-search'
    );
  }
  



}

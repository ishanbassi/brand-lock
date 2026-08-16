import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { Subject, debounceTime, distinctUntilChanged, filter, finalize, switchMap, takeUntil, tap } from 'rxjs';
import { SharedModule } from '../shared/shared.module';
import { TrademarkService } from '../shared/services/trademark.service';
import { SeoService } from '../shared/services/seo.service';
import { ITrademark } from '../../models/trademark.model';
import { environment } from '../../environments/environment';
import { MobileBottomNavbarComponent } from '../mobile-bottom-navbar/mobile-bottom-navbar.component';
import { TrademarkPulseComponent } from '../trademark-pulse/trademark-pulse.component';
import { proprietorUrl } from '../shared/utils/proprietor-slug.util';

interface Faq {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-trademark-search-by-company',
  imports: [SharedModule, ReactiveFormsModule, MobileBottomNavbarComponent, TrademarkPulseComponent],
  templateUrl: './trademark-search-by-company.component.html',
  styleUrl: './trademark-search-by-company.component.scss',
})
export class TrademarkSearchByCompanyComponent implements OnInit, OnDestroy {
  @ViewChild('companyNameInput') companyNameInput?: ElementRef<HTMLInputElement>;
  @ViewChild('searchWrapper') searchWrapper?: ElementRef<HTMLElement>;

  companyNameControl = new FormControl('');
  results: ITrademark[] | null = null;
  isLoading = false;
  hasSearched = false;
  baseUrl = environment.BaseApiUrl;
  openFaqIndex: number | null = 0;

  // Type-ahead suggestions
  suggestions: string[] = [];
  suggestionsOpen = false;
  activeSuggestionIndex = -1;
  private readonly destroy$ = new Subject<void>();

  // Pagination
  page = 0;
  readonly pageSize = 10;
  totalItems = 0;

  get companyName(): string {
    return this.companyNameControl.value ?? '';
  }

  readonly faqs: Faq[] = [
    {
      question: 'What counts as the "company name" in this search?',
      answer:
        'It is the proprietor/applicant name exactly as recorded against the trademark application at the India Trademark Registry — this can be a company, an LLP, a partnership firm, or an individual proprietor\'s name.',
    },
    {
      question: 'Why are there multiple results for the same company?',
      answer:
        'Most active businesses file more than one trademark — separate word marks, logos, or filings across different classes for different product/service lines. Each filing shows up as its own result here.',
    },
    {
      question: 'Can I search by a partial or misspelled company name?',
      answer:
        'Yes — the search matches on any part of the recorded proprietor name, so a partial name (e.g. just the distinctive part of a longer registered entity name) will usually still surface the right results. Very different spellings may not match, since Registry records use whatever name was submitted on the original filing.',
    },
    {
      question: 'Why would I check a company\'s trademark portfolio?',
      answer:
        'Common reasons: verifying a business actually owns the brand it claims before a franchise, distribution, or licensing deal; checking a competitor\'s filed marks and classes; or confirming your own past filings are all still in good standing.',
    },
    {
      question: 'The company I\'m looking for isn\'t showing any results — why?',
      answer:
        'Either they haven\'t filed a trademark application in India, they filed under a different legal or trading name, or the filing is too recent to have been indexed yet. Try the distinctive part of the name on its own, or search by brand/mark name instead.',
    },
    {
      question: 'How current is this data?',
      answer:
        'Records are sourced from the official IP India Trade Marks Registry and refreshed regularly, so the status and class shown reflect what the Registry has on file.',
    },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly trademarkService: TrademarkService,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.setSeoTags();

    const queryName = this.route.snapshot.queryParamMap.get('name');
    if (queryName) {
      this.companyNameControl.setValue(queryName, { emitEvent: false });
      this.search();
    }

    this.companyNameControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(value => {
          if ((value ?? '').trim().length < 2) {
            this.suggestions = [];
            this.suggestionsOpen = false;
          }
        }),
        filter(value => (value ?? '').trim().length >= 2),
        switchMap(value => this.trademarkService.proprietorNameSuggestions(value!.trim())),
        takeUntil(this.destroy$),
      )
      .subscribe(names => {
        this.suggestions = names ?? [];
        this.suggestionsOpen = this.suggestions.length > 0;
        this.activeSuggestionIndex = -1;
      });
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd('trademark-search-by-company');
    this.destroy$.next();
    this.destroy$.complete();
  }

  onKeydown(event: KeyboardEvent): void {
    if (!this.suggestionsOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeSuggestionIndex = Math.min(this.activeSuggestionIndex + 1, this.suggestions.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeSuggestionIndex = Math.max(this.activeSuggestionIndex - 1, -1);
        break;
      case 'Enter':
        if (this.activeSuggestionIndex >= 0) {
          event.preventDefault();
          this.selectSuggestion(this.suggestions[this.activeSuggestionIndex]);
        }
        break;
      case 'Escape':
        this.closeSuggestions();
        break;
    }
  }

  selectSuggestion(name: string): void {
    this.companyNameControl.setValue(name, { emitEvent: false });
    this.closeSuggestions();
    this.search();
  }

  closeSuggestions(): void {
    this.suggestionsOpen = false;
    this.activeSuggestionIndex = -1;
  }

  highlight(text?: string | null): string {
    if (!text) return '';
    const query = this.companyName.trim();
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.searchWrapper?.nativeElement.contains(event.target as Node)) {
      this.closeSuggestions();
    }
  }

  search(resetPage = true): void {
    this.closeSuggestions();
    const value = this.companyName.trim();
    if (!value) {
      return;
    }
    if (resetPage) {
      this.page = 0;
    }

    this.router.navigate([], { relativeTo: this.route, queryParams: { name: value } });

    this.isLoading = true;
    this.hasSearched = true;
    this.trademarkService
      .searchByProprietorName(value, { page: this.page, size: this.pageSize, sort: 'applicationNo,desc' })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: res => {
          this.results = res.body ?? [];
          this.totalItems = Number(res.headers.get('X-Total-Count')) || 0;
        },
        error: () => {
          this.results = [];
          this.totalItems = 0;
        },
      });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.search(false);
      this.focusResultsTop();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.search(false);
      this.focusResultsTop();
    }
  }

  private focusResultsTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  imgSrc(trademark: ITrademark): string {
    return trademark.imgUrl ? this.baseUrl + 'files/' + trademark.imgUrl : '/assets/images/trademark.png';
  }

  /**
   * That applicant's own /trademarks-by/ page. This search box matches on any part of the
   * recorded name, so a result's applicant is often not the name that was typed — the link
   * is how a visitor gets from a partial-match hit to that specific company's full portfolio.
   */
  portfolioUrl(proprietorName?: string | null): string {
    return proprietorUrl(proprietorName) ?? '/trademark-search-by-company';
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

  trackById(_: number, item: ITrademark) {
    return item.applicationNo;
  }

  toggleFaq(index: number): void {
    this.openFaqIndex = this.openFaqIndex === index ? null : index;
  }

  focusSearchInput(): void {
    this.companyNameInput?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.companyNameInput?.nativeElement.focus();
  }

  private setSeoTags(): void {
    const title = 'Trademark Search by Company Name | Find a Business\'s Filings | Trademarx';
    const description =
      'Search all Indian trademark applications filed by a company, LLP, or proprietor by name — see every mark, class, and status on record. Free instant lookup.';
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://trademarx.in/trademark-search-by-company' });
    this.meta.updateTag({ property: 'og:image', content: 'https://trademarx.in/assets/images/trademarx.png' });
    this.seo.setCanonical('https://trademarx.in/trademark-search-by-company');
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
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: title,
          description,
          url: 'https://trademarx.in/trademark-search-by-company',
          isPartOf: { '@type': 'WebSite', name: 'Trademarx', url: 'https://trademarx.in' },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: this.faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        },
      ],
      'trademark-search-by-company',
    );
  }
}

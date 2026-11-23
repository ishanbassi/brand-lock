import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LiveSearchComponent } from '../live-search/live-search.component';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TrademarkPlanCardsComponent } from '../trademark-plan-cards/trademark-plan-cards.component';
import { TrademarkSearchContentComponent } from '../trademark-search-content/trademark-search-content.component';
import { MobileBottomNavbarComponent } from '../mobile-bottom-navbar/mobile-bottom-navbar.component';
import { ITrademark } from '../../models/trademark.model';
import { SimilarityMatchType } from '../enumerations/similarity-match-type.model';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';
import { TrademarkService } from '../shared/services/trademark.service';
import { LoadingService } from '../common/loading.service';
import { finalize } from 'rxjs';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-trademark-search-result',
  imports: [LiveSearchComponent, SharedModule, ReactiveFormsModule, TrademarkPlanCardsComponent, TrademarkSearchContentComponent, MobileBottomNavbarComponent],
  templateUrl: './trademark-search-result.component.html',
  styleUrl: './trademark-search-result.component.scss'
})
export class TrademarkSearchResultComponent implements OnInit, OnDestroy {

  constructor(
    private readonly route: ActivatedRoute,
    private readonly trademarkService: TrademarkService,
    private readonly loadingService: LoadingService,
    private title: Title,
    private meta: Meta,
  ) { }
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const q = params.get('trademark');
      const tmClassParam = params.get('tmClass');
      const searchTypeParam = params.get('searchType');
      this.searchType = searchTypeParam === 'startswith' || searchTypeParam === 'phonetic' ? searchTypeParam : 'contains';
      const parsedClass = this.parseTmClass(tmClassParam);
      // An omitted class means all classes for normal text searches. Keep phonetic
      // work bounded even when someone arrives via a hand-crafted results URL.
      this.tmClass = this.searchType === 'phonetic' && parsedClass == null ? 1 : parsedClass;
      this.clearPhoneticPolling();
      this.phoneticRunId = undefined;
      this.phoneticProcessing = false;
      if (q) {
        this.query = q;
        this.currentPage = 0;
        this.loadPage(0);
      }
      else {
        this.query = undefined;
        this.results = [];
        this.totalResults = 0;
      }
    });
  }

  private loadPage(page: number): void {
    if (!this.query || page < 0 || (this.totalPages > 0 && page >= this.totalPages)) return;
    if (this.searchType === 'phonetic') {
      this.loadPhoneticPage(page);
      return;
    }
    if (this.isBrowser) {
      this.loadingService.show();
    }
    this.isLoading = true;
    this.trademarkService.quickSearch(this.query, this.tmClass, { page, size: this.pageSize, searchType: this.searchType })
          .pipe(
            finalize(() => {
              if (this.isBrowser) {
                this.loadingService.hide();
              }
              this.isLoading = false;
            })
          )
          .subscribe(res => {
            this.results = res.body;
            this.totalResults = Number(res.headers.get('X-Total-Count')) || 0;
            this.currentPage = page;
            this.setSeoTags();
          });
  }

  private loadPhoneticPage(page: number): void {
    // Keep this guard at the request boundary as well as in the UI and route
    // parsing, so no call path can issue an all-class phonetic search.
    if (this.tmClass == null) this.tmClass = 1;
    const request = this.phoneticRunId
      ? this.trademarkService.getPhoneticSearchRun(this.phoneticRunId, page, this.pageSize)
      : this.trademarkService.startPhoneticSearchRun(this.query!, this.tmClass, page, this.pageSize);
    if (!this.results?.length) this.isLoading = true;
    request.subscribe({
      next: result => {
        this.phoneticRunId = result.runId;
        this.results = result.results;
        this.totalResults = result.totalResults;
        this.currentPage = result.page;
        this.phoneticProcessing = result.status === 'QUEUED' || result.status === 'RUNNING';
        this.isLoading = false;
        this.setSeoTags();
        this.clearPhoneticPolling();
        if (this.phoneticProcessing) {
          this.phoneticPollTimer = setTimeout(() => this.loadPhoneticPage(this.currentPage), 1500);
        }
      },
      error: () => {
        this.isLoading = false;
        this.phoneticProcessing = false;
      },
    });
  }

  private clearPhoneticPolling(): void {
    if (this.phoneticPollTimer) clearTimeout(this.phoneticPollTimer);
    this.phoneticPollTimer = undefined;
  }

  private parseTmClass(value: string | null): number | null {
    const tmClass = Number(value);
    return Number.isInteger(tmClass) && tmClass >= 1 && tmClass <= 45 ? tmClass : null;
  }

  query?: string;
  tmClass: number | null = null;
  results: ITrademark[] | null = [];
  baseUrl = environment.BaseApiUrl;
  private isBrowser = false;
  isLoading = false;
  totalResults = 0;
  readonly pageSize = 20;
  currentPage = 0;
  searchType: 'startswith' | 'contains' | 'phonetic' = 'contains';
  viewMode: 'grid' | 'list' = 'grid';
  phoneticProcessing = false;
  private phoneticRunId?: string;
  private phoneticPollTimer?: ReturnType<typeof setTimeout>;
  get totalPages(): number {
    return Math.ceil(this.totalResults / this.pageSize);
  }
  @ViewChild('searchBoxWrapper') searchBoxWrapper!: ElementRef;

  focusOnSearchBar() {
    if (this.searchBoxWrapper) {
      const firstInput = this.searchBoxWrapper.nativeElement.querySelector('input#trademarkSearchBar');
      if (firstInput) {
        firstInput.focus();
      }
    }



  }
  trackById(_: number, item: ITrademark) {
    return item.id;
  }

  previousPage(): void {
    this.loadPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.loadPage(this.currentPage + 1);
  }

  goToPage(page: number): void {
    if (page !== this.currentPage) this.loadPage(page);
  }

  setSearchType(value: 'startswith' | 'contains' | 'phonetic'): void {
    if (this.searchType !== value) {
      this.clearPhoneticPolling();
      this.phoneticRunId = undefined;
      this.phoneticProcessing = false;
      this.currentPage = 0;
    }
    this.searchType = value;
    if (value === 'phonetic' && this.tmClass == null) {
      this.tmClass = 1;
    }
    this.loadPage(0);
  }

  pageNumbers(): number[] {
    const pages = this.totalPages;
    if (pages <= 1) return [];
    const start = Math.max(0, Math.min(this.currentPage - 2, pages - 5));
    return Array.from({ length: Math.min(5, pages - start) }, (_, index) => start + index);
  }

  isWordmark(trademark: ITrademark): boolean {
    return String(trademark.type ?? '').toUpperCase().includes('WORD');
  }

  wordmarkInitials(name?: string | null): string {
    const words = (name ?? '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return 'TM';
    return words.length === 1 ? words[0].slice(0, 2).toUpperCase() : words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
  }

  highlight(text?: string | null): string {
    if (!text) return '';

    if (!this.query) return text;
    const regex = new RegExp(`(${this.query})`, 'gi');
    return text.substring(0,100).replace(regex, '<mark>$1</mark>');
  }

  /**
   * Why an embedded mark is on the page, said in the visitor's words.
   *
   * These rows do not resemble the search term as wholes — "ZARA" against "AAFIZARA" is half a
   * different string — so they would read as noise without the reason being given. Returns an
   * empty string for ordinary results, which the template treats as nothing to show.
   */
  embeddedNote(trademark: ITrademark): string {
    const mark = (trademark.embeddedMark ?? '').toUpperCase();
    if (!mark) return '';
    if (trademark.matchType === SimilarityMatchType.CONTAINS_MARK) {
      return `Your search contains the registered mark “${mark}”.`;
    }
    if (trademark.matchType === SimilarityMatchType.CONTAINED_IN_MARK) {
      return `This mark contains “${mark}”.`;
    }
    return '';
  }

  getStatusClass(status?: string): string {
    const normalized = (status ?? '').toLowerCase();
    if (/(registered|active|accepted)/.test(normalized)) return 'status-active';
    if (/(objected|opposed|expired|withdrawn|refused)/.test(normalized)) return 'status-warning';
    if (/(pending|process|exam)/.test(normalized)) return 'status-pending';
    return 'status-neutral';
  }

  ngOnDestroy(): void {
    this.clearPhoneticPolling();
    this.meta.removeTag("name='robots'");
  }

  setSeoTags() {
    this.title.setTitle(`Search Results For ${this.query}, ${this.totalResults} results found`);
    this.meta.updateTag({
      name: 'description',
      content: `Trademark Search Results for ${this.query}, ${this.totalResults} results found. `
    });
    this.meta.updateTag({ name: 'robots', content: 'noindex, follow' });
    this.meta.updateTag({
      property: 'og:title',
      content: `Search Results For ${this.query}, ${this.totalResults} results found`
    });

    this.meta.updateTag({
      property: 'og:description',
      content: `Search Results For ${this.query}, ${this.totalResults} results found`
    });

  }


}

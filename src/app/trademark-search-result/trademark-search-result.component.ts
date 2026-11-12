import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { LiveSearchComponent } from '../live-search/live-search.component';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TrademarkPlanCardsComponent } from '../trademark-plan-cards/trademark-plan-cards.component';
import { TrademarkSearchContentComponent } from '../trademark-search-content/trademark-search-content.component';
import { MobileBottomNavbarComponent } from '../mobile-bottom-navbar/mobile-bottom-navbar.component';
import { SearchCtaSectionComponent } from '../search-cta-section/search-cta-section.component';
import { SearchExpertOpinionComponent } from '../search-expert-opinion/search-expert-opinion.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
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
  imports: [LiveSearchComponent, SharedModule, ReactiveFormsModule, TrademarkPlanCardsComponent, TrademarkSearchContentComponent, MobileBottomNavbarComponent, SearchCtaSectionComponent, SearchExpertOpinionComponent, FirmBannerComponent],
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
      this.tmClass = tmClassParam ? Number(tmClassParam) : null;
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
    if (this.isBrowser) {
      this.loadingService.show();
    }
    this.isLoading = true;
    this.trademarkService.quickSearch(this.query, this.tmClass, { page, size: this.pageSize })
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

  query?: string;
  tmClass: number | null = null;
  results: ITrademark[] | null = [];
  baseUrl = environment.BaseApiUrl;
  private isBrowser = false;
  isLoading = false;
  totalResults = 0;
  readonly pageSize = 20;
  currentPage = 0;
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

  ngOnDestroy(): void {
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

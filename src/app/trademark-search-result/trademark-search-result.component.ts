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

        if (this.isBrowser) {
          this.loadingService.show();
        }
        this.isLoading = true;
        this.query = q;
        this.trademarkService.quickSearch(this.query, this.tmClass)
          .pipe(
            finalize(() => {
              if (this.isBrowser) {
                this.loadingService.hide();
              }
              this.isLoading = false;
            })
          )
          .subscribe(res => {
            this.results = res.body
            this.totalResults = this.results?.length || 0;
            this.setSeoTags();
          })
      }
      else {
        this.query = undefined;
      }
    });
  }

  query?: string;
  tmClass: number | null = null;
  results: ITrademark[] | null = [];
  baseUrl = environment.BaseApiUrl;
  private isBrowser = false;
  isLoading = false;
  totalResults = 0;
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

  highlight(text?: string | null): string {
    if (!text) return '';

    if (!this.query) return text;
    const regex = new RegExp(`(${this.query})`, 'gi');
    return text.substring(0,100).replace(regex, '<mark>$1</mark>');
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

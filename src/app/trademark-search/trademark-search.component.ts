import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, inject, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { environment } from '../../environments/environment';
import { LeadFormService } from '../../models/lead-form.service';
import { ITrademark } from '../../models/trademark.model';
import { LoadingService } from '../common/loading.service';
import { FooterV2Component } from '../footer-v2/footer-v2.component';
import { LiveSearchComponent } from '../live-search/live-search.component';
import { MobileBottomNavbarComponent } from '../mobile-bottom-navbar/mobile-bottom-navbar.component';
import { NavbarV2Component } from '../navbar-v2/navbar-v2.component';
import { SearchCtaSectionComponent } from '../search-cta-section/search-cta-section.component';
import { TrademarkService } from '../shared/services/trademark.service';
import { SharedModule } from '../shared/shared.module';
import { TrademarkPlanCardsComponent } from '../trademark-plan-cards/trademark-plan-cards.component';
import { TrademarkPulseComponent } from '../trademark-pulse/trademark-pulse.component';
import { TrademarkSearchContentComponent } from '../trademark-search-content/trademark-search-content.component';

export interface Statistic {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-trademark-search',
  imports: [NavbarV2Component, LiveSearchComponent, SharedModule, ReactiveFormsModule, FooterV2Component, TrademarkPlanCardsComponent, TrademarkSearchContentComponent, MobileBottomNavbarComponent,SearchCtaSectionComponent,TrademarkPulseComponent],
  templateUrl: './trademark-search.component.html',
  styleUrl: './trademark-search.component.scss'
})
export class TrademarkSearchComponent implements OnInit {

  protected leadFormService = inject(LeadFormService);
  leadForm = this.leadFormService.createLeadFormGroup();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly trademarkService: TrademarkService,
    private readonly loadingService: LoadingService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private title: Title,
    private meta: Meta,

  ) {
    this.isBrowser = isPlatformBrowser(platformId);

  }

  query?: string;
  results: ITrademark[] | null = [];
  baseUrl = environment.BaseApiUrl;
  private isBrowser = false;
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
    this.route.queryParamMap.subscribe(params => {
      const q = params.get('trademark');
      if (q) {

        if (this.isBrowser) {
          this.loadingService.show();
        }
        this.isLoading = true;
        this.query = q;
        this.trademarkService.quickSearch(this.query)
          .pipe(
            finalize(() => {
              if (this.isBrowser) {
                this.loadingService.hide();
              }
              this.isLoading = false;
            })
          )
          .subscribe(res => {
            console.log(res.body)
            this.results = res.body
            this.totalResults = this.results?.length || 0;
          })
      }
    });
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
    console.log(this.searchBoxWrapper)
    if (this.searchBoxWrapper) {
      const firstInput = this.searchBoxWrapper.nativeElement.querySelector('input#trademarkSearchBar');
      if (firstInput) {
        firstInput.focus();
      }
    }



  }
  setSeoTags() {
    this.title.setTitle('New Trademark Search India - Find a trademark');
    this.meta.updateTag({
      name: 'description',
      content: `Run a free trademark search in India. Instantly check brand name availability, phonetic matches, and class-wise conflicts before trademark filing.`
    });
    this.meta.updateTag({
      property: 'og:title',
      content: 'Free Trademark Search India - Check Brand Name Availability'
    });

    this.meta.updateTag({
      property: 'og:description',
      content: `Run a free trademark search in India. Instantly check brand name availability, phonetic matches, and class-wise conflicts before trademark filing.`
    });
    this.meta.updateTag({
        property: 'og:image',
        content: 'https://cms.trademarx.in/uploads/Chat_GPT_Image_Mar_9_2026_10_00_37_AM_66fd097b9a.jpg'
      });


    if (isPlatformBrowser(this.platformId)) {
      const url = this.document.location.href;
      this.meta.updateTag({
        property: 'og:url',
        content: url
      });

    };
  }

  trackByIndex(index: number): number {
    return index;
  }



}

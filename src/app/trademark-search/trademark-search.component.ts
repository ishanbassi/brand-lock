import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { environment } from '../../environments/environment';
import { ITrademark } from '../../models/trademark.model';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { FooterV2Component } from '../footer-v2/footer-v2.component';
import { LiveSearchComponent } from '../live-search/live-search.component';
import { MobileBottomNavbarComponent } from '../mobile-bottom-navbar/mobile-bottom-navbar.component';
import { NavbarV2Component } from '../navbar-v2/navbar-v2.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
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
  imports: [NavbarV2Component, LiveSearchComponent, CommonModule, RouterModule, FooterV2Component, TrademarkPlanCardsComponent, TrademarkSearchContentComponent, MobileBottomNavbarComponent,TrademarkPulseComponent, FirmBannerComponent,RatingReviewComponent],
  templateUrl: './trademark-search.component.html',
  styleUrl: './trademark-search.component.scss'
})
export class TrademarkSearchComponent implements OnInit {
  
  constructor(

    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
    private title: Title,
    private meta: Meta,

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
    this.title.setTitle('Check Trademark Availability | Free Trademark Search Report | Trademarx');
    this.meta.updateTag({
      name: 'description',
      content: `Run a free trademark search in India. Instantly check brand name availability, phonetic matches, and class-wise conflicts before trademark filing.`
    });
    this.meta.updateTag({
      property: 'og:title',
      content: 'Check Trademark Availability | Free Trademark Search Report | Trademarx'
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

  



}

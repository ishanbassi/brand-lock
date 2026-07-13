import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { finalize } from 'rxjs';
import { SharedModule } from '../shared/shared.module';
import { TrademarkService } from '../shared/services/trademark.service';
import { SeoService } from '../shared/services/seo.service';
import { ITrademark } from '../../models/trademark.model';
import { environment } from '../../environments/environment';
import { MobileBottomNavbarComponent } from '../mobile-bottom-navbar/mobile-bottom-navbar.component';

@Component({
  selector: 'app-trademark-application-search',
  imports: [SharedModule, FormsModule, MobileBottomNavbarComponent],
  templateUrl: './trademark-application-search.component.html',
  styleUrl: './trademark-application-search.component.scss',
})
export class TrademarkApplicationSearchComponent implements OnInit, OnDestroy {
  applicationNo = '';
  results: ITrademark[] | null = null;
  isLoading = false;
  hasSearched = false;
  baseUrl = environment.BaseApiUrl;

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

    const queryAppNo = this.route.snapshot.queryParamMap.get('applicationNo');
    if (queryAppNo) {
      this.applicationNo = queryAppNo;
      this.search();
    }
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd('trademark-application-search');
  }

  search(): void {
    const value = this.applicationNo.trim();
    if (!value) {
      return;
    }

    this.router.navigate([], { relativeTo: this.route, queryParams: { applicationNo: value } });

    this.isLoading = true;
    this.hasSearched = true;
    this.trademarkService
      .searchByApplicationNumber(value)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: res => {
          this.results = res.body ?? [];
        },
        error: () => {
          this.results = [];
        },
      });
  }

  imgSrc(trademark: ITrademark): string {
    return trademark.imgUrl ? this.baseUrl + 'files/' + trademark.imgUrl : '/assets/images/trademark.png';
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

  private setSeoTags(): void {
    const title = 'Trademark Status Check by Application Number | Trademarx';
    const description =
      'Check the live status of any Indian trademark application by its application number — objection, opposition, registered, or pending. Free instant lookup.';
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://trademarx.in/trademark-status-check' });
    this.meta.updateTag({ property: 'og:image', content: 'https://trademarx.in/assets/images/trademarx.png' });
    this.seo.setCanonical('https://trademarx.in/trademark-status-check');
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
              name: 'Trademark Status Check',
              item: 'https://trademarx.in/trademark-status-check',
            },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: title,
          description,
          url: 'https://trademarx.in/trademark-status-check',
          isPartOf: { '@type': 'WebSite', name: 'Trademarx', url: 'https://trademarx.in' },
        },
      ],
      'trademark-application-search',
    );
  }
}

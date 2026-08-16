import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { SharedModule } from '../shared/shared.module';
import { TrademarkService } from '../shared/services/trademark.service';
import { SeoService } from '../shared/services/seo.service';
import { ITrademark } from '../../models/trademark.model';
import { environment } from '../../environments/environment';
import { MobileBottomNavbarComponent } from '../mobile-bottom-navbar/mobile-bottom-navbar.component';
import { proprietorUrl } from '../shared/utils/proprietor-slug.util';

interface SortableColumn {
  field: string;
  label: string;
}

@Component({
  selector: 'app-latest-trademark-applications',
  imports: [SharedModule, FormsModule, MobileBottomNavbarComponent],
  templateUrl: './latest-trademark-applications.component.html',
  styleUrl: './latest-trademark-applications.component.scss',
})
export class LatestTrademarkApplicationsComponent implements OnInit, OnDestroy {
  trademarks: ITrademark[] = [];
  loading = true;
  error = false;
  baseUrl = environment.BaseApiUrl;

  searchTerm = '';
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  totalPages = 0;
  pages: number[] = [];

  sortField = 'applicationNo';
  sortDir: 'asc' | 'desc' = 'desc';

  readonly columns: SortableColumn[] = [
    { field: 'name', label: 'Trademark' },
    { field: 'applicationDate', label: 'Application Date' },
    { field: 'applicationNo', label: 'Application No.' },
    { field: 'tmClass', label: 'Class' },
    { field: 'proprietorName', label: 'Applicant' },
    { field: 'trademarkStatus', label: 'Status' },
  ];

  private readonly searchDebounce = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
    private meta: Meta,
    private trademarkService: TrademarkService,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.setSeoTags();

    this.searchDebounce.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { q: this.searchTerm || null, page: 1 },
        queryParamsHandling: 'merge',
      });
    });

    this.route.queryParams.subscribe(params => {
      this.currentPage = params['page'] ? +params['page'] : 1;
      this.searchTerm = params['q'] || '';
      const [field, dir] = (params['sort'] || 'applicationNo,desc').split(',');
      this.sortField = field;
      this.sortDir = dir === 'asc' ? 'asc' : 'desc';
      this.load();
    });
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd('latest-applications');
  }

  load(): void {
    this.loading = true;
    this.error = false;
    const req: any = {
      page: this.currentPage - 1,
      size: this.pageSize,
      sort: `${this.sortField},${this.sortDir}`,
    };
    if (this.searchTerm.trim()) {
      req['name.contains'] = this.searchTerm.trim();
    }

    this.trademarkService.queryLatestApplications(req).subscribe({
      next: res => {
        this.trademarks = res.body ?? [];
        this.totalItems = Number(res.headers.get('X-Total-Count')) || 0;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.pages = this.buildPageWindow();
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  /** A window of page numbers around the current page — the corpus can span lakhs of rows. */
  private buildPageWindow(): number[] {
    const windowSize = 2;
    const start = Math.max(1, this.currentPage - windowSize);
    const end = Math.min(this.totalPages, this.currentPage + windowSize);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  onSearchChange(): void {
    this.searchDebounce.next();
  }

  sortQueryParams(field: string): Record<string, string | number> {
    const nextDir = this.sortField === field && this.sortDir === 'asc' ? 'desc' : 'asc';
    return { sort: `${field},${nextDir}`, page: 1 };
  }

  imgSrc(trademark: ITrademark): string {
    return trademark.imgUrl ? this.baseUrl + 'files/' + trademark.imgUrl : '/assets/images/trademark.png';
  }

  /** That applicant's own portfolio page; falls back to the search hub for unusable names. */
  portfolioUrl(proprietorName?: string | null): string {
    return proprietorUrl(proprietorName) ?? '/trademark-search-by-company';
  }

  private setSeoTags(): void {
    const title = 'Latest Trademark Applications Filed in India | Live Registry Updates — Trademarx';
    const description =
      'Browse the latest trademark applications filed with the India Trademark Registry. Search by brand name, check class, applicant and status — updated daily. File your own trademark from ₹1,499.';
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://trademarx.in/latest-trademark-applications' });
    this.meta.updateTag({ property: 'og:image', content: 'https://trademarx.in/assets/images/trademarx.png' });
    this.seo.setCanonical('https://trademarx.in/latest-trademark-applications');
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
              name: 'Latest Trademark Applications',
              item: 'https://trademarx.in/latest-trademark-applications',
            },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Latest Trademark Applications Filed in India',
          description,
          url: 'https://trademarx.in/latest-trademark-applications',
          isPartOf: { '@type': 'WebSite', name: 'Trademarx', url: 'https://trademarx.in' },
        },
      ],
      'latest-applications',
    );
  }
}

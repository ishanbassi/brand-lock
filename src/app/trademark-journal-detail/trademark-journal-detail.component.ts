import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { SharedModule } from '../shared/shared.module';
import { TrademarkService } from '../shared/services/trademark.service';
import { ITrademark } from '../../models/trademark.model';
import { environment } from '../../environments/environment';

interface SortableColumn {
  field: string;
  label: string;
}

@Component({
  selector: 'app-trademark-journal-detail',
  imports: [SharedModule, FormsModule],
  templateUrl: './trademark-journal-detail.component.html',
  styleUrl: './trademark-journal-detail.component.scss',
})
export class TrademarkJournalDetailComponent implements OnInit {
  journalNo!: number;
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
  ) {}

  ngOnInit(): void {
    this.journalNo = Number(this.route.snapshot.paramMap.get('journalNo'));

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

    this.trademarkService.queryByJournal(this.journalNo, req).subscribe({
      next: res => {
        this.trademarks = res.body ?? [];
        this.totalItems = Number(res.headers.get('X-Total-Count')) || 0;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.pages = this.buildPageWindow();
        this.loading = false;
        this.setSeoTags();
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  /** A window of page numbers around the current page — a journal can hold thousands of marks. */
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

  private setSeoTags(): void {
    const title = `Trademark Journal No. ${this.journalNo} — Published Trademarks | Trademarx`;
    const description = `Browse ${this.totalItems} trademarks published in India Trademark Journal No. ${this.journalNo}.`;
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
  }
}

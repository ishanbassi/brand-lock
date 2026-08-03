import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ITrademark } from '../../../models/trademark.model';
import { AdminScrapedTrademarkService } from '../services/admin-scraped-trademark.service';
import { environment } from '../../../environments/environment';

type SortField = 'id' | 'name' | 'tmClass' | 'applicationNo' | 'journalNo';
type SortDir = 'asc' | 'desc';

@Component({
  selector: 'app-admin-scraped-trademarks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-scraped-trademarks.component.html',
  styleUrl: './admin-scraped-trademarks.component.scss',
})
export class AdminScrapedTrademarksComponent implements OnInit {
  private readonly adminScrapedTrademarkService = inject(AdminScrapedTrademarkService);

  records = signal<ITrademark[]>([]);
  loading = signal(true);
  error = signal('');

  // Filters
  search = '';
  ocrOnly = false;

  // Sorting
  sortField = signal<SortField>('id');
  sortDir = signal<SortDir>('asc');

  // Pagination
  page = signal(0);
  readonly pageSize = 30;
  totalItems = signal(0);

  private readonly baseUrl = environment.BaseApiUrl;
  private readonly searchDebounce = new Subject<void>();

  ngOnInit(): void {
    this.searchDebounce.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page.set(0);
      this.load();
    });
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const req: any = {
      page: this.page(),
      size: this.pageSize,
      sort: `${this.sortField()},${this.sortDir()}`,
    };
    if (this.ocrOnly) req['ocrExtracted.equals'] = true;
    if (this.search.trim()) req['name.contains'] = this.search.trim();

    this.adminScrapedTrademarkService.query(req).subscribe({
      next: res => {
        this.records.set(res.body ?? []);
        this.totalItems.set(Number(res.headers.get('X-Total-Count')) || 0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load trademarks.');
        this.loading.set(false);
      },
    });
  }

  onSearchChange(): void {
    this.searchDebounce.next();
  }

  onOcrToggleChange(): void {
    this.page.set(0);
    this.load();
  }

  clearFilters(): void {
    this.search = '';
    this.ocrOnly = false;
    this.page.set(0);
    this.load();
  }

  toggleSort(field: SortField): void {
    if (this.sortField() === field) {
      this.sortDir.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }
    this.page.set(0);
    this.load();
  }

  sortIndicator(field: SortField): string {
    if (this.sortField() !== field) return '';
    return this.sortDir() === 'asc' ? '▲' : '▼';
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems() / this.pageSize));
  }

  prevPage(): void {
    if (this.page() > 0) {
      this.page.update(p => p - 1);
      this.load();
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages - 1) {
      this.page.update(p => p + 1);
      this.load();
    }
  }

  imgSrc(trademark: ITrademark): string {
    return trademark.imgUrl ? this.baseUrl + 'files/' + trademark.imgUrl : '/assets/images/trademark.png';
  }
}

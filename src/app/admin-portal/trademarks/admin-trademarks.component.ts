import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ITrademark } from '../../../models/trademark.model';
import { AdminTrademarkService } from '../services/admin-trademark.service';
import {
  TRADEMARK_STATUS_OPTIONS,
  trademarkStatusBadgeClass,
  trademarkStatusLabel,
} from '../shared/trademark-status.util';

@Component({
  selector: 'app-admin-trademarks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-trademarks.component.html',
  styleUrl: './admin-trademarks.component.scss',
})
export class AdminTrademarksComponent implements OnInit {
  private readonly adminTrademarkService = inject(AdminTrademarkService);

  trademarks = signal<ITrademark[]>([]);
  loading = signal(true);
  error = signal('');

  // Filters
  search = '';
  statusFilter = '';
  classFilter = '';

  // Pagination
  page = signal(0);
  readonly pageSize = 20;
  totalItems = signal(0);

  readonly statusOptions = TRADEMARK_STATUS_OPTIONS;
  readonly badgeClass = trademarkStatusBadgeClass;
  readonly statusLabel = trademarkStatusLabel;

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
      sort: 'createdDate,desc',
      'deleted.equals': false,
    };
    if (this.search.trim()) req['name.contains'] = this.search.trim();
    if (this.statusFilter) req['trademarkStatus.equals'] = this.statusFilter;
    if (this.classFilter) req['tmClass.equals'] = this.classFilter;

    this.adminTrademarkService.query(req).subscribe({
      next: res => {
        this.trademarks.set(res.body ?? []);
        this.totalItems.set(Number(res.headers.get('X-Total-Count')) || 0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load applications.');
        this.loading.set(false);
      },
    });
  }

  onSearchChange(): void {
    this.searchDebounce.next();
  }

  onFilterChange(): void {
    this.page.set(0);
    this.load();
  }

  clearFilters(): void {
    this.search = '';
    this.statusFilter = '';
    this.classFilter = '';
    this.page.set(0);
    this.load();
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
}

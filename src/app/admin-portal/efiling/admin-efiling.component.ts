import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminEfilingService } from '../services/admin-efiling.service';
import {
  EFILING_STATUS_OPTIONS,
  EfilingChecklist,
  EfilingStatus,
  efilingBadgeClass,
  efilingStatusLabel,
  signerIdBadgeClass,
  signerIdStatusLabel,
} from '../shared/efiling.model';

/**
 * The assisted self-filing queue. Each row carries its full checklist, so the blocker
 * count is shown without a request per row — an admin can see at a glance which
 * applications are actually workable before opening any of them.
 */
@Component({
  selector: 'app-admin-efiling',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-efiling.component.html',
  styleUrl: './admin-efiling.component.scss',
})
export class AdminEfilingComponent implements OnInit {
  private readonly efilingService = inject(AdminEfilingService);

  rows = signal<EfilingChecklist[]>([]);
  loading = signal(true);
  error = signal('');

  statusFilter: EfilingStatus | '' = '';

  page = signal(0);
  readonly pageSize = 20;
  totalItems = signal(0);

  readonly statusOptions = EFILING_STATUS_OPTIONS;
  readonly badgeClass = efilingBadgeClass;
  readonly statusLabel = efilingStatusLabel;
  readonly signerBadgeClass = signerIdBadgeClass;
  readonly signerLabel = signerIdStatusLabel;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.efilingService
      .queue({
        status: this.statusFilter || undefined,
        page: this.page(),
        size: this.pageSize,
        sort: ['createdDate,desc'],
      })
      .subscribe({
        next: res => {
          this.rows.set(res.body ?? []);
          this.totalItems.set(Number(res.headers.get('X-Total-Count')) || 0);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Failed to load the filing queue.');
          this.loading.set(false);
        },
      });
  }

  onFilterChange(): void {
    this.page.set(0);
    this.load();
  }

  clearFilters(): void {
    this.statusFilter = '';
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

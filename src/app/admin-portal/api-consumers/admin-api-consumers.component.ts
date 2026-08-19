import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IApiConsumer } from '../../../models/api-consumer.model';
import { AdminApiConsumerService } from '../services/admin-api-consumer.service';
import {
  API_CONSUMER_STATUS_OPTIONS,
  API_TIER_OPTIONS,
  apiConsumerStatusBadgeClass,
  apiConsumerStatusLabel,
} from '../shared/api-consumer-status.util';

@Component({
  selector: 'app-admin-api-consumers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-api-consumers.component.html',
  styleUrl: './admin-api-consumers.component.scss',
})
export class AdminApiConsumersComponent implements OnInit {
  private readonly adminApiConsumerService = inject(AdminApiConsumerService);

  consumers = signal<IApiConsumer[]>([]);
  loading = signal(true);
  error = signal('');
  success = signal('');

  statusFilter = '';

  page = signal(0);
  readonly pageSize = 20;
  totalItems = signal(0);

  readonly statusOptions = API_CONSUMER_STATUS_OPTIONS;
  readonly tierOptions = API_TIER_OPTIONS;
  readonly badgeClass = apiConsumerStatusBadgeClass;
  readonly statusLabel = apiConsumerStatusLabel;

  expandedRowId = signal<number | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const req: any = {
      page: this.page(),
      size: this.pageSize,
      sort: 'createdDate,desc',
    };
    if (this.statusFilter) req['status'] = this.statusFilter;

    this.adminApiConsumerService.query(req).subscribe({
      next: res => {
        this.consumers.set(res.body ?? []);
        this.totalItems.set(Number(res.headers.get('X-Total-Count')) || 0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load API consumers.');
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

  toggleRow(consumer: IApiConsumer): void {
    this.expandedRowId.set(this.expandedRowId() === consumer.id ? null : consumer.id);
  }

  isExpanded(id: number): boolean {
    return this.expandedRowId() === id;
  }

  onStatusChange(consumer: IApiConsumer, status: string): void {
    this.saveConsumer({ id: consumer.id, status: status as any });
  }

  onTierChange(consumer: IApiConsumer, tier: string): void {
    this.saveConsumer({ id: consumer.id, tier: tier as any });
  }

  revoke(consumer: IApiConsumer): void {
    if (!confirm(`Revoke API access for ${consumer.name || consumer.email}? This immediately blocks their key.`)) return;
    this.saveConsumer({ id: consumer.id, status: 'REVOKED' as any });
  }

  private saveConsumer(patch: Partial<IApiConsumer> & { id: number }): void {
    this.adminApiConsumerService.update(patch).subscribe({
      next: res => {
        const updated = res.body!;
        this.consumers.update(list => list.map(c => (c.id === updated.id ? updated : c)));
        this.success.set('Saved.');
        setTimeout(() => this.success.set(''), 1500);
      },
      error: () => this.error.set('Failed to save changes.'),
    });
  }
}

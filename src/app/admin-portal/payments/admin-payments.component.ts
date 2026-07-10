import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminPaymentService } from '../services/admin-payment.service';
import {
  IAdminPayment,
  PAYMENT_PURPOSE_OPTIONS,
  paymentPurposeLabel,
  paymentStatusBadgeClass,
} from '../shared/admin-payment.model';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-payments.component.html',
  styleUrl: './admin-payments.component.scss',
})
export class AdminPaymentsComponent implements OnInit {
  private readonly adminPaymentService = inject(AdminPaymentService);

  payments = signal<IAdminPayment[]>([]);
  loading = signal(true);
  error = signal('');

  // Filters
  purposeFilter = '';
  statusFilter = '';

  // Pagination
  page = signal(0);
  readonly pageSize = 20;
  totalItems = signal(0);

  readonly purposeOptions = PAYMENT_PURPOSE_OPTIONS;
  readonly badgeClass = paymentStatusBadgeClass;
  readonly purposeLabel = paymentPurposeLabel;

  ngOnInit(): void {
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
    if (this.purposeFilter) req['purpose.equals'] = this.purposeFilter;
    if (this.statusFilter.trim()) req['status.contains'] = this.statusFilter.trim();

    this.adminPaymentService.query(req).subscribe({
      next: res => {
        this.payments.set(res.body ?? []);
        this.totalItems.set(Number(res.headers.get('X-Total-Count')) || 0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load payments.');
        this.loading.set(false);
      },
    });
  }

  onFilterChange(): void {
    this.page.set(0);
    this.load();
  }

  clearFilters(): void {
    this.purposeFilter = '';
    this.statusFilter = '';
    this.page.set(0);
    this.load();
  }

  customerLabel(p: IAdminPayment): string {
    const u = p.userProfile;
    if (u && (u.firstName || u.lastName)) return `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
    return u?.email || '—';
  }

  applicationLabel(p: IAdminPayment): string {
    return p.trademark?.name || (p.trademark?.applicationNo ? `App. ${p.trademark.applicationNo}` : '—');
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

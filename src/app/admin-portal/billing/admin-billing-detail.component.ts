import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdminBillingService } from '../services/admin-billing.service';
import {
  IAdminSubscriptionDetail,
  rupees,
  subscriptionStatusBadgeClass,
  subscriptionStatusLabel,
} from '../shared/admin-billing.model';

/**
 * One subscription in full: its state, every charge, every webhook, and the by-hand actions
 * (force re-sync from Razorpay, cancel).
 */
@Component({
  selector: 'app-admin-billing-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-billing-detail.component.html',
  styleUrl: './admin-billing-detail.component.scss',
})
export class AdminBillingDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly billing = inject(AdminBillingService);
  private readonly toast = inject(ToastrService);

  detail = signal<IAdminSubscriptionDetail | null>(null);
  loading = signal(true);
  error = signal('');
  busy = signal<'' | 'sync' | 'cancel'>('');

  cancelOpen = signal(false);
  cancelImmediate = false;
  cancelNote = '';

  readonly badgeClass = subscriptionStatusBadgeClass;
  readonly statusLabel = subscriptionStatusLabel;
  readonly rupees = rupees;

  private id!: number;

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.billing.subscription(this.id).subscribe({
      next: res => {
        this.detail.set(res.body);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load this subscription.');
        this.loading.set(false);
      },
    });
  }

  readonly sub = computed(() => this.detail()?.subscription ?? null);

  readonly isRazorpayBacked = computed(() => !!this.sub()?.razorpaySubscriptionId);

  readonly canCancel = computed(() => {
    const s = this.sub()?.status;
    return s === 'ACTIVE' || s === 'PAST_DUE' || s === 'PAUSED' || s === 'TRIALING' || s === 'PENDING_AUTH';
  });

  sync(): void {
    this.busy.set('sync');
    this.billing.sync(this.id).subscribe({
      next: () => {
        this.busy.set('');
        this.toast.success('Re-synced from Razorpay');
        this.load();
      },
      error: err => {
        this.busy.set('');
        this.toast.error(err?.error?.detail || err?.error?.title || 'Sync failed');
      },
    });
  }

  submitCancel(): void {
    this.busy.set('cancel');
    this.billing.cancel(this.id, this.cancelImmediate, this.cancelNote).subscribe({
      next: () => {
        this.busy.set('');
        this.cancelOpen.set(false);
        this.toast.success(this.cancelImmediate ? 'Cancelled — access stopped' : 'Cancelled at period end');
        this.load();
      },
      error: err => {
        this.busy.set('');
        this.toast.error(err?.error?.detail || err?.error?.title || 'Cancel failed');
      },
    });
  }

  fmt(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  fmtDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  methodLabel(m: string | null): string {
    if (!m) return '—';
    const known: Record<string, string> = { upi: 'UPI', card: 'Card', netbanking: 'Netbanking', emandate: 'e-Mandate', nach: 'NACH' };
    return known[m.toLowerCase()] ?? m;
  }
}

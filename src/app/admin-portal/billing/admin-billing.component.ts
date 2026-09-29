import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdminBillingService } from '../services/admin-billing.service';
import {
  IAdminBillingOverview,
  IAdminPlan,
  IAdminSubscriptionRow,
  SUBSCRIPTION_STATUS_OPTIONS,
  rupees,
  subscriptionStatusBadgeClass,
  subscriptionStatusLabel,
} from '../shared/admin-billing.model';

/**
 * The admin billing console landing page: the numbers, the plans, and the subscriber list.
 *
 * Read-only except for two things an admin does from here: provisioning a plan in Razorpay
 * (a one-time setup step, shown prominently until it is done), and comping an agent by
 * TmAgent id. Per-subscription actions live on the detail page.
 */
@Component({
  selector: 'app-admin-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-billing.component.html',
  styleUrl: './admin-billing.component.scss',
})
export class AdminBillingComponent implements OnInit {
  private readonly billing = inject(AdminBillingService);
  private readonly toast = inject(ToastrService);

  overview = signal<IAdminBillingOverview | null>(null);
  plans = signal<IAdminPlan[]>([]);
  rows = signal<IAdminSubscriptionRow[]>([]);
  loading = signal(true);
  error = signal('');
  provisioningCode = signal<string | null>(null);

  statusFilter = '';
  page = signal(0);
  readonly pageSize = 25;
  totalItems = signal(0);

  readonly statusOptions = SUBSCRIPTION_STATUS_OPTIONS;
  readonly badgeClass = subscriptionStatusBadgeClass;
  readonly statusLabel = subscriptionStatusLabel;
  readonly rupees = rupees;

  // ── Comp panel ─────────────────────────────────────────────────────────────
  compOpen = signal(false);
  compAgentId = '';
  compDays = 90;
  compPlan = 'PRO_MONTHLY';
  compNote = '';
  comping = signal(false);

  readonly statusCounts = computed(() => {
    const c = this.overview()?.countsByStatus ?? {};
    return SUBSCRIPTION_STATUS_OPTIONS.filter(o => o.value && (c as any)[o.value]).map(o => ({
      label: o.label,
      value: o.value,
      count: (c as any)[o.value] as number,
    }));
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize)));

  ngOnInit(): void {
    this.loadOverview();
    this.loadPlans();
    this.loadRows();
  }

  private loadOverview(): void {
    this.billing.overview().subscribe({
      next: res => this.overview.set(res.body),
      error: () => {},
    });
  }

  private loadPlans(): void {
    this.billing.plans().subscribe({
      next: res => this.plans.set(res.body ?? []),
      error: () => {},
    });
  }

  loadRows(): void {
    this.loading.set(true);
    const req: any = { page: this.page(), size: this.pageSize, sort: 'createdDate,desc' };
    if (this.statusFilter) req['status'] = this.statusFilter;
    this.billing.subscriptions(req).subscribe({
      next: res => {
        this.rows.set(res.body ?? []);
        this.totalItems.set(Number(res.headers.get('X-Total-Count')) || 0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load subscriptions.');
        this.loading.set(false);
      },
    });
  }

  onFilterChange(): void {
    this.page.set(0);
    this.loadRows();
  }

  prevPage(): void {
    if (this.page() > 0) {
      this.page.update(p => p - 1);
      this.loadRows();
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages() - 1) {
      this.page.update(p => p + 1);
      this.loadRows();
    }
  }

  // ── Provisioning ───────────────────────────────────────────────────────────

  provision(plan: IAdminPlan): void {
    this.provisioningCode.set(plan.code);
    this.billing.provision(plan.code).subscribe({
      next: res => {
        this.provisioningCode.set(null);
        this.plans.update(list => list.map(p => (p.code === plan.code ? (res.body as IAdminPlan) : p)));
        this.toast.success(`${plan.name} provisioned in Razorpay`);
        this.loadOverview();
      },
      error: err => {
        this.provisioningCode.set(null);
        this.toast.error(err?.error?.detail || err?.error?.title || `Could not provision ${plan.name}`);
      },
    });
  }

  // ── Comp ───────────────────────────────────────────────────────────────────

  submitComp(): void {
    const id = Number(this.compAgentId);
    if (!id || this.compDays < 1) {
      this.toast.error('Enter a TmAgent id and a day count.');
      return;
    }
    this.comping.set(true);
    this.billing.comp(id, this.compDays, this.compPlan, this.compNote).subscribe({
      next: res => {
        this.comping.set(false);
        this.compOpen.set(false);
        this.compAgentId = '';
        this.compNote = '';
        this.toast.success(`Agent ${id} comped until ${this.fmtDate(res.body?.entitledUntil)}`);
        this.loadOverview();
        this.loadRows();
      },
      error: err => {
        this.comping.set(false);
        this.toast.error(err?.error?.detail || err?.error?.title || 'Comp failed');
      },
    });
  }

  // ── Display ────────────────────────────────────────────────────────────────

  firmLabel(r: IAdminSubscriptionRow): string {
    return r.firmName || r.contactName || r.email || `Agent ${r.tmAgentId}`;
  }

  fmtDate(iso: string | null | undefined): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  planIntervalLabel(interval: string | null): string {
    if (interval === 'MONTHLY') return '/mo';
    if (interval === 'ANNUAL') return '/yr';
    return '';
  }
}

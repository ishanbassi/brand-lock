import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { AgentBillingService, BillingState, CheckoutSession, FeatureEntitlement, SubscriptionPlan } from '../../shared/services/agent-billing.service';
import { IconComponent } from '../ui/icon.component';

interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
}

interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const FEATURE_LABELS: Record<string, string> = {
  PORTFOLIO_SIZE: 'Portfolio trademarks',
  COMPETITOR_WATCHES: 'Competitor watches',
  DOCUMENT_STORAGE_MB: 'Document storage',
  JOURNAL_WATCH: 'Journal watch',
  CONFLICT_ALERTS: 'Conflict alerts',
};

@Component({
  selector: 'app-agent-billing',
  standalone: true,
  imports: [CommonModule, DatePipe, IconComponent],
  templateUrl: './agent-billing.component.html',
  styleUrl: './agent-billing.component.scss',
})
export class AgentBillingComponent implements OnInit {
  readonly plans = signal<SubscriptionPlan[]>([]);
  readonly state = signal<BillingState | null>(null);
  readonly payments = signal<import('../../shared/services/agent-billing.service').SubscriptionPayment[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly actionError = signal('');
  readonly pendingPlan = signal<SubscriptionPlan | null>(null);
  readonly processing = signal(false);
  readonly confirmingCancel = signal(false);

  readonly features = computed(() => {
    const keys = new Set<string>();
    this.plans().forEach(plan => Object.keys(plan.entitlements ?? {}).forEach(key => keys.add(key)));
    Object.keys(this.state()?.entitlements ?? {}).forEach(key => keys.add(key));
    return [...keys].map(key => ({ key, label: FEATURE_LABELS[key] ?? this.labelFor(key) }));
  });

  constructor(private readonly billing: AgentBillingService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    let remaining = 3;
    const complete = () => {
      remaining -= 1;
      if (remaining === 0) this.loading.set(false);
    };
    this.billing.plans().subscribe({
      next: plans => {
        this.plans.set([...plans].sort((a, b) => a.sortOrder - b.sortOrder));
        complete();
      },
      error: () => {
        this.error.set('We could not load subscription plans. Please refresh and try again.');
        complete();
      },
    });
    this.billing.state().subscribe({
      next: state => {
        this.state.set(state);
        complete();
      },
      error: () => {
        this.error.set('We could not load your subscription. Please refresh and try again.');
        complete();
      },
    });
    this.billing.payments().subscribe({ next: payments => { this.payments.set(payments); complete(); }, error: complete });
  }

  choose(plan: SubscriptionPlan): void {
    if (this.processing() || this.isCurrentPlan(plan)) return;
    this.actionError.set('');
    this.pendingPlan.set(plan);
    this.confirmingCancel.set(false);
  }

  startCheckout(): void {
    const plan = this.pendingPlan();
    if (!plan || this.processing()) return;
    this.processing.set(true);
    this.actionError.set('');
    this.billing.subscribe(plan.code).subscribe({
      next: session => this.openCheckout(session),
      error: err => {
        this.processing.set(false);
        this.actionError.set(err?.error?.message || 'We could not start checkout. Please try again.');
      },
    });
  }

  cancelSubscription(): void {
    if (this.processing()) return;
    this.processing.set(true);
    this.actionError.set('');
    this.billing.cancel().subscribe({
      next: state => {
        this.state.set(state);
        this.confirmingCancel.set(false);
        this.processing.set(false);
      },
      error: err => {
        this.processing.set(false);
        this.actionError.set(err?.error?.message || 'We could not schedule cancellation. Please try again.');
      },
    });
  }

  entitlement(plan: SubscriptionPlan, feature: string): FeatureEntitlement | null {
    return plan.entitlements?.[feature] ?? null;
  }

  stateEntitlement(feature: string): FeatureEntitlement | null {
    return this.state()?.entitlements?.[feature] ?? null;
  }

  isCurrentPlan(plan: SubscriptionPlan): boolean {
    const state = this.state();
    return !!state && plan.code === state.subscribedPlanCode && !state.cancelAtPeriodEnd;
  }

  formatMoney(paise: number | null | undefined, currency = 'INR'): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format((paise ?? 0) / 100);
  }

  formatLimit(item: FeatureEntitlement | null, includeUsage = false): string {
    if (!item) return 'Not included';
    if (item.limit == null) return item.allowed ? 'Included' : 'Not included';
    const suffix = item.limit === 1 ? '' : '';
    return includeUsage && item.used != null ? `${item.used} of ${item.limit}${suffix}` : `${item.limit}`;
  }

  private openCheckout(session: CheckoutSession): void {
    this.loadRazorpay().then(() => {
      if (!window.Razorpay) throw new Error('Checkout could not be loaded.');
      const checkout = new window.Razorpay({
        key: session.razorpayKeyId,
        subscription_id: session.razorpaySubscriptionId,
        name: 'Trademarx',
        description: `${session.planName} subscription`,
        prefill: session.prefill ?? undefined,
        theme: { color: '#155eef' },
        handler: (response: RazorpaySuccess) => this.verifyCheckout(response),
        modal: { ondismiss: () => this.processing.set(false) },
      });
      checkout.open();
    }).catch(err => {
      this.processing.set(false);
      this.actionError.set(err?.message || 'Checkout could not be loaded. Please try again.');
    });
  }

  private verifyCheckout(response: RazorpaySuccess): void {
    this.billing.verify(response).subscribe({
      next: state => {
        this.state.set(state);
        this.pendingPlan.set(null);
        this.processing.set(false);
        this.billing.payments().subscribe({ next: payments => this.payments.set(payments) });
      },
      error: () => {
        this.processing.set(false);
        this.actionError.set('Payment was received, but we could not confirm it yet. Refresh this page in a moment.');
      },
    });
  }

  private loadRazorpay(): Promise<void> {
    if (window.Razorpay) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay-checkout]');
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Checkout could not be loaded.')), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.dataset['razorpayCheckout'] = 'true';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Checkout could not be loaded.'));
      document.head.appendChild(script);
    });
  }

  private labelFor(key: string): string {
    return key.toLowerCase().split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  }
}

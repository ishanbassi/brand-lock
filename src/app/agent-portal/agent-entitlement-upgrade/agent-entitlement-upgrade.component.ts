import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import {
  BillingInterval,
  BillingState,
  CheckoutResult,
  FEATURE_LABELS,
  FEATURE_ORDER,
  SubscribeResponse,
  SubscriptionPlan,
  describeFeature,
} from '../../../models/billing.model';
import { BillingService } from '../../shared/services/billing.service';
import { ScriptLoaderService } from '../../shared/services/script-loader.service';
import { WindowRefService } from '../../shared/services/window-ref.service';
import { IconComponent } from '../ui/icon.component';

type UpgradeReason = 'trial-expired' | 'portfolio-threshold';

/** Focused plan picker for firms that no longer qualify for full free access. */
@Component({
  selector: 'ap-entitlement-upgrade',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './agent-entitlement-upgrade.component.html',
  styleUrl: './agent-entitlement-upgrade.component.scss',
})
export class AgentEntitlementUpgradeComponent implements OnInit {
  private readonly billing = inject(BillingService);
  private readonly scripts = inject(ScriptLoaderService);
  private readonly winRef = inject(WindowRefService);

  @ViewChild('dialog') private dialog?: ElementRef<HTMLElement>;
  @ViewChild('primaryAction') private primaryAction?: ElementRef<HTMLButtonElement>;

  readonly state = this.billing.state;
  readonly upgradePrompt = this.billing.upgradePrompt;
  readonly plans = signal<SubscriptionPlan[]>([]);
  readonly interval = signal<BillingInterval>('ANNUAL');
  readonly busy = signal(false);
  readonly error = signal('');
  readonly dismissed = signal(false);

  readonly monthly = computed(() => this.plans().find(plan => plan.billingInterval === 'MONTHLY') ?? null);
  readonly annual = computed(() => this.plans().find(plan => plan.billingInterval === 'ANNUAL') ?? null);
  readonly selectedPlan = computed(() => (this.interval() === 'ANNUAL' ? this.annual() : this.monthly()) ?? this.annual() ?? this.monthly());
  readonly annualSavingPct = computed(() => {
    const monthly = this.monthly();
    const annual = this.annual();
    if (!monthly || !annual || monthly.amountPaise <= 0) return 0;
    return Math.round((1 - annual.amountPaise / (monthly.amountPaise * 12)) * 100);
  });
  readonly features = computed(() => {
    const entitlements = this.selectedPlan()?.entitlements;
    if (!entitlements) return [];
    return FEATURE_ORDER.map(feature => describeFeature(feature, entitlements[feature])).filter((line): line is string => !!line);
  });
  readonly reason = computed<UpgradeReason | null>(() => {
    const state = this.state();
    if (!state || state.effectivePlanCode !== 'FREE') return null;
    // A first Pro trial invitation owns this moment. Without this guard the normal paid upgrade
    // prompt would be mounted underneath it for the same large portfolio.
    if (state.proTrialEligible) return null;
    if (
      !state.entitled &&
      (state.status === 'TRIALING' || state.status === 'SCHEDULED') &&
      state.trialEndsAt &&
      new Date(state.trialEndsAt).getTime() <= Date.now()
    ) {
      return 'trial-expired';
    }
    if (state.portfolioMarkCount > state.freeUnlimitedPortfolioThreshold) return 'portfolio-threshold';
    // A normal free plan can still view and manage its included portfolio. Upgrade only when a
    // paid-only action is blocked (upgradePrompt) or the portfolio is outside the free allowance.
    return null;
  });
  /** A just-blocked action always wins over a prior session-level dismissal. */
  readonly visible = computed(() => !!this.upgradePrompt() || (!!this.reason() && !this.dismissed()));
  readonly heading = computed(() => {
    const feature = this.upgradePrompt()?.feature;
    if (feature === 'JOURNAL_HISTORY') return 'Unlock every Trade Marks Journal issue with Pro';
    if (feature) return `Unlock ${FEATURE_LABELS[feature]} with Pro`;
    switch (this.reason()) {
      case 'trial-expired': return 'Your 14-day Pro trial has ended';
      case 'portfolio-threshold': return 'Your portfolio has grown beyond 100 marks';
      default: return 'Your Pro access is no longer active';
    }
  });
  readonly description = computed(() => {
    const prompt = this.upgradePrompt();
    if (prompt) return prompt.detail;
    const state = this.state();
    if (this.reason() === 'trial-expired') {
      return 'Subscribe to keep journal screening, infringement alerts, deadlines, and the full practice workspace running without interruption.';
    }
    if (this.reason() === 'portfolio-threshold') {
      return `Your firm now manages ${state?.portfolioMarkCount.toLocaleString('en-IN')} marks. Choose Pro to keep the complete monitoring and docketing workflow switched on.`;
    }
    return 'Choose Pro to restore the full monitoring, docketing, reporting, and branding workspace for your firm.';
  });
  readonly freeSummary = computed(() => {
    const state = this.state();
    return state ? `${state.portfolioMarkCount.toLocaleString('en-IN')} marks in your portfolio` : 'Your current access';
  });

  ngOnInit(): void {
    if (typeof document !== 'undefined') {
      void this.scripts.load('https://checkout.razorpay.com/v1/checkout.js').catch(() => undefined);
    }
    this.billing.loadState().subscribe({ next: state => this.openIfNeeded(state), error: () => undefined });
    this.billing.getPlans().subscribe({
      next: plans => this.plans.set(plans),
      error: () => this.error.set('We could not load the available plans. Please reload and try again.'),
    });
  }

  chooseInterval(interval: BillingInterval): void {
    this.interval.set(interval);
    this.error.set('');
  }

  continueWithFree(): void {
    this.billing.dismissUpgrade();
    const key = this.dismissalKey();
    if (key && typeof sessionStorage !== 'undefined') sessionStorage.setItem(key, 'dismissed');
    this.dismissed.set(true);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.continueWithFree();
  }

  startCheckout(): void {
    const plan = this.selectedPlan();
    if (!plan || this.busy()) return;
    if (!this.winRef.nativeWindow?.Razorpay) {
      this.error.set('The secure payment window could not load. Check that checkout.razorpay.com is not blocked, then reload the page.');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    this.billing.startSubscription(plan.code).subscribe({
      next: checkout => this.openCheckout(checkout),
      error: error => {
        this.busy.set(false);
        this.error.set(this.messageOf(error, 'We could not start checkout. Please try again.'));
      },
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.visible()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.continueWithFree();
      return;
    }
    if (event.key !== 'Tab' || !this.dialog) return;
    const focusable = Array.from(this.dialog.nativeElement.querySelectorAll<HTMLElement>('button:not([disabled])'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  rupees(paise: number): string {
    return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: paise % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
  }

  private openIfNeeded(state: BillingState): void {
    const key = this.dismissalKeyFor(state);
    if (key && typeof sessionStorage !== 'undefined' && sessionStorage.getItem(key) === 'dismissed') {
      this.dismissed.set(true);
      return;
    }
    if (this.visible() && typeof window !== 'undefined') {
      window.setTimeout(() => this.primaryAction?.nativeElement.focus());
    }
  }

  private openCheckout(checkout: SubscribeResponse): void {
    const Razorpay = this.winRef.nativeWindow.Razorpay;
    const rzp = new Razorpay({
      key: checkout.razorpayKeyId,
      subscription_id: checkout.razorpaySubscriptionId,
      name: 'Trademarx',
      description: checkout.planName,
      image: '/assets/images/trademarx.svg',
      prefill: { name: checkout.prefill?.name ?? '', email: checkout.prefill?.email ?? '', contact: checkout.prefill?.contact ?? '' },
      theme: { color: '#3525cd' },
      handler: (result: CheckoutResult) => this.confirmCheckout(result),
      modal: { ondismiss: () => this.busy.set(false) },
    });
    rzp.on('payment.failed', (response: any) => {
      this.busy.set(false);
      this.error.set(response?.error?.description || 'That payment did not go through. You have not been charged.');
    });
    rzp.open();
  }

  private confirmCheckout(result: CheckoutResult): void {
    this.billing.verify(result).subscribe({
      next: () => {
        this.busy.set(false);
        this.billing.dismissUpgrade();
        this.dismissed.set(true);
      },
      error: () => {
        this.busy.set(false);
        this.error.set('Razorpay is confirming your payment. Your access will update shortly; you do not need to pay again.');
        this.billing.refreshState();
      },
    });
  }

  private dismissalKey(): string | null {
    const state = this.state();
    return state ? this.dismissalKeyFor(state) : null;
  }

  private dismissalKeyFor(state: BillingState): string | null {
    if (state.effectivePlanCode !== 'FREE') return null;
    if (state.trialEndsAt && !state.entitled && (state.status === 'TRIALING' || state.status === 'SCHEDULED')) {
      return `agent-upgrade-prompt:trial:${state.trialEndsAt}`;
    }
    return 'agent-upgrade-prompt:portfolio-or-free';
  }

  private messageOf(error: any, fallback: string): string {
    const detail = error?.error?.detail;
    return typeof detail === 'string' && detail.trim() ? detail : fallback;
  }
}

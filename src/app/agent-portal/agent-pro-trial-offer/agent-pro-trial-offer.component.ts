import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, OnInit, PLATFORM_ID, ViewChild, computed, inject, signal } from '@angular/core';
import {
  BillingInterval,
  BillingState,
  CheckoutResult,
  FEATURE_ORDER,
  SubscribeResponse,
  SubscriptionPlan,
  describeFeature,
} from '../../../models/billing.model';
import { AuthService } from '../../../models/auth.services';
import { BillingService } from '../../shared/services/billing.service';
import { ScriptLoaderService } from '../../shared/services/script-loader.service';
import { WindowRefService } from '../../shared/services/window-ref.service';
import { IconComponent } from '../ui/icon.component';

/**
 * The one-time invitation for established Free practices to start their Pro trial.
 *
 * Eligibility is deliberately server-owned. A portfolio count alone cannot establish that an
 * account has not used its trial before, and neither local/session storage nor a hidden UI can
 * enforce a subscription entitlement.
 */
@Component({
  selector: 'ap-agent-pro-trial-offer',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './agent-pro-trial-offer.component.html',
  styleUrl: './agent-pro-trial-offer.component.scss',
})
export class AgentProTrialOfferComponent implements OnInit {
  private readonly billing = inject(BillingService);
  private readonly auth = inject(AuthService);
  private readonly scripts = inject(ScriptLoaderService);
  private readonly winRef = inject(WindowRefService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  @ViewChild('dialog') private dialog?: ElementRef<HTMLElement>;
  @ViewChild('primaryAction') private primaryAction?: ElementRef<HTMLButtonElement>;

  readonly visible = signal(false);
  readonly plans = signal<SubscriptionPlan[]>([]);
  readonly interval = signal<BillingInterval>('ANNUAL');
  readonly busy = signal(false);
  readonly error = signal('');

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

  ngOnInit(): void {
    if (!this.isBrowser) return;
    this.billing.loadState().subscribe({
      next: state => {
        if (!this.isEligible(state) || this.wasDismissed()) return;
        this.visible.set(true);
        this.loadPlans();
        void this.scripts.load('https://checkout.razorpay.com/v1/checkout.js').catch(() => undefined);
        window.setTimeout(() => this.primaryAction?.nativeElement.focus());
      },
      // A promotional invitation should never stop an agent using the portal.
      error: () => undefined,
    });
  }

  chooseInterval(interval: BillingInterval): void {
    this.interval.set(interval);
    this.error.set('');
  }

  dismiss(): void {
    try {
      sessionStorage.setItem(this.dismissalKey(), 'dismissed');
    } catch {
      // Storage can be unavailable in private contexts; closing must still work.
    }
    this.visible.set(false);
  }

  startTrial(): void {
    const plan = this.selectedPlan();
    if (!plan || this.busy()) return;
    if (!this.winRef.nativeWindow?.Razorpay) {
      this.error.set('The secure payment window could not load. Check that checkout.razorpay.com is not blocked, then try again.');
      return;
    }

    this.busy.set(true);
    this.error.set('');
    this.billing.startSubscription(plan.code).subscribe({
      next: checkout => this.openCheckout(checkout),
      error: response => {
        this.busy.set(false);
        this.error.set(this.messageOf(response, 'We could not start secure checkout. Please try again.'));
      },
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.visible()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.dismiss();
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
    const rupees = paise / 100;
    return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: rupees % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
  }

  billingNotice(plan: SubscriptionPlan): string {
    return plan.billingInterval === 'ANNUAL'
      ? `After 14 days, your plan renews at ${this.rupees(plan.amountPaise)} per year, billed annually. Cancel anytime before the trial ends.`
      : `After 14 days, your plan renews at ${this.rupees(plan.amountPaise)} per month. Cancel anytime before the trial ends.`;
  }

  regularPrice(plan: SubscriptionPlan): string {
    return plan.billingInterval === 'ANNUAL'
      ? `regularly ${this.rupees(plan.amountPaise)} / year (${this.rupees(plan.monthlyEquivalentPaise)} / mo)`
      : `regularly ${this.rupees(plan.amountPaise)} / month`;
  }

  private isEligible(state: BillingState): boolean {
    // The count repeats the product rule as a defensive presentation check. The server flag is
    // decisive because only it has the durable record of earlier trial use.
    return state.proTrialEligible === true && state.portfolioMarkCount > state.freeUnlimitedPortfolioThreshold;
  }

  private loadPlans(): void {
    this.billing.getPlans().subscribe({
      next: plans => this.plans.set(plans),
      error: () => this.error.set('We could not load the available plans. Please reload and try again.'),
    });
  }

  private openCheckout(checkout: SubscribeResponse): void {
    const Razorpay = this.winRef.nativeWindow?.Razorpay;
    if (!Razorpay) {
      this.busy.set(false);
      this.error.set('The secure payment window could not load. Please try again.');
      return;
    }
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
        this.dismiss();
      },
      error: () => {
        this.busy.set(false);
        this.error.set('Razorpay is confirming your autopay mandate. Your trial will update shortly; you do not need to try again.');
        this.billing.refreshState();
      },
    });
  }

  private dismissalKey(): string {
    const user = this.auth.getUser();
    return `agent-pro-trial-offer:${user?.id ?? user?.login ?? 'current-agent'}`;
  }

  private wasDismissed(): boolean {
    try {
      return sessionStorage.getItem(this.dismissalKey()) === 'dismissed';
    } catch {
      return false;
    }
  }

  private messageOf(response: any, fallback: string): string {
    const detail = response?.error?.detail;
    return typeof detail === 'string' && detail.trim() ? detail : fallback;
  }
}

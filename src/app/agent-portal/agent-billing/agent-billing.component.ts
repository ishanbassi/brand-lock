import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import dayjs from 'dayjs';
import { Subscription, timer } from 'rxjs';
import {
  BillingInterval,
  BillingState,
  CheckoutResult,
  FEATURE_LABELS,
  FEATURE_ORDER,
  FeatureKey,
  SubscribeResponse,
  SubscriptionPayment,
  SubscriptionPlan,
  SubscriptionStatus,
  describeFeature,
} from '../../../models/billing.model';
import { BillingService } from '../../shared/services/billing.service';
import { ScriptLoaderService } from '../../shared/services/script-loader.service';
import { WindowRefService } from '../../shared/services/window-ref.service';
import { IconComponent, IconName } from '../ui/icon.component';

/** Features with a count worth showing as a meter, in display order. */
const METERED: FeatureKey[] = ['PORTFOLIO_SIZE', 'COMPETITOR_WATCHES', 'SEARCH_REPORTS_PER_MONTH', 'DOCUMENT_STORAGE_MB'];

/** States in which Razorpay holds an authorised mandate - the agent already has a subscription. */
const LIVE_MANDATE: SubscriptionStatus[] = ['SCHEDULED', 'ACTIVE', 'PAST_DUE', 'PAUSED'];

interface Meter {
  key: FeatureKey;
  label: string;
  used: number;
  limit: number;
  pct: number;
  over: boolean;
  allowed: boolean;
  remaining: number;
}

interface IncludedFeature {
  key: FeatureKey;
  label: string;
  detail: string;
}

/**
 * Billing: the agent's plan, what they are using, the plans on offer, and every payment.
 *
 * <p>One screen rather than separate plan, overview and upgrade pages. An agent arriving from an
 * upgrade prompt needs the same three things in the same place - what they have, what was blocked,
 * what a plan costs - and the prompt's `feature` query parameter is enough to open this page on the
 * right note.
 *
 * <h3>Checkout</h3>
 *
 * <p>Razorpay Checkout opened with a `subscription_id`, never an order id, and with no amount -
 * Razorpay takes the price from the plan. The mandate the agent authorises here (UPI Autopay, card
 * or netbanking) is what lets later months charge without them.
 *
 * <p>The handler's result is posted back to be verified, and the server re-reads the subscription
 * from Razorpay rather than believing this page. Razorpay can call the handler a moment before it
 * marks the mandate authorised, and the webhook applies the same state independently, so when the
 * verify answer is not yet ACTIVE the page polls briefly instead of declaring failure. A charged
 * agent must never be told to pay again.
 */
@Component({
  selector: 'app-agent-billing',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './agent-billing.component.html',
  styleUrl: './agent-billing.component.scss',
})
export class AgentBillingComponent implements OnInit, OnDestroy {
  private readonly billing = inject(BillingService);
  private readonly route = inject(ActivatedRoute);
  private readonly scripts = inject(ScriptLoaderService);
  private readonly winRef = inject(WindowRefService);

  readonly state = this.billing.state;
  readonly plans = signal<SubscriptionPlan[]>([]);
  readonly payments = signal<SubscriptionPayment[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly notice = signal('');

  /** Annual first: it is the better deal, and the page is honest about why. */
  readonly interval = signal<BillingInterval>('ANNUAL');

  /** Set from starting checkout until it resolves, so the button cannot open two. */
  readonly busy = signal(false);
  readonly confirmingCancel = signal(false);
  readonly confirmingChange = signal<SubscriptionPlan | null>(null);

  /** What sent the agent here, if an upgrade prompt did. */
  readonly blockedFeature = signal<FeatureKey | null>(null);

  private activationPoll?: Subscription;

  readonly monthly = computed(() => this.plans().find(p => p.billingInterval === 'MONTHLY') ?? null);
  readonly annual = computed(() => this.plans().find(p => p.billingInterval === 'ANNUAL') ?? null);
  readonly selected = computed(() => (this.interval() === 'ANNUAL' ? this.annual() : this.monthly()) ?? this.monthly() ?? this.annual());

  /** The annual discount, worked out from the two real prices rather than written into the page. */
  readonly annualSavingPct = computed(() => {
    const m = this.monthly();
    const a = this.annual();
    if (!m || !a || m.amountPaise <= 0) return 0;
    return Math.round((1 - a.amountPaise / (m.amountPaise * 12)) * 100);
  });

  readonly selectedFeatures = computed(() => {
    const entitlements = this.selected()?.entitlements;
    if (!entitlements) return [];
    return FEATURE_ORDER.map(key => describeFeature(key, entitlements[key])).filter((line): line is string => !!line);
  });

  readonly hasLiveMandate = computed(() => {
    const status = this.state()?.status;
    return !!status && LIVE_MANDATE.includes(status);
  });

  readonly hasFreeUnlimitedAccess = computed(() => this.state()?.freeUnlimitedAccess === true);

  readonly meters = computed<Meter[]>(() => {
    const entitlements = this.state()?.entitlements;
    if (!entitlements) return [];
    return METERED.flatMap(key => {
      const e = entitlements[key];
      // A zero limit with nothing used is "not included", which the plan card already says. A zero
      // limit with something used is the case worth a meter: it is data kept from a trial.
      if (!e || e.limit === null || e.used === null || (e.limit === 0 && e.used === 0)) return [];
      const pct = e.limit === 0 ? 100 : Math.min(100, Math.round((e.used / e.limit) * 100));
      return [{ key, label: FEATURE_LABELS[key], used: e.used, limit: e.limit, pct, over: e.used > e.limit, allowed: e.allowed, remaining: Math.max(0, e.limit - e.used) }];
    });
  });

  /** The reference's feature matrix is also live state, not illustrative copy. */
  readonly includedFeatures = computed<IncludedFeature[]>(() => {
    const entitlements = this.state()?.entitlements;
    if (!entitlements) return [];
    return FEATURE_ORDER.flatMap(key => {
      const entitlement = entitlements[key];
      if (!entitlement?.allowed) return [];
      return [{ key, label: FEATURE_LABELS[key], detail: describeFeature(key, entitlement) ?? 'Included' }];
    });
  });

  ngOnInit(): void {
    this.blockedFeature.set((this.route.snapshot.queryParamMap.get('feature') as FeatureKey | null) ?? null);
    if (this.route.snapshot.queryParamMap.get('interval') === 'monthly') {
      this.interval.set('MONTHLY');
    }

    // Loaded on arrival rather than on the button, so the modal opens without a visible wait.
    // Browser only: the loader appends to `document`, which does not exist during server rendering.
    if (typeof document !== 'undefined') {
      void this.scripts.load('https://checkout.razorpay.com/v1/checkout.js').catch(() => undefined);
    }

    this.billing.loadState().subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.error.set('Could not load your plan. Reload the page to try again.');
        this.loading.set(false);
      },
    });
    this.billing.getPlans().subscribe({
      next: plans => this.plans.set(plans),
      error: () => this.error.set('Could not load the plans. Reload the page to try again.'),
    });
    this.loadPayments();
  }

  ngOnDestroy(): void {
    this.activationPoll?.unsubscribe();
  }

  // -- Checkout -------------------------------------------------------------

  choose(plan: SubscriptionPlan | null): void {
    if (!plan || this.busy()) return;
    if (this.hasLiveMandate()) {
      this.confirmingChange.set(plan);
      return;
    }
    if (!this.winRef.nativeWindow?.Razorpay) {
      // Usually an ad blocker or a strict network. Said plainly, because "something went wrong"
      // would send them to support for a problem they can fix themselves.
      this.error.set('The payment window could not load. Check that nothing is blocking checkout.razorpay.com, then reload the page.');
      return;
    }
    this.error.set('');
    this.notice.set('');
    this.busy.set(true);
    this.billing.startSubscription(plan.code).subscribe({
      next: res => this.openCheckout(res),
      error: err => {
        this.busy.set(false);
        this.error.set(this.messageOf(err, 'Could not start checkout. Please try again.'));
      },
    });
  }

  /** A live mandate is replaced at period end, never immediately and never with a second charge today. */
  startPlanChange(plan: SubscriptionPlan): void {
    if (this.busy()) return;
    this.confirmingChange.set(null);
    if (!this.winRef.nativeWindow?.Razorpay) {
      this.error.set('The payment window could not load. Check that nothing is blocking checkout.razorpay.com, then reload the page.');
      return;
    }
    this.error.set('');
    this.notice.set('');
    this.busy.set(true);
    this.billing.changeSubscription(plan.code).subscribe({
      next: result => {
        this.notice.set(`Authorise the new mandate now. ${result.checkout.planName} starts on ${this.date(result.effectiveAt)}; you will not be charged today.`);
        this.openCheckout(result.checkout);
      },
      error: err => {
        this.busy.set(false);
        this.error.set(this.messageOf(err, 'Could not start the plan change. Please try again.'));
      },
    });
  }

  private openCheckout(res: SubscribeResponse): void {
    const Razorpay = this.winRef.nativeWindow.Razorpay;
    const rzp = new Razorpay({
      key: res.razorpayKeyId,
      // Not order_id, and no amount: a subscription is priced by its plan at Razorpay.
      subscription_id: res.razorpaySubscriptionId,
      name: 'Trademarx',
      description: res.planName,
      image: '/assets/images/trademarx.svg',
      prefill: {
        name: res.prefill?.name ?? '',
        email: res.prefill?.email ?? '',
        contact: res.prefill?.contact ?? '',
      },
      theme: { color: '#001F4D' },
      handler: (result: CheckoutResult) => this.confirm(result),
      modal: {
        ondismiss: () => {
          this.busy.set(false);
          this.notice.set("Checkout closed. You haven't been charged.");
        },
      },
    });
    // A declined attempt keeps the modal open for another try; this only explains what happened.
    rzp.on('payment.failed', (resp: any) => {
      this.error.set(resp?.error?.description || "That payment didn't go through. You haven't been charged.");
    });
    rzp.open();
  }

  private confirm(result: CheckoutResult): void {
    this.error.set('');
    this.notice.set('Payment received. Confirming with Razorpay…');
    this.billing.verify(result).subscribe({
      next: state => {
        if (state.status === 'SCHEDULED') {
          this.mandateScheduled(state);
        } else if (this.isLive(state)) {
          this.activated();
        } else {
          this.awaitActivation();
        }
      },
      // A failed verify does not mean a failed payment: the webhook will still apply a genuine one.
      error: () => this.awaitActivation(),
    });
  }

  /** Polls for up to about forty seconds, then stops and says plainly what to expect. */
  private awaitActivation(): void {
    this.notice.set('Payment received. Your plan will switch on in a moment…');
    this.activationPoll?.unsubscribe();
    this.activationPoll = timer(3000, 4000).subscribe(tick => {
      this.billing.loadState().subscribe({
        next: state => {
          if (state.status === 'SCHEDULED') {
            this.mandateScheduled(state);
          } else if (this.isLive(state)) {
            this.activated();
          } else if (tick >= 9) {
            this.activationPoll?.unsubscribe();
            this.busy.set(false);
            this.notice.set(
              "We're still waiting for Razorpay to confirm. If you were charged, your plan switches on within a few minutes - there's no need to pay again.",
            );
          }
        },
        error: () => undefined,
      });
    });
  }

  private activated(): void {
    this.activationPoll?.unsubscribe();
    this.busy.set(false);
    this.blockedFeature.set(null);
    const change = this.state()?.pendingChange;
    this.notice.set(change ? `${change.planName} is scheduled for ${this.date(change.effectiveAt)}.` : 'Your subscription is active. Thank you!');
    this.loadPayments();
  }

  private mandateScheduled(state: BillingState): void {
    this.activationPoll?.unsubscribe();
    this.busy.set(false);
    this.blockedFeature.set(null);
    this.notice.set(
      state.nextChargeAt
        ? `Autopay is authorised. Your first charge is on ${this.date(state.nextChargeAt)} after the free trial.`
        : 'Autopay is authorised. Your first charge is due when the free trial ends.',
    );
  }

  private isLive(state: BillingState): boolean {
    return !!state.status && LIVE_MANDATE.includes(state.status);
  }

  // -- Cancellation ---------------------------------------------------------

  cancel(): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.billing.cancel().subscribe({
      next: state => {
        this.busy.set(false);
        this.confirmingCancel.set(false);
        this.notice.set(`Cancelled. Your plan stays on until ${this.date(state.currentPeriodEnd ?? state.entitledUntil)}, and you won't be charged again.`);
      },
      error: err => {
        this.busy.set(false);
        this.error.set(this.messageOf(err, 'Could not cancel. Please try again.'));
      },
    });
  }

  // -- Display --------------------------------------------------------------

  private loadPayments(): void {
    this.billing.getPayments().subscribe({ next: rows => this.payments.set(rows), error: () => undefined });
  }

  /** The sentence under the plan name. */
  currentDetail(s: BillingState): string {
    if (s.freeUnlimitedAccess) {
      return `Every feature is included at no cost while your portfolio has ${s.freeUnlimitedPortfolioThreshold.toLocaleString('en-IN')} or fewer marks. You currently have ${s.portfolioMarkCount.toLocaleString('en-IN')}.`;
    }
    switch (s.status) {
      case 'TRIALING':
        if (s.entitled && s.trialEndsAt) {
          const days = Math.max(0, Math.ceil(dayjs(s.trialEndsAt).diff(dayjs(), 'hour') / 24));
          return `Everything is switched on until ${this.date(s.trialEndsAt)} - ${days} day${days === 1 ? '' : 's'} left. Choose a plan below to keep it that way.`;
        }
        break;
      case 'SCHEDULED':
        return s.nextChargeAt
          ? `Autopay is authorised. Your first charge is on ${this.date(s.nextChargeAt)} after your free trial.`
          : 'Autopay is authorised. Your first charge is due when your free trial ends.';
      case 'ACTIVE':
        if (s.cancelAtPeriodEnd) {
          const change = s.pendingChange;
          if (change) {
            return `${change.planName} is scheduled to start on ${this.date(change.effectiveAt)}. Your current plan remains active until then.`;
          }
          return `Cancelled. Your plan stays on until ${this.date(s.currentPeriodEnd ?? s.entitledUntil)}, and you won't be charged again.`;
        }
        return s.nextChargeAt ? `Autopay is on. The next charge is on ${this.date(s.nextChargeAt)}.` : 'Autopay is on.';
      case 'PAST_DUE':
        return (
          "Your last payment didn't go through" +
          (s.lastFailureReason ? ` (${s.lastFailureReason})` : '') +
          `. Razorpay will retry automatically, and everything keeps working until ${this.date(s.entitledUntil)}.`
        );
      case 'PAUSED':
        return 'Your subscription is paused.';
      case 'HALTED':
        return 'Your subscription stopped after repeated failed payments. Start a new one below to switch the paid features back on.';
      case 'CANCELLED':
        return s.entitled ? `Cancelled. Your plan stays on until ${this.date(s.entitledUntil)}.` : "Cancelled. You're on the free plan now.";
      default:
        break;
    }
    return "You're on the free plan. Everything you added is still here, and the paid features switch back on as soon as you subscribe.";
  }

  planTitle(s: BillingState): string {
    if (s.freeUnlimitedAccess) return 'Full access, free';
    return (s.status === 'TRIALING' || s.status === 'SCHEDULED') && s.entitled ? 'Free trial' : s.effectivePlanName;
  }

  statusLabel(status: SubscriptionStatus | null): string {
    const labels: Record<SubscriptionStatus, string> = {
      TRIALING: 'Trial',
      PENDING_AUTH: 'Awaiting payment',
      SCHEDULED: 'Autopay scheduled',
      ACTIVE: 'Active',
      PAST_DUE: 'Payment retrying',
      PAUSED: 'Paused',
      HALTED: 'Stopped',
      CANCELLED: 'Cancelled',
      EXPIRED: 'Ended',
    };
    return status ? labels[status] : this.hasFreeUnlimitedAccess() ? 'Full access free' : 'Free plan';
  }

  statusTone(status: SubscriptionStatus | null): string {
    if (status === 'ACTIVE' || status === 'TRIALING' || status === 'SCHEDULED') return 'ok';
    if (status === 'PAST_DUE' || status === 'PAUSED' || status === 'PENDING_AUTH') return 'warn';
    if (status === 'HALTED') return 'danger';
    return 'neutral';
  }

  /** Keep the reference layout data-led: the backend remains the source of every plan, price and entitlement. */
  isCurrentPlan(plan: SubscriptionPlan, state: BillingState): boolean {
    return plan.code === state.effectivePlanCode || plan.code === state.subscribedPlanCode;
  }

  isFreePlan(plan: SubscriptionPlan): boolean {
    return plan.amountPaise === 0 || plan.billingInterval === 'NONE';
  }

  planIntervalLabel(plan: SubscriptionPlan): string {
    if (this.isFreePlan(plan)) return 'Starter';
    return plan.billingInterval === 'ANNUAL' ? 'Annual billing' : 'Monthly billing';
  }

  planFeatures(plan: SubscriptionPlan): string[] {
    return FEATURE_ORDER.map(key => describeFeature(key, plan.entitlements?.[key])).filter((line): line is string => !!line).slice(0, 5);
  }

  planDescription(plan: SubscriptionPlan): string {
    if (this.isFreePlan(plan)) return 'For individual practitioners getting started with essential portfolio tools.';
    if (plan.billingInterval === 'ANNUAL') return 'Annual commitment with the best monthly value for established practices.';
    return 'Flexible monthly billing for firms building a more automated trademark practice.';
  }

  entitlementIcon(key: FeatureKey): IconName {
    const icons: Partial<Record<FeatureKey, IconName>> = {
      PORTFOLIO_SIZE: 'portfolio',
      PORTFOLIO_IMPORT: 'upload',
      JOURNAL_HISTORY: 'journal',
      CONFLICT_WATCH: 'watch',
      NEW_FILING_WATCH: 'bell',
      COMPETITOR_WATCHES: 'eye',
      DEADLINES: 'calendar',
      SEARCH_REPORTS_PER_MONTH: 'search',
      DOCUMENT_STORAGE_MB: 'documents',
      EXPORTS: 'download',
      BRANDING: 'edit',
    };
    return icons[key] ?? 'check';
  }

  meterValue(meter: Meter): string {
    return meter.key === 'DOCUMENT_STORAGE_MB' ? `${meter.used.toLocaleString('en-IN')} MB` : meter.used.toLocaleString('en-IN');
  }

  meterLimit(meter: Meter): string {
    return meter.key === 'DOCUMENT_STORAGE_MB' ? `${meter.limit.toLocaleString('en-IN')} MB` : meter.limit.toLocaleString('en-IN');
  }

  meterNote(meter: Meter): string {
    if (meter.over) return 'Over your plan limit. Existing items remain available to review or remove.';
    return `${meter.remaining.toLocaleString('en-IN')} ${meter.key === 'DOCUMENT_STORAGE_MB' ? 'MB ' : ''}remaining before your plan limit.`;
  }

  lifecycleTitle(state: BillingState): string {
    if (state.freeUnlimitedAccess) return 'Full access at no cost';
    if (state.pendingChange) return 'Plan change scheduled';
    if (state.status === 'PAST_DUE') return 'Payment needs attention';
    if (state.status === 'HALTED') return 'Subscription halted';
    if (state.status === 'CANCELLED') return state.entitled ? 'Cancellation scheduled' : 'Subscription cancelled';
    if (state.status === 'TRIALING') return 'Trial access is active';
    if (state.status === 'SCHEDULED') return 'Autopay is authorised';
    if (state.status === 'ACTIVE') return 'Subscription is active';
    return 'Subscription status';
  }

  lifecycleIcon(status: SubscriptionStatus | null): 'check' | 'clock' | 'alert' | 'lock' {
    if (status === 'PAST_DUE' || status === 'PAUSED' || status === 'PENDING_AUTH') return 'alert';
    if (status === 'HALTED' || status === 'EXPIRED') return 'lock';
    if (status === 'CANCELLED') return 'clock';
    return 'check';
  }

  paymentLabel(state: string | null): string {
    if (!state) return 'Recorded';
    return state.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
  }

  paymentTone(state: string | null): string {
    const value = state?.toUpperCase() ?? '';
    if (value.includes('FAIL') || value.includes('REFUND')) return 'payment-status--danger';
    if (value.includes('PENDING') || value.includes('AUTH')) return 'payment-status--warn';
    return 'payment-status--ok';
  }

  blockedMessage(key: FeatureKey): string {
    switch (key) {
      case 'PORTFOLIO_SIZE':
        return "Your portfolio is at the free plan's limit.";
      case 'SEARCH_REPORTS_PER_MONTH':
        return "You've used this month's free search reports.";
      case 'COMPETITOR_WATCHES':
        return 'Watching competitor firms needs a paid plan.';
      case 'DOCUMENT_STORAGE_MB':
        return 'Document storage needs a paid plan.';
      default:
        return `${FEATURE_LABELS[key] ?? 'That'} needs a paid plan.`;
    }
  }

  rupees(paise: number | null | undefined): string {
    if (paise === null || paise === undefined) return '—';
    const rupees = paise / 100;
    return '₹' + rupees.toLocaleString('en-IN', { minimumFractionDigits: rupees % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });
  }

  date(iso: string | null | undefined): string {
    return iso ? dayjs(iso).format('D MMM YYYY') : '—';
  }

  methodLabel(method: string | null): string {
    if (!method) return '—';
    const known: Record<string, string> = { upi: 'UPI', card: 'Card', netbanking: 'Netbanking', emandate: 'e-Mandate', nach: 'NACH' };
    return known[method.toLowerCase()] ?? method;
  }

  private messageOf(err: any, fallback: string): string {
    const detail = err?.error?.detail;
    return typeof detail === 'string' && detail.trim() ? detail : fallback;
  }
}

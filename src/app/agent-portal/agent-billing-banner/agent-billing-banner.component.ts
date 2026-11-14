import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import dayjs from 'dayjs';
import { BillingService } from '../../shared/services/billing.service';
import { IconComponent } from '../ui/icon.component';

interface Banner {
  tone: 'info' | 'warn' | 'danger';
  message: string;
  action: string;
}

/**
 * The one line across the top of the portal that says where the agent stands.
 *
 * Two jobs, one slot, in priority order:
 *
 * 1. The last upgrade prompt - a 402 from whatever the agent just tried. It carries the server's own
 *    sentence ("The free plan holds up to 10 trademarks. You have 10."), which is more useful than
 *    anything this component could compose, and it can be dismissed.
 * 2. Otherwise, the subscription's standing: a trial counting down, a payment Razorpay is retrying,
 *    a halted subscription, a lapsed plan, or a cancellation taking effect.
 *
 * A healthy paid subscription shows nothing. A banner that is always there stops being read.
 */
@Component({
  selector: 'ap-billing-banner',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './agent-billing-banner.component.html',
  styleUrl: './agent-billing-banner.component.scss',
})
export class AgentBillingBannerComponent {
  private readonly billing = inject(BillingService);

  readonly blocked = this.billing.lastEntitlementError;

  readonly banner = computed<Banner | null>(() => {
    const s = this.billing.state();
    if (!s) {
      return null;
    }

    if ((s.status === 'TRIALING' || s.status === 'SCHEDULED') && s.entitled && s.trialEndsAt) {
      const days = Math.max(0, Math.ceil(dayjs(s.trialEndsAt).diff(dayjs(), 'hour') / 24));
      const trialCountdown = days === 0 ? 'Your free trial ends today.' : `Free trial: ${days} day${days === 1 ? '' : 's'} left.`;
      return {
        tone: days <= 3 ? 'warn' : 'info',
        message: s.status === 'SCHEDULED' ? `${trialCountdown} Autopay is set.` : trialCountdown,
        action: s.status === 'SCHEDULED' ? 'View billing' : 'Choose a plan',
      };
    }
    if (s.status === 'PAST_DUE') {
      return {
        tone: 'warn',
        message: "Your last payment didn't go through. Razorpay will retry, and everything keeps working meanwhile.",
        action: 'View billing',
      };
    }
    if (s.status === 'HALTED') {
      return {
        tone: 'danger',
        message: 'Your subscription stopped after repeated failed payments. Paid features are off - nothing has been deleted.',
        action: 'Restart subscription',
      };
    }
    if (s.cancelAtPeriodEnd && s.entitled && s.entitledUntil) {
      return {
        tone: 'info',
        message: `Your plan ends on ${dayjs(s.entitledUntil).format('D MMM YYYY')}.`,
        action: 'View billing',
      };
    }
    if (!s.entitled && s.effectivePlanCode === 'FREE') {
      return {
        tone: 'warn',
        message: "You're on the free plan. Everything you added is still here.",
        action: 'See plans',
      };
    }
    return null;
  });

  dismissBlocked(): void {
    this.billing.lastEntitlementError.set(null);
  }
}

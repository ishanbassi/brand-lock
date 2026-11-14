/**
 * Agent-portal billing, as the API describes it.
 *
 * Mirrors the records in tmadmin's `service/dto/billing` package and the `Feature` /
 * `AgentSubscriptionStatus` enums. Change both sides together.
 */

/** Everything a plan can gate. Same names as the backend `Feature` enum. */
export type FeatureKey =
  | 'PORTFOLIO_SIZE'
  | 'PORTFOLIO_IMPORT'
  | 'JOURNAL_HISTORY'
  | 'CONFLICT_WATCH'
  | 'NEW_FILING_WATCH'
  | 'COMPETITOR_WATCHES'
  | 'DEADLINES'
  | 'SEARCH_REPORTS_PER_MONTH'
  | 'DOCUMENT_STORAGE_MB'
  | 'EXPORTS'
  | 'BRANDING'
  | 'AI_DRAFTS_PER_MONTH';

export type SubscriptionStatus =
  | 'TRIALING'
  | 'PENDING_AUTH'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'PAUSED'
  | 'HALTED'
  | 'CANCELLED'
  | 'EXPIRED';

export type BillingInterval = 'MONTHLY' | 'ANNUAL' | 'NONE';

/**
 * One feature's standing. `limit` null means unlimited; `used` is null where nothing is counted.
 */
export interface FeatureEntitlement {
  allowed: boolean;
  limit: number | null;
  used: number | null;
}

/**
 * The agent's billing state.
 *
 * `effectivePlanCode` is what the limits actually are; `subscribedPlanCode` is the subscription
 * they hold. They differ exactly when it matters - a halted Pro subscription is still a Pro
 * subscription, but the agent is on Free's limits until it is fixed.
 */
export interface BillingState {
  effectivePlanCode: string;
  effectivePlanName: string;
  subscribedPlanCode: string | null;
  status: SubscriptionStatus | null;
  entitled: boolean;
  entitledUntil: string | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  nextChargeAt: string | null;
  cancelAtPeriodEnd: boolean;
  lastFailureReason: string | null;
  entitlements: Partial<Record<FeatureKey, FeatureEntitlement>>;
}

export interface SubscriptionPlan {
  code: string;
  name: string;
  billingInterval: BillingInterval;
  amountPaise: number;
  currency: string;
  /** The price per month: the amount itself for monthly, a twelfth of it for annual. */
  monthlyEquivalentPaise: number;
  sortOrder: number;
  /** What the plan includes. Drawn from the plan row, so the pricing card can never drift from it. */
  entitlements?: Partial<Record<FeatureKey, FeatureEntitlement>>;
}

/**
 * What Checkout needs. Note there is no order id and no amount to pass on: subscription
 * checkout opens with `subscription_id`, and Razorpay takes the price from the plan.
 */
export interface SubscribeResponse {
  razorpaySubscriptionId: string;
  razorpayKeyId: string;
  planCode: string;
  planName: string;
  amountPaise: number;
  currency: string;
  prefill: { name: string | null; email: string | null; contact: string | null } | null;
}

/** Exactly what Razorpay Checkout's handler receives, posted back as-is for verification. */
export interface CheckoutResult {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

export interface SubscriptionPayment {
  id: number;
  amountPaise: number | null;
  currency: string | null;
  state: string | null;
  paidAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  razorpayPaymentId: string | null;
  paymentMethod: string | null;
}

/** The body of a 402 from any gated endpoint. */
export interface EntitlementError {
  feature: FeatureKey | null;
  planCode: string | null;
  limit: number | null;
  used: number | null;
  detail: string;
}

/** The order features are listed in on the pricing card. The reserved AI allowance is left off until it ships. */
export const FEATURE_ORDER: FeatureKey[] = [
  'PORTFOLIO_SIZE',
  'CONFLICT_WATCH',
  'JOURNAL_HISTORY',
  'NEW_FILING_WATCH',
  'DEADLINES',
  'COMPETITOR_WATCHES',
  'SEARCH_REPORTS_PER_MONTH',
  'PORTFOLIO_IMPORT',
  'EXPORTS',
  'BRANDING',
  'DOCUMENT_STORAGE_MB',
];

/** Short nouns, for usage meters and prompts. */
export const FEATURE_LABELS: Record<FeatureKey, string> = {
  PORTFOLIO_SIZE: 'Trademarks in your portfolio',
  PORTFOLIO_IMPORT: 'Portfolio import',
  JOURNAL_HISTORY: 'Journal history',
  CONFLICT_WATCH: 'Conflict watch',
  NEW_FILING_WATCH: 'New-filing watch',
  COMPETITOR_WATCHES: 'Competitor firms watched',
  DEADLINES: 'The deadlines calendar',
  SEARCH_REPORTS_PER_MONTH: 'Search reports this month',
  DOCUMENT_STORAGE_MB: 'Document storage (MB)',
  EXPORTS: 'Exports',
  BRANDING: 'Report branding',
  AI_DRAFTS_PER_MONTH: 'AI drafts this month',
};

/**
 * One line of the pricing card, written from the plan's actual limits.
 *
 * Null when the plan does not include the feature, so a plan lists only what it gives.
 */
export function describeFeature(key: FeatureKey, entitlement: FeatureEntitlement | undefined): string | null {
  if (!entitlement || !entitlement.allowed) {
    return null;
  }
  const limit = entitlement.limit;
  switch (key) {
    case 'PORTFOLIO_SIZE':
      return limit === null ? 'Unlimited trademarks in your portfolio' : `Up to ${limit} trademarks in your portfolio`;
    case 'PORTFOLIO_IMPORT':
      return 'Import your portfolio from Excel';
    case 'JOURNAL_HISTORY':
      if (limit === null) return 'Every past Trade Marks Journal issue';
      return limit === 1 ? 'The latest Trade Marks Journal issue' : `The last ${limit} Trade Marks Journal issues`;
    case 'CONFLICT_WATCH':
      return 'Conflict alerts on every new journal issue';
    case 'NEW_FILING_WATCH':
      return 'Early warning on new filings that resemble your marks';
    case 'COMPETITOR_WATCHES':
      return limit === null ? 'Watch any number of competitor firms' : `Watch up to ${limit} competitor firms`;
    case 'DEADLINES':
      return 'Deadlines calendar with renewals and hearings';
    case 'SEARCH_REPORTS_PER_MONTH':
      return limit === null ? 'Unlimited search reports' : `${limit} search reports a month`;
    case 'DOCUMENT_STORAGE_MB':
      return limit === null ? 'Document storage' : `${limit} MB of document storage`;
    case 'EXPORTS':
      return 'PDF and Excel exports';
    case 'BRANDING':
      return "Your firm's logo and colours on reports";
    default:
      return null;
  }
}

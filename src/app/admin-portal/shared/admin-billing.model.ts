/**
 * Shapes returned by /api/admin/billing/**. Mirrors the records in tmadmin's
 * service/dto/billing package — change both sides together.
 */

export type SubscriptionStatus =
  | 'TRIALING'
  | 'PENDING_AUTH'
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'PAUSED'
  | 'HALTED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface IAdminBillingOverview {
  countsByStatus: Partial<Record<SubscriptionStatus, number>>;
  mrrPaise: number;
  revenueThisMonthPaise: number;
  trialsEndingSoon: number;
  paidPlansProvisioned: boolean;
}

export interface IAdminPlan {
  id: number;
  code: string;
  name: string;
  billingInterval: string | null;
  amountPaise: number | null;
  currency: string | null;
  active: boolean;
  publicListed: boolean;
  razorpayPlanId: string | null;
  provisioned: boolean;
}

export interface IAdminSubscriptionRow {
  id: number;
  tmAgentId: number;
  firmName: string | null;
  contactName: string | null;
  email: string | null;
  planCode: string | null;
  planName: string | null;
  status: SubscriptionStatus | null;
  entitled: boolean;
  entitledUntil: string | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  nextChargeAt: string | null;
  cancelAtPeriodEnd: boolean;
  razorpaySubscriptionId: string | null;
  lastFailureReason: string | null;
  adminNote: string | null;
  createdDate: string | null;
}

export interface IAdminSubscriptionPayment {
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

export interface IAdminSubscriptionEvent {
  id: number;
  eventType: string;
  razorpayEventId: string;
  signatureVerified: boolean;
  receivedAt: string | null;
  processedAt: string | null;
  processError: string | null;
}

export interface IAdminSubscriptionDetail {
  subscription: IAdminSubscriptionRow;
  payments: IAdminSubscriptionPayment[];
  events: IAdminSubscriptionEvent[];
}

export const SUBSCRIPTION_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'TRIALING', label: 'Trial' },
  { value: 'PENDING_AUTH', label: 'Awaiting payment' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAST_DUE', label: 'Payment retrying' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'HALTED', label: 'Stopped' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'EXPIRED', label: 'Ended' },
];

export function subscriptionStatusLabel(status: string | null | undefined): string {
  const match = SUBSCRIPTION_STATUS_OPTIONS.find(o => o.value === status);
  return match?.label ?? (status ? status.replace(/_/g, ' ') : '—');
}

export function subscriptionStatusBadgeClass(status: string | null | undefined): string {
  switch (status) {
    case 'ACTIVE':
    case 'TRIALING':
      return 'badge--success';
    case 'PAST_DUE':
    case 'PAUSED':
    case 'PENDING_AUTH':
      return 'badge--warning';
    case 'HALTED':
      return 'badge--danger';
    default:
      return 'badge--muted';
  }
}

/** Paise → "₹1,500" / "₹12,000.50". Handles null. */
export function rupees(paise: number | null | undefined): string {
  if (paise === null || paise === undefined) return '—';
  const value = paise / 100;
  return (
    '₹' +
    value.toLocaleString('en-IN', {
      minimumFractionDigits: value % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
}

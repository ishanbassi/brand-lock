/** Shape of a payment as returned by /api/admin/payments (PaymentDTO). */
export interface IAdminPayment {
  id: number;
  gateway?: string | null;
  gatewayPaymentId?: string | null;
  amount?: number | null;
  currency?: string | null;
  status?: string | null;
  paymentMethod?: string | null;
  createdDate?: string | null;
  orderId?: string | null;
  failureReason?: string | null;
  purpose?: string | null;
  trademark?: { id: number; name?: string | null; applicationNo?: number | null } | null;
  userProfile?: { id: number; firstName?: string | null; lastName?: string | null; email?: string | null } | null;
}

export const PAYMENT_PURPOSE_OPTIONS: { value: string; label: string }[] = [
  { value: 'PROFESSIONAL_FEES', label: 'Professional fees' },
  { value: 'GOVT_FEES', label: 'Govt fees' },
  { value: 'OTHER', label: 'Other' },
];

/** Payment status is a free-text string, so classify heuristically for the badge. */
export function paymentStatusBadgeClass(status: string | null | undefined): string {
  const s = (status ?? '').toLowerCase();
  if (s.includes('fail') || s.includes('cancel')) return 'badge--danger';
  if (s.includes('paid') || s.includes('captur') || s.includes('success') || s.includes('complete')) return 'badge--success';
  if (s.includes('pending') || s.includes('created') || s.includes('initiat')) return 'badge--warning';
  return 'badge--muted';
}

export function paymentPurposeLabel(purpose: string | null | undefined): string {
  if (!purpose) return '—';
  const match = PAYMENT_PURPOSE_OPTIONS.find(o => o.value === purpose);
  return match ? match.label : purpose.replace(/_/g, ' ');
}

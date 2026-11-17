/** Operational record returned by the admin certificate-delivery queue. */
export interface IAdminCertificateDownload {
  id: number;
  requestId: string;
  trademarkId?: number | null;
  applicationNo: number;
  trademarkName?: string | null;
  tmClass?: number | null;
  proprietorName?: string | null;
  trademarkStatus?: string | null;
  status: string;
  statusMessage?: string | null;
  requestedAt?: string | null;
  statusUpdatedAt?: string | null;
  downloadStartedAt?: string | null;
  manualDeliveryRequestedAt?: string | null;
  manualDeliveryPhone?: string | null;
}

export function certificateStatusBadgeClass(status: string | null | undefined): string {
  const value = (status ?? '').toUpperCase();
  if (value === 'DOWNLOADED') return 'badge--success';
  if (value === 'MANUAL_DELIVERY_REQUESTED') return 'badge--warning';
  if (value === 'FAILED' || value === 'NOT_AVAILABLE' || value === 'BUSY') return 'badge--danger';
  if (value === 'QUEUED' || value === 'FETCHING' || value === 'READY') return 'badge--info';
  return 'badge--muted';
}

export function readableCertificateStatus(status: string | null | undefined): string {
  return status ? status.replace(/_/g, ' ') : 'Unknown';
}

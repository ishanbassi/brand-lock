/**
 * Trademark lifecycle status options for the admin status control.
 *
 * These MUST match the backend TrademarkStatus enum
 * (com.bassi.tmapp.domain.enumeration.TrademarkStatus). The column itself is a
 * free-text string, so constraining edits to this fixed list is what keeps the
 * data consistent — never let the admin type a free-form status.
 */
export const TRADEMARK_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'FILED', label: 'Filed' },
  { value: 'UNDER_EXAMINATION', label: 'Under examination' },
  { value: 'OBJECTED', label: 'Objected' },
  { value: 'EXAMINATION_REPLY_FILED', label: 'Examination reply filed' },
  { value: 'ACCEPTED_AND_ADVERTISED', label: 'Accepted & advertised' },
  { value: 'OPPOSED', label: 'Opposed' },
  { value: 'HEARING', label: 'Hearing' },
  { value: 'REGISTERED', label: 'Registered' },
  { value: 'ABANDONED', label: 'Abandoned' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'RENEWED', label: 'Renewed' },
  { value: 'UNKNOWN', label: 'Unknown' },
];

/** Maps a trademark status to a CSS badge modifier class (matches the .badge--* styles). */
export function trademarkStatusBadgeClass(status: string | null | undefined): string {
  switch (status) {
    case 'REGISTERED':
    case 'RENEWED':
    case 'ACCEPTED_AND_ADVERTISED':
      return 'badge--success';
    case 'ABANDONED':
    case 'WITHDRAWN':
    case 'REJECTED':
    case 'EXPIRED':
      return 'badge--danger';
    case 'OBJECTED':
    case 'OPPOSED':
    case 'HEARING':
    case 'UNDER_EXAMINATION':
    case 'EXAMINATION_REPLY_FILED':
      return 'badge--warning';
    case 'DRAFT':
    case 'FILED':
      return 'badge--info';
    default:
      return 'badge--muted';
  }
}

/** Human-readable label for a status value (falls back to prettified raw value). */
export function trademarkStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Unknown';
  const match = TRADEMARK_STATUS_OPTIONS.find(o => o.value === status);
  return match ? match.label : status.replace(/_/g, ' ');
}

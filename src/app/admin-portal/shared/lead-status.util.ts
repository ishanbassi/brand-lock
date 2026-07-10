/**
 * Lead status options for admin controls.
 *
 * IMPORTANT: these must match the BACKEND LeadStatus enum exactly
 * (com.bassi.tmapp.domain.enumeration.LeadStatus), otherwise a PATCH with an
 * unknown value fails server-side deserialization. The brand-lock model enum
 * additionally carries a stale 'CONTACTED' value that the backend does NOT
 * accept, so we do not source options from it.
 */
export const LEAD_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'NEW', label: 'New' },
  { value: 'FOLLOW_UP', label: 'Follow up' },
  { value: 'DOCUMENTS_PENDING', label: 'Documents pending' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'LOST', label: 'Lost' },
];

/** Maps a lead status to a CSS badge modifier class (matches the .badge--* styles). */
export function leadStatusBadgeClass(status: string | null | undefined): string {
  switch (status) {
    case 'CONVERTED':
      return 'badge--success';
    case 'LOST':
      return 'badge--danger';
    case 'FOLLOW_UP':
    case 'DOCUMENTS_PENDING':
      return 'badge--warning';
    case 'NEW':
      return 'badge--info';
    default:
      return 'badge--muted';
  }
}

/**
 * Backlink opportunity status/category options for admin controls.
 *
 * IMPORTANT: values must match the BACKEND BacklinkStatus/BacklinkCategory enums exactly
 * (com.bassi.tmapp.domain.enumeration.BacklinkStatus / BacklinkCategory), otherwise a PATCH
 * with an unknown value fails server-side deserialization.
 */
export const BACKLINK_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'FOUND', label: 'Found' },
  { value: 'OUTREACH_SENT', label: 'Outreach sent' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'LIVE', label: 'Live' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'SKIPPED', label: 'Skipped' },
];

export const BACKLINK_CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'DIRECTORY', label: 'Directory / citation' },
  { value: 'RESOURCE_PAGE', label: 'Resource page' },
  { value: 'GUEST_POST', label: 'Free guest post' },
  { value: 'OTHER', label: 'Other' },
];

export function backlinkStatusBadgeClass(status: string | null | undefined): string {
  switch (status) {
    case 'LIVE':
      return 'badge--success';
    case 'REJECTED':
      return 'badge--danger';
    case 'OUTREACH_SENT':
      return 'badge--warning';
    case 'SUBMITTED':
      return 'badge--info';
    case 'FOUND':
    case 'SKIPPED':
    default:
      return 'badge--muted';
  }
}

export function backlinkCategoryLabel(category: string | null | undefined): string {
  return BACKLINK_CATEGORY_OPTIONS.find(c => c.value === category)?.label ?? '—';
}

export function backlinkStatusLabel(status: string | null | undefined): string {
  return BACKLINK_STATUS_OPTIONS.find(s => s.value === status)?.label ?? 'Unknown';
}

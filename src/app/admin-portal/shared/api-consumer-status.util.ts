/**
 * API consumer status/tier options for admin controls.
 *
 * IMPORTANT: values must match the BACKEND ApiConsumerStatus/ApiTier enums exactly
 * (com.bassi.tmapp.domain.enumeration.ApiConsumerStatus / ApiTier), otherwise a PATCH with an
 * unknown value fails server-side deserialization.
 */
export const API_CONSUMER_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'WARNED', label: 'Warned' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'REVOKED', label: 'Revoked' },
];

export const API_TIER_OPTIONS: { value: string; label: string }[] = [
  { value: 'FREE', label: 'Free' },
  { value: 'TRUSTED', label: 'Trusted' },
];

export function apiConsumerStatusBadgeClass(status: string | null | undefined): string {
  switch (status) {
    case 'ACTIVE':
      return 'badge--success';
    case 'WARNED':
      return 'badge--warning';
    case 'SUSPENDED':
    case 'REVOKED':
      return 'badge--danger';
    default:
      return 'badge--muted';
  }
}

export function apiConsumerStatusLabel(status: string | null | undefined): string {
  return API_CONSUMER_STATUS_OPTIONS.find(s => s.value === status)?.label ?? 'Unknown';
}

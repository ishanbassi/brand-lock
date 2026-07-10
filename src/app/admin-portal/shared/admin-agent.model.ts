/**
 * Shape of an agent as returned by /api/admin/agents. This is the TmAgent entity
 * directly (not the base TmAgentDTO, which omits profileStatus / userId).
 */
export interface IAdminAgent {
  id: number;
  fullName?: string | null;
  companyName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  agentCode?: string | null;
  barRegNo?: string | null;
  website?: string | null;
  address?: string | null;
  profileStatus?: string | null;
  userId?: number | null;
  createdDate?: string | null;
}

export const AGENT_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'PENDING_REVIEW', label: 'Pending review' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
];

export function agentStatusBadgeClass(status: string | null | undefined): string {
  switch (status) {
    case 'ACTIVE':
      return 'badge--success';
    case 'SUSPENDED':
      return 'badge--danger';
    case 'PENDING_REVIEW':
      return 'badge--warning';
    default:
      return 'badge--muted';
  }
}

export function agentStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Unknown';
  const match = AGENT_STATUS_OPTIONS.find(o => o.value === status);
  return match ? match.label : status.replace(/_/g, ' ');
}

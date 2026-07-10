/**
 * Shape of a document as returned by /api/admin/documents (DocumentsDTO).
 * Declared here because the brand-lock IDocuments model omits `status` and the
 * nested trademark/applicant details that the admin review queue needs.
 */
export interface IAdminDocument {
  id: number;
  documentType?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  fileContentType?: string | null;
  status?: string | null;
  createdDate?: string | null;
  trademark?: { id: number; name?: string | null; applicationNo?: number | null; proprietorName?: string | null } | null;
  userProfile?: { id: number; firstName?: string | null; lastName?: string | null; email?: string | null } | null;
}

export const DOCUMENT_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'UPLOADED', label: 'Uploaded' },
  { value: 'UNDER_REVIEW', label: 'Under review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'REUPLOAD_REQUESTED', label: 'Re-upload requested' },
];

export function documentStatusBadgeClass(status: string | null | undefined): string {
  switch (status) {
    case 'APPROVED':
      return 'badge--success';
    case 'REJECTED':
      return 'badge--danger';
    case 'UNDER_REVIEW':
    case 'REUPLOAD_REQUESTED':
      return 'badge--warning';
    case 'UPLOADED':
      return 'badge--info';
    default:
      return 'badge--muted';
  }
}

export function documentStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Unknown';
  const match = DOCUMENT_STATUS_OPTIONS.find(o => o.value === status);
  return match ? match.label : status.replace(/_/g, ' ');
}

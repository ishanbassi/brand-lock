import { SignerIdStatus } from '../../../models/dashboard-stats.model';

/** Mirrors the backend EfilingStatus enum — per-mark progress on ipindiaonline.gov.in. */
export type EfilingStatus =
  | 'NOT_STARTED'
  | 'AWAITING_SIGNER_ID'
  | 'AWAITING_PROPRIETOR_CODE'
  | 'READY_TO_FILE'
  | 'AWAITING_APPLICANT_OTP'
  | 'ACCOUNT_REGISTERED'
  | 'FILED'
  | 'FAILED';

export interface EfilingDocument {
  id: number;
  documentType: string;
  fileName?: string;
  fileUrl?: string;
  status?: string;
}

/**
 * Everything needed to work one application against the IP India portal. Assembled
 * server-side so the admin screen never has to stitch it together from three endpoints.
 */
export interface EfilingChecklist {
  trademarkId: number;
  userProfileId?: number;
  efilingStatus: EfilingStatus;
  efilingNotes?: string;
  efilingFiledDate?: string;
  applicationNo?: number;

  signerIdStatus: SignerIdStatus;
  esignSignerId?: string;
  signerIdVerifiedDate?: string;
  proprietorCode?: string;
  efilingUserId?: string;

  applicantName?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  applicantAddress?: string;
  applicantCity?: string;
  applicantState?: string;
  applicantZipCode?: number;
  organizationType?: string;

  markName?: string;
  markType?: string;
  tmClass?: number;
  goodsDescription?: string;
  usage?: string;
  applicationDate?: string;

  documents: EfilingDocument[];
  /** Server-computed reasons this can't be filed yet. Empty means ready. */
  blockers: string[];
}

/** Partial update — only non-null fields are applied. */
export interface EfilingUpdate {
  efilingStatus?: EfilingStatus;
  efilingNotes?: string;
  applicationNo?: number;
  signerIdStatus?: SignerIdStatus;
  esignSignerId?: string;
  proprietorCode?: string;
  efilingUserId?: string;
}

export const EFILING_STATUS_OPTIONS: { value: EfilingStatus; label: string }[] = [
  { value: 'NOT_STARTED', label: 'Not started' },
  { value: 'AWAITING_SIGNER_ID', label: 'Awaiting Signer ID' },
  { value: 'AWAITING_PROPRIETOR_CODE', label: 'Awaiting Proprietor Code' },
  { value: 'READY_TO_FILE', label: 'Ready to file' },
  { value: 'AWAITING_APPLICANT_OTP', label: 'Awaiting applicant OTP' },
  { value: 'ACCOUNT_REGISTERED', label: 'Account registered' },
  { value: 'FILED', label: 'Filed' },
  { value: 'FAILED', label: 'Failed' },
];

export const SIGNER_ID_STATUS_OPTIONS: { value: SignerIdStatus; label: string }[] = [
  { value: 'NOT_STARTED', label: 'Not started' },
  { value: 'INVITED', label: 'Invited' },
  { value: 'VIDEO_SUBMITTED', label: 'Video submitted' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'REJECTED', label: 'Rejected' },
];

export function efilingStatusLabel(status?: EfilingStatus): string {
  return EFILING_STATUS_OPTIONS.find(o => o.value === status)?.label ?? 'Not started';
}

export function signerIdStatusLabel(status?: SignerIdStatus): string {
  return SIGNER_ID_STATUS_OPTIONS.find(o => o.value === status)?.label ?? 'Not started';
}

/** Badge modifier, matching the .badge--* classes the other admin screens use. */
export function efilingBadgeClass(status?: EfilingStatus): string {
  switch (status) {
    case 'FILED':
      return 'badge--success';
    case 'FAILED':
      return 'badge--danger';
    case 'READY_TO_FILE':
      return 'badge--info';
    case 'AWAITING_SIGNER_ID':
    case 'AWAITING_PROPRIETOR_CODE':
    case 'AWAITING_APPLICANT_OTP':
    case 'ACCOUNT_REGISTERED':
      return 'badge--warning';
    default:
      return 'badge--muted';
  }
}

export function signerIdBadgeClass(status?: SignerIdStatus): string {
  switch (status) {
    case 'VERIFIED':
      return 'badge--success';
    case 'REJECTED':
      return 'badge--danger';
    case 'VIDEO_SUBMITTED':
      return 'badge--warning';
    case 'INVITED':
      return 'badge--info';
    default:
      return 'badge--muted';
  }
}

import dayjs from 'dayjs/esm';

export enum BacklinkCategory {
  DIRECTORY = 'DIRECTORY',
  RESOURCE_PAGE = 'RESOURCE_PAGE',
  GUEST_POST = 'GUEST_POST',
  OTHER = 'OTHER',
}

export enum BacklinkStatus {
  FOUND = 'FOUND',
  OUTREACH_SENT = 'OUTREACH_SENT',
  SUBMITTED = 'SUBMITTED',
  LIVE = 'LIVE',
  REJECTED = 'REJECTED',
  SKIPPED = 'SKIPPED',
}

export interface IBacklinkOpportunity {
  id: number;
  siteName?: string | null;
  url?: string | null;
  category?: keyof typeof BacklinkCategory | null;
  status?: keyof typeof BacklinkStatus | null;
  qualityNote?: string | null;
  submissionMethod?: string | null;
  contactEmail?: string | null;
  notes?: string | null;
  followUpDate?: string | null;
  dateSubmitted?: string | null;
  dateLive?: string | null;
  createdDate?: dayjs.Dayjs | null;
  modifiedDate?: dayjs.Dayjs | null;
  deleted?: boolean | null;
}

export type NewBacklinkOpportunity = Omit<IBacklinkOpportunity, 'id'> & { id: null };

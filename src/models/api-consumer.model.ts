import dayjs from 'dayjs/esm';

export enum ApiConsumerStatus {
  ACTIVE = 'ACTIVE',
  WARNED = 'WARNED',
  SUSPENDED = 'SUSPENDED',
  REVOKED = 'REVOKED',
}

export enum ApiTier {
  FREE = 'FREE',
  TRUSTED = 'TRUSTED',
}

export interface IApiConsumer {
  id: number;
  name?: string | null;
  email?: string | null;
  companyName?: string | null;
  registeredDomain?: string | null;
  useCase?: string | null;
  apiKeyPrefix?: string | null;
  status?: keyof typeof ApiConsumerStatus | null;
  tier?: keyof typeof ApiTier | null;
  verificationFailCount?: number | null;
  lastVerifiedDate?: dayjs.Dayjs | null;
  lastUsedDate?: dayjs.Dayjs | null;
  createdDate?: dayjs.Dayjs | null;
  modifiedDate?: dayjs.Dayjs | null;
  deleted?: boolean | null;
}

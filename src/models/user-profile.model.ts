import dayjs from 'dayjs/esm';
import { IUser } from './user.model';

export interface IUserProfile {
  id: number;
  createdDate?: dayjs.Dayjs | null;
  modifiedDate?: dayjs.Dayjs | null;
  deleted?: boolean | null;
  firstName?: string | null;
  lastName?: string | null;
  active?: boolean | null;
  email?: string | null;
  phoneNumber?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  zipCode?: number | null;
  state?: string | null;
  utmCampaign?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmContent?: string | null;
  user?: Pick<IUser, 'id'> | null;
  fullName?: string | null;
}

export type NewUserProfile = Omit<IUserProfile, 'id'> & { id: null };

import dayjs from 'dayjs/esm';
import { IUser } from './user.model';

export interface IUserProfile {
  id: number;
  createdDate?: dayjs.Dayjs | null;
  modifiedDate?: dayjs.Dayjs | null;
  deleted?: boolean | null;
  user?: Pick<IUser, 'id'> | null;
}

export type NewUserProfile = Omit<IUserProfile, 'id'> & { id: null };

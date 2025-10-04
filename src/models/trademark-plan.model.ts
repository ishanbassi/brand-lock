import dayjs from 'dayjs/esm';

export interface ITrademarkPlan {
  id: number;
  name?: string | null;
  fees?: number | null;
  notes?: string | null;
  createdDate?: dayjs.Dayjs | null;
  deleted?: boolean | null;
  modifiedDate?: dayjs.Dayjs | null;
}

export type NewTrademarkPlan = Omit<ITrademarkPlan, 'id'> & { id: null };

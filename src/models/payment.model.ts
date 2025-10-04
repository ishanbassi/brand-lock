import dayjs from 'dayjs/esm';
import { ITrademark } from './trademark.model';

export interface IPayment {
  id: number;
  gateway?: string | null;
  gatewayPaymentId?: string | null;
  amount?: number | null;
  currency?: string | null;
  status?: string | null;
  paymentMethod?: string | null;
  createdDate?: dayjs.Dayjs | null;
  deleted?: boolean | null;
  modifiedDate?: dayjs.Dayjs | null;
  orderId?: string | null;
  gatewayOrderId?: string | null;
  failureReason?: string | null;
  trademark?: Pick<ITrademark, 'id'> | null;
}

export type NewPayment = Omit<IPayment, 'id'> & { id: null };

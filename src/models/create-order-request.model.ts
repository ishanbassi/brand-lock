import { IPayment } from "./payment.model";
import { ITrademark } from "./trademark.model";

export interface CreateOrder{
    trademarkDTO?: ITrademark | null;
    currency?: string;
    paymentDTO?: IPayment | null
}
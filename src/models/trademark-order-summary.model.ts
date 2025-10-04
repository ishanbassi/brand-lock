import { IDocuments } from "./documents.model";
import { ILead } from "./lead.model";
import { IPayment } from "./payment.model";
import { ITrademark } from "./trademark.model";

export interface TrademarkOrderSummary {
  trademarkDTO: ITrademark;
  leadDTO: ILead;
  paymentDTO: IPayment;
  orderSummaries: OrderSummary[];
  totalFees: number;
  documentsDTO?: IDocuments | null;
}

export interface OrderSummary {
  tmClass: number;
  fees: number; 
  trademarkDTO: ITrademark | null;
}
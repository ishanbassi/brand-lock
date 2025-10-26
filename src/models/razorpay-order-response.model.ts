import { ILead } from "./lead.model";
import { IUserProfile } from "./user-profile.model";

export interface RazorPayOrderResponse{
    razorpay_order_id:string;
    razorpay_payment_id: string
    razorpay_signature: string

}

export type RazorPaySignatureVerificationDTO  = RazorPayOrderResponse & {leadDTO?:ILead|null; userProfileDTO?:IUserProfile|null};  
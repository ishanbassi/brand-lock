import dayjs from "dayjs/esm";
import { ITrademark } from "./trademark.model";
import { DocumentType } from "../app/enumerations/document-type.model";

export interface DashboardStats {
    userSummary:UserSummaryDTO;
    recentApplications:ITrademark[];
    stats:StatsDTO[];
    pendingTasks:TaskDTO[];
    /** Non-trademark services the user has purchased (MSME, ISO, IEC, renewals…).
     *  Optional — the backend does not send this yet; the dashboard renders a
     *  discovery section when it is absent or empty. */
    services?:ServiceOrderDTO[];
}

export interface ServiceOrderDTO {
    /** e.g. "MSME", "ISO_9001", "IEC", "TRADEMARK_RENEWAL" */
    serviceType:string;
    /** Human title shown on the card, e.g. "ISO 9001:2015 Certification" */
    title:string;
    /** Free-text current stage, e.g. "Documents under review" */
    statusLabel:string;
    /** 0–100 completion of the service journey */
    progress:number;
    reference?:string;
    updatedDate?:dayjs.Dayjs;
}

export interface UserSummaryDTO {
    firstName:string;
    lastName:string;
    email:string;
    onboardedDate:dayjs.Dayjs;
    profileComplete: boolean;
    planType:string;
    phoneNumber:string;
    /** eMudhra eSign enrolment state — see SignerIdStatus. Always sent; never null. */
    signerIdStatus?:SignerIdStatus;
}

/** Mirrors the backend SignerIdStatus enum. One-time, per person, not per mark. */
export type SignerIdStatus = 'NOT_STARTED' | 'INVITED' | 'VIDEO_SUBMITTED' | 'VERIFIED' | 'REJECTED';

export interface TaskDTO {
    title:string; 
    description:string; 
    type:string;
    link:string;
    applicationId:number;
    documentType?:DocumentType

}

export interface StatsDTO {
    trademarkStatus:string;
    count:number;
}
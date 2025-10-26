import dayjs from "dayjs/esm";
import { ITrademark } from "./trademark.model";

export interface DashboardStats {
    userSummary:UserSummaryDTO;
    recentApplications:ITrademark[];
    stats:StatsDTO[];
    pendingTasks:TaskDTO[];
}

export interface UserSummaryDTO {
    firstName:string;
    lastName:string;
    email:string;
    onboardedDate:dayjs.Dayjs;
    profileComplete: boolean;
    planType:string;
    phoneNumber:string
}

export interface TaskDTO {
    title:string; 
    description:string; 
    type:string;
    link:string;

}

export interface StatsDTO {
    trademarkStatus:string;
    count:number;
}
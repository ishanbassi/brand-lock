import dayjs from "dayjs/esm";
import { Employee, IEmployee } from "./employee.model";

export enum ContactMethod {
    CALL = 'CALL',
    MESSAGE = 'MESSAGE',
    EMAIL = 'EMAIL',
}

export enum LeadStatus {
    CONVERTED = 'CONVERTED',
    DOCUMENTS_PENDING = 'DOCUMENTS_PENDING',
    FOLLOW_UP = 'FOLLOW_UP',
    NEW = 'NEW',
    CONTACTED = 'CONTACTED',
    LOST = 'LOST'
}

export class Lead {
    id?: number;
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    city?: string;
    brandName?: string;
    selectedPackage?: string;
    tmClass?: number;
    comments?: string;
    contactMethod?: ContactMethod;
    createdDate?: Date;
    modifiedDate?: Date;
    deleted?: boolean;
    status?: LeadStatus;
    leadSource?: string;
    assignedTo?: Employee;

    constructor(data?: Partial<Lead>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    equals(other: Lead): boolean {
        return this.id === other.id;
    }

} 

export interface ILead {
    id: number;
    fullName?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
    city?: string | null;
    brandName?: string | null;
    selectedPackage?: string | null;
    tmClass?: number | null;
    comments?: string | null;
    contactMethod?: keyof typeof ContactMethod | null;
    createdDate?: dayjs.Dayjs | null;
    modifiedDate?: dayjs.Dayjs | null;
    deleted?: boolean | null;
    status?: keyof typeof LeadStatus | null;
    leadSource?: string | null;
    assignedTo?: IEmployee | null;
  }
  
  export type NewLead = Omit<ILead, 'id'> & { id: null };
  
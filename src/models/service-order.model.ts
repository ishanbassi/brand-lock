export type ServiceType = 'TRADEMARK_REGISTRATION'
  | 'MSME' | 'ISO' | 'IEC' | 'TRADEMARK_RENEWAL'
  | 'TRADEMARK_OBJECTION' | 'TRADEMARK_WATCH' | 'TRADEMARK_ASSIGNMENT' | 'TRADEMARK_OPPOSITION' | 'TRADEMARK_HEARING'
  | 'ISO_14001' | 'ISO_45001' | 'ISO_27001' | 'ISO_22000';

export interface ServiceOrderRequest {
  serviceType: ServiceType;
  leadId?: number;
  amount: number;
  description?: string;
  referralCode?: string | null;
}

export interface ServiceOrderSummary {
  serviceType: ServiceType;
  serviceName: string;
  amount: number;
  orderId?: string;
  applicantName?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  trademarkNumber?: string;
}

export const SERVICE_CONFIG: Record<ServiceType, { name: string; price: number; description: string }> = {
  MSME: {
    name: 'MSME / Udyam Registration',
    price: 499,
    description: 'MSME registration for government benefits & trademark subsidy'
  },
  ISO: {
    name: 'ISO 9001:2015 Certification',
    price: 1499,
    description: 'Quality management system certification'
  },
  IEC: {
    name: 'Import Export Code (IEC)',
    price: 1499,
    description: 'IEC registration for import/export business'
  },
  TRADEMARK_RENEWAL: {
    name: 'Trademark Renewal',
    price: 4999,
    description: 'Renewal of an existing registered trademark'
  },
  TRADEMARK_OBJECTION: {
    name: 'Trademark Objection Reply',
    price: 2999,
    description: 'Professional reply to trademark examination report / objection'
  },
  TRADEMARK_WATCH: {
    name: 'Trademark Watch Service',
    price: 1499,
    description: 'Monitor and alert for conflicting trademark filings'
  },
  TRADEMARK_ASSIGNMENT: {
    name: 'Trademark Assignment / Transfer',
    price: 4999,
    description: 'Transfer ownership of a registered trademark (TM-P form)'
  },
  TRADEMARK_OPPOSITION: {
    name: 'Trademark Opposition',
    price: 3999,
    description: 'File or defend a trademark opposition under Section 21'
  },
  TRADEMARK_HEARING: {
    name: 'Trademark Hearing Assistance',
    price: 3499,
    description: 'Expert representation at trademark hearing before the Registrar'
  },
  ISO_14001: {
    name: 'ISO 14001:2015 Certification',
    price: 1999,
    description: 'Environmental Management System certification'
  },
  ISO_45001: {
    name: 'ISO 45001:2018 Certification',
    price: 1999,
    description: 'Occupational Health & Safety Management System certification'
  },
  ISO_27001: {
    name: 'ISO 27001:2022 Certification',
    price: 2499,
    description: 'Information Security Management System certification'
  },
  ISO_22000: {
    name: 'ISO 22000:2018 Certification',
    price: 1999,
    description: 'Food Safety Management System certification'
  },
  TRADEMARK_REGISTRATION:{
    name: 'Trademark Filing',
    price: 1499,
    description: 'Trademark Filing Service'
  }
};

export interface PartnerProfile {
  id?: number;
  userId?: number;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  companyName?: string;
  website?: string;
  partnerCode?: string;
  status?: 'ACTIVE' | 'SUSPENDED';
  commissionRateBps?: number;
}

export interface PartnerRegistration {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  phoneNumber?: string;
  companyName?: string;
  website?: string;
}

export interface ReferralConversionSummary {
  id: number;
  createdDate?: string;
  saleAmount?: number;
  commissionAmount?: number;
  status?: 'PENDING' | 'PAID' | 'VOID';
  paidDate?: string;
}

export interface PartnerDashboardStats {
  totalConversions: number;
  totalCommissionPending: number;
  totalCommissionPaid: number;
  recentConversions: ReferralConversionSummary[];
}

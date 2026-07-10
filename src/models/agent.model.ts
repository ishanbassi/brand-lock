export interface AgentProfile {
  id?: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  companyName?: string;
  address?: string;
  agentCode?: string;
  barRegNo?: string;
  website?: string;
  profileStatus?: 'PENDING_REVIEW' | 'ACTIVE' | 'SUSPENDED';
  userId?: number;
}

export interface AgentRegistration {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  phoneNumber?: string;
  companyName?: string;
  address?: string;
  barRegNo?: string;
  website?: string;
  captchaResponse: string;
}

export interface AgentPortfolioTrademark {
  id?: number;
  name?: string;
  applicationNo?: number;
  applicationDate?: string;
  filingDate?: string | Date;
  renewalDate?: string | Date;
  proprietorName?: string;
  proprietorAddress?: string;
  attorneyName?: string;
  tmClass?: number;
  trademarkStatus?: string;
  type?: string;
  description?: string;
  source?: string;
  details?: string;
  phoneNumber?: string;
  email?: string;
  state?: string;
  filingMode?: string;
}

export interface AgentImportResult {
  totalRows: number;
  importable: number;
  imported: number;
  skipped: number;
  errors: number;
  errorMessages?: string[];
  previewRows: AgentPortfolioTrademark[];
}

export interface AgentDashboardStats {
  totalTrademarks: number;
  activeTrademarks: number;
  expiringIn90Days: number;
  watchlistCount: number;
  recentAdditions: AgentPortfolioTrademark[];
  expiringSoon: AgentPortfolioTrademark[];
}

export interface TrademarkConflict {
  id?: number;
  name?: string;
  applicationNo?: number;
  proprietorName?: string;
  trademarkStatus?: string;
  tmClass?: number;
  score: number;
  similarityScore?: number;
}

export interface WatchConflictHistory {
  id?: number;
  trademarkId?: number;
  trademarkName?: string;
  tmAgentId?: number;
  checkDate?: string;
  conflictingTrademarkId?: number;
  conflictingTrademarkName?: string;
  similarityScore?: number;
  riskLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  isNewConflict?: boolean;
  status?: 'PENDING' | 'RESOLVED' | 'IGNORED';
}

export interface AgentPublicProfile {
  id?: number;
  fullName?: string;
  companyName?: string;
  agentCode?: string;
  website?: string;
  profileStatus?: string;
  portfolioCount?: number;
}

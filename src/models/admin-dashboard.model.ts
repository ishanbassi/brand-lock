/**
 * Aggregate counts shown on the admin dashboard.
 * Backed by GET /api/admin/dashboard (AdminDashboardResource in tmadmin).
 */
export interface IAdminDashboardStats {
  /** Leads grouped by LeadStatus (NEW, FOLLOW_UP, CONVERTED, LOST). */
  leadsByStatus: Record<string, number>;
  /** Trademarks grouped by their (free-text) trademarkStatus value. */
  applicationsByStatus: Record<string, number>;
  /** Documents currently awaiting review (DocumentStatus.UNDER_REVIEW). */
  documentsPendingReview: number;
  /** Payments captured today (any status). */
  paymentsToday: number;
  /** Total captured payment amount today. */
  paymentsTodayAmount: number;
  /** Agents awaiting approval (AgentProfileStatus.PENDING_REVIEW). */
  agentsPendingApproval: number;
  /** Convenience totals. */
  totalLeads: number;
  totalApplications: number;
}

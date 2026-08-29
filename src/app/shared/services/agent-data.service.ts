import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AgentClaimRequest,
  AgentClaimResult,
  AgentDashboardStats,
  AgentDirectoryEntry,
  AgentImportSummary,
  AgentJournalWatchResult,
  AgentImportResult,
  AgentPortfolioTrademark,
  AgentProfile,
  AgentPublicProfile,
  AgentRegistration,
  TrademarkConflict,
  WatchConflictHistory,
} from '../../../models/agent.model';

@Injectable({ providedIn: 'root' })
export class AgentDataService {
  private readonly base = `${environment.BaseApiUrl}api`;

  constructor(private readonly http: HttpClient) {}

  // Registration (public)
  registerAgent(data: AgentRegistration): Observable<HttpResponse<AgentProfile>> {
    return this.http.post<AgentProfile>(`${this.base}/agent-portal/register`, data, { observe: 'response' });
  }

  // Profile
  getProfile(): Observable<AgentProfile> {
    return this.http.get<AgentProfile>(`${this.base}/agent-portal/profile`);
  }

  updateProfile(data: Partial<AgentProfile>): Observable<AgentProfile> {
    return this.http.put<AgentProfile>(`${this.base}/agent-portal/profile`, data);
  }

  // Dashboard
  getDashboardStats(): Observable<AgentDashboardStats> {
    return this.http.get<AgentDashboardStats>(`${this.base}/agent-portal/dashboard/stats`);
  }

  // Portfolio CRUD
  getPortfolio(page = 0, size = 20): Observable<HttpResponse<AgentPortfolioTrademark[]>> {
    return this.http.get<AgentPortfolioTrademark[]>(
      `${this.base}/agent-portal/portfolio?page=${page}&size=${size}`,
      { observe: 'response' }
    );
  }

  getPortfolioItem(id: number): Observable<AgentPortfolioTrademark> {
    return this.http.get<AgentPortfolioTrademark>(`${this.base}/agent-portal/portfolio/${id}`);
  }

  addToPortfolio(data: AgentPortfolioTrademark): Observable<AgentPortfolioTrademark> {
    return this.http.post<AgentPortfolioTrademark>(`${this.base}/agent-portal/portfolio`, data);
  }

  addPortfolioItem(data: Partial<AgentPortfolioTrademark>): Observable<AgentPortfolioTrademark> {
    return this.http.post<AgentPortfolioTrademark>(`${this.base}/agent-portal/portfolio`, data);
  }

  updatePortfolioItem(id: number, data: Partial<AgentPortfolioTrademark>): Observable<AgentPortfolioTrademark> {
    return this.http.put<AgentPortfolioTrademark>(`${this.base}/agent-portal/portfolio/${id}`, data);
  }

  deletePortfolioItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/agent-portal/portfolio/${id}`);
  }

  // Excel import
  previewImport(file: File): Observable<AgentImportResult> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<AgentImportResult>(`${this.base}/agent-portal/portfolio/preview`, form);
  }

  /** batchId comes from the preview response so both calls share one retained-upload record. */
  confirmImport(file: File, batchId?: number): Observable<AgentImportResult> {
    const form = new FormData();
    form.append('file', file);
    const url = `${this.base}/agent-portal/portfolio/import`;
    return this.http.post<AgentImportResult>(batchId != null ? `${url}?batchId=${batchId}` : url, form);
  }

  // Trademark watch
  findConflicts(portfolioItemId: number): Observable<TrademarkConflict[]> {
    return this.http.get<TrademarkConflict[]>(`${this.base}/agent-portal/portfolio/${portfolioItemId}/conflicts`);
  }

  getConflicts(portfolioItemId: number): Observable<TrademarkConflict[]> {
    return this.findConflicts(portfolioItemId);
  }

  // Phase 2 — Conflict history
  getConflictHistory(portfolioItemId: number): Observable<WatchConflictHistory[]> {
    return this.http.get<WatchConflictHistory[]>(`${this.base}/agent-portal/portfolio/${portfolioItemId}/conflict-history`);
  }

  // Phase 2 — Batch watch (trigger for current agent)
  triggerBatchWatch(): Observable<void> {
    return this.http.post<void>(`${this.base}/agent-portal/portfolio/batch-watch`, {});
  }

  // Phase 2 — Portfolio export
  /** The caller's own upload history — backs the "we're checking your file" banner. */
  getOwnImports(): Observable<AgentImportSummary[]> {
    return this.http.get<AgentImportSummary[]>(`${this.base}/agent-portal/imports`);
  }

  // ── Registry sync & agent notes ──────────────────────────────────────────

  /**
   * Asks the registry for the latest on one mark. Returns the queue state — the fetch is served
   * asynchronously, so the caller re-loads to see the result rather than blocking on it.
   */
  refreshFromRegistry(trademarkId: number): Observable<{ state: string }> {
    return this.http.post<{ state: string }>(`${this.base}/agent-portal/portfolio/${trademarkId}/refresh`, {});
  }

  /** Updates the agent's private notes for a mark. Allowed whatever the mark's provenance. */
  updatePortfolioLink(
    trademarkId: number,
    updates: { agentNotes?: string; clientReference?: string },
  ): Observable<Record<string, unknown>> {
    return this.http.patch<Record<string, unknown>>(`${this.base}/agent-portal/portfolio/${trademarkId}/link`, updates);
  }

  // ── Journal watch ────────────────────────────────────────────────────────

  /** Journal issues available to check, newest first. */
  getWatchJournals(limit = 24): Observable<number[]> {
    return this.http.get<number[]>(`${this.base}/agent-portal/watch/journals?limit=${limit}`);
  }

  /** Scores the whole portfolio against one journal issue. */
  runJournalWatch(journalNo: number): Observable<AgentJournalWatchResult> {
    return this.http.post<AgentJournalWatchResult>(`${this.base}/agent-portal/watch/journals/${journalNo}`, {});
  }

  // ── Discovery: find and claim marks already in our data ──────────────────

  /** Type-ahead over the agent-name directory. */
  searchAgents(q: string, limit = 20): Observable<AgentDirectoryEntry[]> {
    return this.http.get<AgentDirectoryEntry[]>(
      `${this.base}/agent-portal/discover/agents?q=${encodeURIComponent(q)}&limit=${limit}`,
    );
  }

  /** The marks filed under one exact agent name. */
  discoverTrademarks(agentName: string, page = 0, size = 100): Observable<HttpResponse<AgentPortfolioTrademark[]>> {
    return this.http.get<AgentPortfolioTrademark[]>(
      `${this.base}/agent-portal/discover/trademarks?agentName=${encodeURIComponent(agentName)}&page=${page}&size=${size}`,
      { observe: 'response' },
    );
  }

  /** Links the selected marks into the caller's portfolio. */
  claimTrademarks(request: AgentClaimRequest): Observable<AgentClaimResult> {
    return this.http.post<AgentClaimResult>(`${this.base}/agent-portal/discover/claim`, request);
  }

  exportPortfolioExcel(): Observable<Blob> {
    return this.http.get(`${this.base}/agent-portal/portfolio/export/excel`, { responseType: 'blob' });
  }

  exportPortfolioPdf(): Observable<Blob> {
    return this.http.get(`${this.base}/agent-portal/portfolio/export/pdf`, { responseType: 'blob' });
  }

  // Phase 2 — Agent public profile
  getPublicAgentProfile(agentCode: string): Observable<AgentPublicProfile> {
    return this.http.get<AgentPublicProfile>(`${this.base}/agent-portal/public/${agentCode}`);
  }
}

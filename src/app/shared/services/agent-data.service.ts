import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AgentAddByNumberResult,
  AgentClaimRequest,
  AgentClaimResult,
  AgentDashboardStats,
  AgentDirectoryEntry,
  AgentBulkUploadResult,
  AgentDocument,
  AgentDocumentLibraryPage,
  AgentDocumentLibrarySummary,
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

  /** Every conflict recorded across the whole portfolio — what the digest email links to. */
  getAllConflicts(): Observable<WatchConflictHistory[]> {
    return this.http.get<WatchConflictHistory[]>(`${this.base}/agent-portal/watch/conflicts`);
  }


  // Phase 2 — Portfolio export
  /** The caller's own upload history — backs the "we're checking your file" banner. */
  getOwnImports(): Observable<AgentImportSummary[]> {
    return this.http.get<AgentImportSummary[]>(`${this.base}/agent-portal/imports`);
  }

  /**
   * Adds a mark by application number, with everything else pulled from the register.
   *
   * Returns a state rather than a trademark: ADDED when we already held it, FETCHING when it has
   * been queued with the registry. The agent is never blocked on the fetch.
   */
  addByApplicationNo(applicationNo: string, clientReference?: string): Observable<AgentAddByNumberResult> {
    return this.http.post<AgentAddByNumberResult>(`${this.base}/agent-portal/portfolio/by-application-no`, {
      applicationNo,
      clientReference,
    });
  }

  // ── Documents ────────────────────────────────────────────────────────────

  listDocuments(trademarkId: number): Observable<AgentDocument[]> {
    return this.http.get<AgentDocument[]>(`${this.base}/agent-portal/portfolio/${trademarkId}/documents`);
  }

  uploadDocument(
    trademarkId: number,
    file: File,
    meta: { documentType?: string; notes?: string; documentDate?: string },
  ): Observable<AgentDocument> {
    const form = new FormData();
    form.append('file', file);
    if (meta.documentType) form.append('documentType', meta.documentType);
    if (meta.notes) form.append('notes', meta.notes);
    if (meta.documentDate) form.append('documentDate', meta.documentDate);
    return this.http.post<AgentDocument>(`${this.base}/agent-portal/portfolio/${trademarkId}/documents`, form);
  }

  /**
   * Fetches the bytes rather than linking to them. These files sit outside every web-served
   * directory on purpose, so there is no URL to point an anchor at — the browser gets a blob.
   */
  // ── Document library (portfolio-wide) ──────────────────────────────────
  //
  // Distinct from listDocuments above, which answers "what is attached to this mark". The library
  // spans every mark, which is what an agent actually needs when they know the document but not
  // which application it was filed against.

  getDocumentLibrary(options: {
    type?: string | null;
    clientRef?: string | null;
    q?: string | null;
    page?: number;
    size?: number;
  } = {}): Observable<AgentDocumentLibraryPage> {
    let params = new HttpParams()
      .set('page', String(options.page ?? 0))
      .set('size', String(options.size ?? 25));
    if (options.type) params = params.set('type', options.type);
    if (options.clientRef) params = params.set('clientRef', options.clientRef);
    if (options.q) params = params.set('q', options.q);
    return this.http.get<AgentDocumentLibraryPage>(`${this.base}/agent-portal/documents`, { params });
  }

  getDocumentLibrarySummary(): Observable<AgentDocumentLibrarySummary> {
    return this.http.get<AgentDocumentLibrarySummary>(`${this.base}/agent-portal/documents/summary`);
  }

  uploadDocuments(
    trademarkId: number,
    files: File[],
    meta: { documentType?: string; notes?: string },
  ): Observable<AgentBulkUploadResult> {
    const form = new FormData();
    files.forEach(file => form.append('files', file));
    if (meta.documentType) form.append('documentType', meta.documentType);
    if (meta.notes) form.append('notes', meta.notes);
    return this.http.post<AgentBulkUploadResult>(
      `${this.base}/agent-portal/portfolio/${trademarkId}/documents/bulk`,
      form,
    );
  }

  reclassifyDocument(documentId: number, documentType: string): Observable<AgentDocument> {
    return this.http.patch<AgentDocument>(`${this.base}/agent-portal/documents/${documentId}/type`, { documentType });
  }

  downloadDocument(documentId: number): Observable<Blob> {
    return this.http.get(`${this.base}/agent-portal/documents/${documentId}/download`, { responseType: 'blob' });
  }

  deleteDocument(documentId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/agent-portal/documents/${documentId}`);
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

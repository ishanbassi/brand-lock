import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AgentDashboardStats,
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
  private readonly base = `${environment.BaseApiUrl}/api`;

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

  confirmImport(file: File): Observable<AgentImportResult> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<AgentImportResult>(`${this.base}/agent-portal/portfolio/import`, form);
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

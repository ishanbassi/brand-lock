import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { createRequestOption } from '../../core/request/request-util';
import { AgentImportGrid, AgentImportRepair, ExcelHeaderAlias, IAdminAgentImport } from '../shared/admin-agent-import.model';

/** Retained agent portfolio uploads. ROLE_ADMIN-gated /api/admin/agent-imports. */
@Injectable({ providedIn: 'root' })
export class AdminAgentImportService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/admin/agent-imports');

  query(req?: any): Observable<HttpResponse<IAdminAgentImport[]>> {
    const options = createRequestOption(req);
    return this.http.get<IAdminAgentImport[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  /**
   * Streams the original workbook. These files are never web-served, so the download goes
   * through the authenticated endpoint as a blob rather than a plain href.
   */
  download(id: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.resourceUrl}/${id}/download`, { responseType: 'blob', observe: 'response' });
  }

  /** Replays the retained file through the current parser without touching the portfolio. */
  /**
   * Dry-runs a correction. Reports what the parser would find without touching the portfolio, so a
   * mapping can be checked against real rows before anything is written.
   */
  reparse(id: number, repair?: AgentImportRepair): Observable<HttpResponse<any>> {
    return this.http.post(`${this.resourceUrl}/${id}/reparse`, repair ?? null, { observe: 'response' });
  }

  /** The workbook's raw cells, for matching columns by eye. */
  grid(id: number, sheetIndex?: number, maxRows = 20): Observable<AgentImportGrid> {
    const sheet = sheetIndex != null ? `&sheetIndex=${sheetIndex}` : '';
    return this.http.get<AgentImportGrid>(`${this.resourceUrl}/${id}/grid?maxRows=${maxRows}${sheet}`);
  }

  /** Applies the correction: writes the rows into the agent's portfolio. */
  importRows(id: number, repair: AgentImportRepair): Observable<HttpResponse<any>> {
    return this.http.post(`${this.resourceUrl}/${id}/import`, repair, { observe: 'response' });
  }

  headerAliases(): Observable<ExcelHeaderAlias[]> {
    return this.http.get<ExcelHeaderAlias[]>(`${this.resourceUrl}/header-aliases`);
  }

  deleteHeaderAlias(aliasId: number): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/header-aliases/${aliasId}`);
  }

  review(id: number, status?: string, notes?: string): Observable<HttpResponse<IAdminAgentImport>> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.patch<IAdminAgentImport>(`${this.resourceUrl}/${id}/review`, notes ?? '', {
      params,
      observe: 'response',
    });
  }
}

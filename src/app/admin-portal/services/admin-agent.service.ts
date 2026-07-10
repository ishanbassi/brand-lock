import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { createRequestOption } from '../../core/request/request-util';
import { IAdminAgent } from '../shared/admin-agent.model';

/** Admin agent approval queue data access. ROLE_ADMIN-gated /api/admin/agents. */
@Injectable({ providedIn: 'root' })
export class AdminAgentService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/admin/agents');

  query(req?: any): Observable<HttpResponse<IAdminAgent[]>> {
    const options = createRequestOption(req);
    return this.http.get<IAdminAgent[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  /** Approve / suspend / reset an agent. status is an AgentProfileStatus value. */
  setStatus(id: number, status: string): Observable<HttpResponse<IAdminAgent>> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<IAdminAgent>(`${this.resourceUrl}/${id}/status`, null, { params, observe: 'response' });
  }
}

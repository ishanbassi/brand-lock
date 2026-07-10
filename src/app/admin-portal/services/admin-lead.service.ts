import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ILead } from '../../../models/lead.model';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { createRequestOption } from '../../core/request/request-util';

export type PartialUpdateLead = Partial<ILead> & Pick<ILead, 'id'>;

/**
 * Admin lead pipeline data access. Hits the ROLE_ADMIN-gated /api/admin/leads
 * endpoints (AdminLeadResource), which are safe for cross-tenant lead data.
 */
@Injectable({ providedIn: 'root' })
export class AdminLeadService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/admin/leads');

  /** Paginated + filterable list. `req` carries JHipster criteria params (e.g. status.equals). */
  query(req?: any): Observable<HttpResponse<ILead[]>> {
    const options = createRequestOption(req);
    return this.http.get<ILead[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  find(id: number): Observable<HttpResponse<ILead>> {
    return this.http.get<ILead>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  /** Assign an employee / advance status / edit comments. Null fields are ignored server-side. */
  update(lead: PartialUpdateLead): Observable<HttpResponse<ILead>> {
    return this.http.patch<ILead>(`${this.resourceUrl}/${lead.id}`, lead, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
      observe: 'response',
    });
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBacklinkOpportunity, NewBacklinkOpportunity } from '../../../models/backlink-opportunity.model';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { createRequestOption } from '../../core/request/request-util';

export type PartialUpdateBacklinkOpportunity = Partial<IBacklinkOpportunity> & Pick<IBacklinkOpportunity, 'id'>;

/**
 * Admin backlink tracker data access. Hits the ROLE_ADMIN-gated
 * /api/admin/backlink-opportunities endpoints (AdminBacklinkResource).
 */
@Injectable({ providedIn: 'root' })
export class AdminBacklinkService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/admin/backlink-opportunities');

  query(req?: any): Observable<HttpResponse<IBacklinkOpportunity[]>> {
    const options = createRequestOption(req);
    return this.http.get<IBacklinkOpportunity[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  dueForFollowUp(): Observable<IBacklinkOpportunity[]> {
    return this.http.get<IBacklinkOpportunity[]>(`${this.resourceUrl}/due-for-follow-up`);
  }

  create(opportunity: NewBacklinkOpportunity): Observable<HttpResponse<IBacklinkOpportunity>> {
    return this.http.post<IBacklinkOpportunity>(this.resourceUrl, opportunity, { observe: 'response' });
  }

  update(opportunity: PartialUpdateBacklinkOpportunity): Observable<HttpResponse<IBacklinkOpportunity>> {
    return this.http.patch<IBacklinkOpportunity>(`${this.resourceUrl}/${opportunity.id}`, opportunity, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
      observe: 'response',
    });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }
}

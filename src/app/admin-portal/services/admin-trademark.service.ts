import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITrademark } from '../../../models/trademark.model';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { createRequestOption } from '../../core/request/request-util';

export type PartialUpdateTrademark = Partial<ITrademark> & Pick<ITrademark, 'id'>;

/**
 * Admin application (trademark) data access. Hits the ROLE_ADMIN-gated
 * /api/admin/trademarks endpoints, which are scoped to customer-owned
 * applications only (never the scraped journal corpus).
 */
@Injectable({ providedIn: 'root' })
export class AdminTrademarkService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/admin/trademarks');

  query(req?: any): Observable<HttpResponse<ITrademark[]>> {
    const options = createRequestOption(req);
    return this.http.get<ITrademark[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  find(id: number): Observable<HttpResponse<ITrademark>> {
    return this.http.get<ITrademark>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  /** Advance the lifecycle status (or other fields). Null fields are ignored server-side. */
  update(trademark: PartialUpdateTrademark): Observable<HttpResponse<ITrademark>> {
    return this.http.patch<ITrademark>(`${this.resourceUrl}/${trademark.id}`, trademark, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
      observe: 'response',
    });
  }
}

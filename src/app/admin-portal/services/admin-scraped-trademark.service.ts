import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITrademark } from '../../../models/trademark.model';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { createRequestOption } from '../../core/request/request-util';

export type PartialUpdateTrademark = Partial<ITrademark> & Pick<ITrademark, 'id'>;

/**
 * Admin review of the scraped/journal trademark corpus (unowned rows) - hits the
 * ROLE_ADMIN-gated /api/admin/scraped-trademarks endpoints, distinct from
 * AdminTrademarkService which is scoped to customer-owned applications only.
 */
@Injectable({ providedIn: 'root' })
export class AdminScrapedTrademarkService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/admin/scraped-trademarks');

  query(req?: any): Observable<HttpResponse<ITrademark[]>> {
    const options = createRequestOption(req);
    return this.http.get<ITrademark[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  find(id: number): Observable<HttpResponse<ITrademark>> {
    return this.http.get<ITrademark>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  update(trademark: PartialUpdateTrademark): Observable<HttpResponse<ITrademark>> {
    return this.http.patch<ITrademark>(`${this.resourceUrl}/${trademark.id}`, trademark, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
      observe: 'response',
    });
  }

  /** Sends the website/app-development pitch email to whatever email is currently on file. */
  sendPitchEmail(id: number): Observable<HttpResponse<void>> {
    return this.http.post<void>(`${this.resourceUrl}/${id}/pitch-email`, {}, { observe: 'response' });
  }
}

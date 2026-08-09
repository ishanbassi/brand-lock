import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { createRequestOption } from '../../core/request/request-util';
import { EfilingChecklist, EfilingStatus, EfilingUpdate } from '../shared/efiling.model';

/**
 * Admin workbench data access for assisted self-filing.
 *
 * Nothing here talks to ipindiaonline.gov.in — the admin does that in another tab.
 * These endpoints only assemble what they need to type and record what they did.
 */
@Injectable({ providedIn: 'root' })
export class AdminEfilingService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/admin/efiling');

  /** Paginated queue; omit status for everything. */
  queue(req?: { status?: EfilingStatus; page?: number; size?: number; sort?: string[] }): Observable<HttpResponse<EfilingChecklist[]>> {
    const options = createRequestOption(req);
    return this.http.get<EfilingChecklist[]>(`${this.resourceUrl}/queue`, { params: options, observe: 'response' });
  }

  checklist(trademarkId: number): Observable<HttpResponse<EfilingChecklist>> {
    return this.http.get<EfilingChecklist>(`${this.resourceUrl}/${trademarkId}/checklist`, { observe: 'response' });
  }

  update(trademarkId: number, update: EfilingUpdate): Observable<HttpResponse<EfilingChecklist>> {
    return this.http.patch<EfilingChecklist>(`${this.resourceUrl}/${trademarkId}`, update, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
      observe: 'response',
    });
  }
}

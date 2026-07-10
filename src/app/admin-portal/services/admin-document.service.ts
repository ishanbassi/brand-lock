import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { createRequestOption } from '../../core/request/request-util';
import { IAdminDocument } from '../shared/admin-document.model';

/**
 * Admin document review queue data access. ROLE_ADMIN-gated /api/admin/documents.
 */
@Injectable({ providedIn: 'root' })
export class AdminDocumentService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/admin/documents');

  query(req?: any): Observable<HttpResponse<IAdminDocument[]>> {
    const options = createRequestOption(req);
    return this.http.get<IAdminDocument[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  /** Move a document to a new review status (APPROVED / REJECTED / REUPLOAD_REQUESTED). */
  setStatus(id: number, status: string): Observable<HttpResponse<IAdminDocument>> {
    return this.http.patch<IAdminDocument>(`${this.resourceUrl}/${id}`, { id, status }, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
      observe: 'response',
    });
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from '../../core/config/application-config.service';
import { createRequestOption } from '../../core/request/request-util';
import { IAdminCertificateDownload } from '../shared/admin-certificate-download.model';

/** Admin-only read access to the certificate-delivery operational queue. */
@Injectable({ providedIn: 'root' })
export class AdminCertificateDownloadService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/admin/certificate-downloads');

  query(req?: Record<string, string | number | boolean>): Observable<HttpResponse<IAdminCertificateDownload[]>> {
    return this.http.get<IAdminCertificateDownload[]>(this.resourceUrl, {
      params: createRequestOption(req),
      observe: 'response',
    });
  }
}

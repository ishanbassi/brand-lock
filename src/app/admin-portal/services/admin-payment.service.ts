import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { createRequestOption } from '../../core/request/request-util';
import { IAdminPayment } from '../shared/admin-payment.model';

/** Admin payment reconciliation data access (read-only). ROLE_ADMIN-gated. */
@Injectable({ providedIn: 'root' })
export class AdminPaymentService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/admin/payments');

  query(req?: any): Observable<HttpResponse<IAdminPayment[]>> {
    const options = createRequestOption(req);
    return this.http.get<IAdminPayment[]>(this.resourceUrl, { params: options, observe: 'response' });
  }
}

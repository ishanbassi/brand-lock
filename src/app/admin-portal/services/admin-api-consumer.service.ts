import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IApiConsumer } from '../../../models/api-consumer.model';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { createRequestOption } from '../../core/request/request-util';

export type PartialUpdateApiConsumer = Partial<IApiConsumer> & Pick<IApiConsumer, 'id'>;

/** Admin visibility into public-API signups. Hits the ROLE_ADMIN-gated /api/admin/api-consumers endpoints (AdminApiConsumerResource). */
@Injectable({ providedIn: 'root' })
export class AdminApiConsumerService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/admin/api-consumers');

  query(req?: any): Observable<HttpResponse<IApiConsumer[]>> {
    const options = createRequestOption(req);
    return this.http.get<IApiConsumer[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  update(consumer: PartialUpdateApiConsumer): Observable<HttpResponse<IApiConsumer>> {
    return this.http.patch<IApiConsumer>(`${this.resourceUrl}/${consumer.id}`, consumer, {
      headers: { 'Content-Type': 'application/merge-patch+json' },
      observe: 'response',
    });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }
}

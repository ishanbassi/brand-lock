import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';

export interface IStatusWatchResult {
  status: 'CONFIRMATION_SENT' | 'ALREADY_CONFIRMED' | 'CONFIRMED' | 'UNSUBSCRIBED';
  trademarkName?: string | null;
  trademarkStatus?: string | null;
}

@Injectable({ providedIn: 'root' })
export class StatusWatchService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/extended/status-watch');

  subscribe(trademarkId: number, email: string): Observable<HttpResponse<IStatusWatchResult>> {
    return this.http.post<IStatusWatchResult>(this.resourceUrl, { trademarkId, email }, { observe: 'response' });
  }

  confirm(key: string): Observable<HttpResponse<IStatusWatchResult>> {
    return this.http.get<IStatusWatchResult>(`${this.resourceUrl}/confirm`, { params: { key }, observe: 'response' });
  }

  unsubscribe(key: string): Observable<HttpResponse<IStatusWatchResult>> {
    return this.http.get<IStatusWatchResult>(`${this.resourceUrl}/unsubscribe`, { params: { key }, observe: 'response' });
  }
}

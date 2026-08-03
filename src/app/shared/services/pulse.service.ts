import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';

export interface IPulseResult {
  status: 'CONFIRMATION_SENT' | 'ALREADY_CONFIRMED' | 'CONFIRMED' | 'UNSUBSCRIBED';
  tmClass?: number | null;
}

@Injectable({ providedIn: 'root' })
export class PulseService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/extended/pulse-digest');

  subscribe(tmClass: number, email: string): Observable<HttpResponse<IPulseResult>> {
    return this.http.post<IPulseResult>(this.resourceUrl, { tmClass, email }, { observe: 'response' });
  }

  confirm(key: string): Observable<HttpResponse<IPulseResult>> {
    return this.http.get<IPulseResult>(`${this.resourceUrl}/confirm`, { params: { key }, observe: 'response' });
  }

  unsubscribe(key: string): Observable<HttpResponse<IPulseResult>> {
    return this.http.get<IPulseResult>(`${this.resourceUrl}/unsubscribe`, { params: { key }, observe: 'response' });
  }
}

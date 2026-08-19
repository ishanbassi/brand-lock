import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiConsumerRegistration {
  name: string;
  email: string;
  companyName?: string;
  registeredDomain: string;
  useCase?: string;
}

export interface ApiConsumerRegistrationResult {
  id: number;
  apiKey: string;
  apiKeyPrefix: string;
  attributionSnippetHtml: string;
  docsUrl: string;
}

@Injectable({ providedIn: 'root' })
export class DeveloperPortalDataService {
  private readonly base = `${environment.BaseApiUrl}api`;

  constructor(private readonly http: HttpClient) {}

  register(data: ApiConsumerRegistration): Observable<ApiConsumerRegistrationResult> {
    return this.http.post<ApiConsumerRegistrationResult>(`${this.base}/developer-portal/register`, data);
  }
}

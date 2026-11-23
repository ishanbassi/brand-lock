import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';

export interface IIsoCertificateAccessGrant {
  id: number;
  email: string;
  agentId?: number | null;
  agentName?: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminIsoCertificateAccessService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ApplicationConfigService);
  private readonly resourceUrl = this.config.getEndpointFor('api/admin/iso-certificate-access');

  list(): Observable<IIsoCertificateAccessGrant[]> {
    return this.http.get<IIsoCertificateAccessGrant[]>(this.resourceUrl);
  }

  grant(input: { email?: string; agentId?: number }): Observable<IIsoCertificateAccessGrant> {
    return this.http.post<IIsoCertificateAccessGrant>(this.resourceUrl, input);
  }

  revoke(id: number): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/${id}`);
  }
}

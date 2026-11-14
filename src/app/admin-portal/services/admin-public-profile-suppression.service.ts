import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';

export interface IPublicProfileSuppression {
  id: number;
  url: string;
  proprietorSlug: string;
  applicationNo: number;
  reason: string | null;
  caseReference: string | null;
  createdAt: string;
  createdBy: string;
}

export interface NewPublicProfileSuppression {
  url: string;
  reason?: string | null;
  caseReference?: string | null;
}

/** ROLE_ADMIN access to public proprietor-profile removal controls. */
@Injectable({ providedIn: 'root' })
export class AdminPublicProfileSuppressionService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);
  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/admin/public-profile-suppressions');

  list(): Observable<IPublicProfileSuppression[]> {
    return this.http.get<IPublicProfileSuppression[]>(this.resourceUrl);
  }

  suppress(request: NewPublicProfileSuppression): Observable<IPublicProfileSuppression> {
    return this.http.post<IPublicProfileSuppression>(this.resourceUrl, request);
  }

  restore(id: number): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/${id}`);
  }
}

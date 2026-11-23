import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { ApplicationConfigService } from '../../core/config/application-config.service';

/** Server-backed access state for the restricted ISO certificate workspace. */
@Injectable({ providedIn: 'root' })
export class IsoCertificateAccessService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ApplicationConfigService);
  private readonly endpoint = this.config.getEndpointFor('api/agent-portal/iso-certificates/access');
  private allowed$?: Observable<boolean>;

  isAllowed(refresh = false): Observable<boolean> {
    if (!this.allowed$ || refresh) {
      this.allowed$ = this.http.get<{ allowed: boolean }>(this.endpoint).pipe(
        map(response => response.allowed === true),
        // A failed entitlement check must fail closed; the API still remains the final boundary.
        catchError(() => of(false)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.allowed$;
  }
}

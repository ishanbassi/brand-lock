import { inject } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { ApplicationConfigService } from '../core/config/application-config.service';
import { Router } from '@angular/router';
import { SessionStorageService } from '../shared/services/session-storage.service';

export function authInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    const applicationConfigService = inject(ApplicationConfigService);
    const stateStorageService = inject(LocalStorageService);
    const sessionStorageService = inject(SessionStorageService);
    const router = inject(Router);


  const serverApiUrl = applicationConfigService.getEndpointFor('');
    if (!request.url || (request.url.startsWith('http') && !(serverApiUrl && request.url.startsWith(serverApiUrl)))) {
      return next(request);
    }

    const token: string | null = stateStorageService.getAuthenticationToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    return next(request).pipe(catchError((error) => {
      if (error.status === 401) {
        stateStorageService.remove('token');
        stateStorageService.remove('user');
        sessionStorageService.remove('trademark');
        sessionStorageService.remove("initial-onboarding")
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }));
}
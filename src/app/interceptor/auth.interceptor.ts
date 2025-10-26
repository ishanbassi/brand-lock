import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpHandlerFn, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { ApplicationConfigService } from '../core/config/application-config.service';

export function authInterceptor(request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    const applicationConfigService = inject(ApplicationConfigService);
    const stateStorageService = inject(LocalStorageService);


  const serverApiUrl = applicationConfigService.getEndpointFor('');
    if (!request.url || (request.url.startsWith('http') && !(serverApiUrl && request.url.startsWith(serverApiUrl)))) {
      return next(request);
    }

    const token: string | null = stateStorageService.getAuthenticationToken();
    console.log(token)
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    return next(request)
}
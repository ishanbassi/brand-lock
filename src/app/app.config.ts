import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async' 
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {provideEnvironmentNgxMask} from 'ngx-mask'
import { provideToastr } from 'ngx-toastr';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from "ng-recaptcha-2";
import { environment } from '../environments/environment';
import { authInterceptor } from './interceptor/auth.interceptor';
import { provideMarkdown } from 'ngx-markdown';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
          provideRouter(routes, withInMemoryScrolling({scrollPositionRestoration: 'enabled',anchorScrolling: 'enabled'})),
        provideAnimationsAsync(),
        provideHttpClient(
                withInterceptors([authInterceptor])
              ),
        provideEnvironmentNgxMask(),
        provideToastr({
            positionClass: 'toast-top-right',
            preventDuplicates: false,
            timeOut: 3000,
         }),
         importProvidersFrom(RecaptchaV3Module),
         { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptchaSiteKey },
         provideMarkdown(), provideClientHydration(withEventReplay())

          
        ],
};

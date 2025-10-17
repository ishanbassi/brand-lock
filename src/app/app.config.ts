import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async' 
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import {provideEnvironmentNgxMask} from 'ngx-mask'
import { provideToastr } from 'ngx-toastr';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from "ng-recaptcha-2";
import { environment } from '../environments/environment';


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
          provideRouter(routes, withInMemoryScrolling({scrollPositionRestoration: 'enabled',anchorScrolling: 'enabled'})),
        provideAnimationsAsync(),
        provideHttpClient(),
        provideEnvironmentNgxMask(),
        provideToastr({
            positionClass: 'toast-top-right',
            preventDuplicates: false,
            timeOut: 3000,
         }),
         importProvidersFrom(RecaptchaV3Module),
         { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptchaSiteKey },

          
        ],
};

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async' 
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import {provideEnvironmentNgxMask} from 'ngx-mask'
import { provideToastr } from 'ngx-toastr';


export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
         provideRouter(routes, withInMemoryScrolling({scrollPositionRestoration: 'enabled'})),
        provideAnimationsAsync(),
        provideHttpClient(),
        provideEnvironmentNgxMask(),
        provideToastr({
            positionClass: 'toast-top-right',
            preventDuplicates: false,
            timeOut: 3000,
         })
          
        ]
};

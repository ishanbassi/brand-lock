import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { IsoCertificateAccessService } from '../shared/services/iso-certificate-access.service';

/** Stops deep links before the ISO feature bundle is loaded for a non-enabled agent. */
export const isoCertificateAccessGuard: CanActivateFn = () => {
  const access = inject(IsoCertificateAccessService);
  const router = inject(Router);
  return access.isAllowed().pipe(map(allowed => allowed || router.createUrlTree(['/agent-portal/dashboard'])));
};

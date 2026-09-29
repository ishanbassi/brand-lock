import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { EntitlementError, FeatureKey } from '../../models/billing.model';
import { BillingService } from '../shared/services/billing.service';

/**
 * Turns a 402 from any gated endpoint into an upgrade prompt.
 *
 * Keyed on the status alone. The backend returns 402 for "your plan does not cover this" and for
 * nothing else, which is why it chose 402 over 403: 403 already means "wrong role" here, and an
 * interceptor matching it would mistake an expired session for a paywall.
 *
 * Where the agent is sent depends on what they were doing:
 *
 * - A save, or a file download, is something they just clicked. Taking them to billing is the
 *   helpful answer, and the `feature` query parameter lets that page say what was blocked.
 * - A GET fired by a screen loading is not. Navigating away mid-render would bounce them off the
 *   page they asked for, so the error is recorded for the shell's banner and the screen stays.
 *
 * The error is always rethrown, so each screen's own error handling still runs.
 */
export const entitlementInterceptor: HttpInterceptorFn = (req, next) => {
  const billing = inject(BillingService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse && err.status === 402) {
        const problem = toEntitlementError(err.error);
        billing.lastEntitlementError.set(problem);
        // Something about the agent's standing changed, or was stale. Cheap to re-read.
        billing.refreshState();

        const userAction = req.method !== 'GET' || req.responseType === 'blob' || req.responseType === 'arraybuffer';
        if (userAction) {
          router.navigate(['/agent-portal/billing'], {
            queryParams: problem.feature ? { feature: problem.feature } : {},
          });
        }
      }
      return throwError(() => err);
    }),
  );
};

/**
 * Reads the problem body the backend sends.
 *
 * Defensive on purpose: a download's error body arrives as a Blob, which cannot be read here
 * synchronously, and the prompt must still say something sensible rather than nothing.
 */
function toEntitlementError(body: unknown): EntitlementError {
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const detail = b['detail'];
  return {
    feature: typeof b['feature'] === 'string' ? (b['feature'] as FeatureKey) : null,
    planCode: typeof b['planCode'] === 'string' ? (b['planCode'] as string) : null,
    limit: typeof b['limit'] === 'number' ? (b['limit'] as number) : null,
    used: typeof b['used'] === 'number' ? (b['used'] as number) : null,
    detail: typeof detail === 'string' && detail.trim() ? detail : 'This needs a paid plan.',
  };
}

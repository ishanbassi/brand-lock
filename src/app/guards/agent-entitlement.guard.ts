import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { EntitlementError, FeatureKey } from '../../models/billing.model';
import { BillingService } from '../shared/services/billing.service';

/**
 * Stops a Free user at a feature's route and opens the same checkout prompt used for a 402.
 * The backend remains authoritative for mutations and direct API calls; this guard makes opening
 * an unavailable workspace feel immediate instead of waiting for its first request to fail.
 */
export const agentEntitlementGuard: CanActivateFn = route => {
  const feature = route.data['entitlementFeature'] as FeatureKey | undefined;
  if (!feature) return true;

  const billing = inject(BillingService);
  const router = inject(Router);

  return billing.loadState().pipe(
    map(state => {
      const entitlement = state.entitlements[feature];
      if (!entitlement || entitlement.allowed) return true;

      const problem: EntitlementError = {
        feature,
        planCode: state.effectivePlanCode,
        limit: entitlement.limit,
        used: entitlement.used,
        detail: `${featureLabel(feature)} is available on Pro. Choose a plan to unlock it.`,
      };
      billing.openUpgrade(problem);
      return router.createUrlTree(['/agent-portal/dashboard']);
    }),
    // A temporary billing-state failure must not lock an entitled agent out of their workspace.
    catchError(() => of(true)),
  );
};

function featureLabel(feature: FeatureKey): string {
  switch (feature) {
    case 'NEW_FILING_WATCH': return 'New Filing Watch';
    case 'DEADLINES': return 'Deadlines and renewals';
    default: return 'This feature';
  }
}

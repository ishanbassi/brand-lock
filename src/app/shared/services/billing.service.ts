import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BillingState,
  CheckoutResult,
  EntitlementError,
  FeatureKey,
  SubscribeResponse,
  SubscriptionPayment,
  SubscriptionPlan,
} from '../../../models/billing.model';

/**
 * The agent's plan and what it allows.
 *
 * Its own service rather than more of `AgentDataService`: that one holds portfolio and profile
 * data, and keeping billing apart means a billing request failing can never blank the sidebar's
 * firm name.
 *
 * The server is the only place anything is enforced. What is here decides what to draw - lock
 * badges, banners, meters - and it fails open: a snapshot that has not loaded yet reports every
 * feature as available, so the first paint is never a nav full of padlocks.
 */
@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.BaseApiUrl}api/agent-portal/billing`;

  private readonly stateSignal = signal<BillingState | null>(null);
  readonly state = this.stateSignal.asReadonly();

  /**
   * The last 402 any request received. Set by the entitlement interceptor, shown by the shell's
   * billing banner, and cleared on navigation - a prompt belongs to the screen that raised it.
   */
  readonly lastEntitlementError = signal<EntitlementError | null>(null);

  loadState(): Observable<BillingState> {
    return this.http.get<BillingState>(`${this.base}/state`).pipe(tap(s => this.stateSignal.set(s)));
  }

  /** Fire-and-forget refresh. Failure keeps whatever was already known. */
  refreshState(): void {
    this.loadState().subscribe({ error: () => undefined });
  }

  getPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(`${this.base}/plans`);
  }

  /** Creates the Razorpay subscription Checkout will open. */
  startSubscription(planCode: string): Observable<SubscribeResponse> {
    return this.http.post<SubscribeResponse>(`${this.base}/subscribe`, { planCode });
  }

  /** Posts Checkout's result back. The answer is fresh state, so the portal unlocks without another request. */
  verify(result: CheckoutResult): Observable<BillingState> {
    return this.http.post<BillingState>(`${this.base}/verify`, result).pipe(tap(s => this.stateSignal.set(s)));
  }

  /** Cancels at the end of the paid period. */
  cancel(): Observable<BillingState> {
    return this.http.post<BillingState>(`${this.base}/cancel`, {}).pipe(tap(s => this.stateSignal.set(s)));
  }

  getPayments(): Observable<SubscriptionPayment[]> {
    return this.http.get<SubscriptionPayment[]>(`${this.base}/payments`);
  }

  /** Whether the plan includes a feature. True until the state has loaded - see the class comment. */
  can(feature: FeatureKey): boolean {
    const entitlement = this.stateSignal()?.entitlements?.[feature];
    return entitlement ? entitlement.allowed : true;
  }
}

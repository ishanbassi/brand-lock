import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FeatureEntitlement {
  allowed: boolean;
  limit: number | null;
  used: number | null;
}

export interface SubscriptionPlan {
  code: string;
  name: string;
  billingInterval: 'MONTHLY' | 'ANNUAL' | string | null;
  amountPaise: number;
  currency: string;
  monthlyEquivalentPaise: number;
  sortOrder: number;
  entitlements: Record<string, FeatureEntitlement>;
}

export interface BillingState {
  effectivePlanCode: string;
  effectivePlanName: string;
  subscribedPlanCode: string | null;
  status: string | null;
  entitled: boolean;
  entitledUntil: string | null;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  nextChargeAt: string | null;
  cancelAtPeriodEnd: boolean;
  lastFailureReason: string | null;
  entitlements: Record<string, FeatureEntitlement>;
}

export interface SubscriptionPayment {
  id: number;
  amountPaise: number | null;
  currency: string | null;
  state: string | null;
  paidAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  razorpayPaymentId: string | null;
  paymentMethod: string | null;
}

export interface CheckoutSession {
  razorpaySubscriptionId: string;
  razorpayKeyId: string;
  planCode: string;
  planName: string;
  amountPaise: number;
  currency: string;
  prefill: { name: string | null; email: string | null; contact: string | null } | null;
}

@Injectable({ providedIn: 'root' })
export class AgentBillingService {
  private readonly base = `${environment.BaseApiUrl}api/agent-portal/billing`;

  constructor(private readonly http: HttpClient) {}

  plans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(`${this.base}/plans`);
  }

  state(): Observable<BillingState> {
    return this.http.get<BillingState>(`${this.base}/state`);
  }

  payments(): Observable<SubscriptionPayment[]> {
    return this.http.get<SubscriptionPayment[]>(`${this.base}/payments`);
  }

  subscribe(planCode: string): Observable<CheckoutSession> {
    return this.http.post<CheckoutSession>(`${this.base}/subscribe`, { planCode });
  }

  verify(response: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }): Observable<BillingState> {
    return this.http.post<BillingState>(`${this.base}/verify`, response);
  }

  cancel(): Observable<BillingState> {
    return this.http.post<BillingState>(`${this.base}/cancel`, {});
  }
}

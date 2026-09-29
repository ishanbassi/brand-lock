import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { createRequestOption } from '../../core/request/request-util';
import {
  IAdminBillingOverview,
  IAdminPlan,
  IAdminSubscriptionDetail,
  IAdminSubscriptionRow,
} from '../shared/admin-billing.model';

/** Admin billing console data access. ROLE_ADMIN-gated /api/admin/billing/**. */
@Injectable({ providedIn: 'root' })
export class AdminBillingService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/admin/billing');

  overview(): Observable<HttpResponse<IAdminBillingOverview>> {
    return this.http.get<IAdminBillingOverview>(`${this.resourceUrl}/overview`, { observe: 'response' });
  }

  plans(): Observable<HttpResponse<IAdminPlan[]>> {
    return this.http.get<IAdminPlan[]>(`${this.resourceUrl}/plans`, { observe: 'response' });
  }

  subscriptions(req?: any): Observable<HttpResponse<IAdminSubscriptionRow[]>> {
    const params = createRequestOption(req);
    return this.http.get<IAdminSubscriptionRow[]>(`${this.resourceUrl}/subscriptions`, { params, observe: 'response' });
  }

  subscription(id: number): Observable<HttpResponse<IAdminSubscriptionDetail>> {
    return this.http.get<IAdminSubscriptionDetail>(`${this.resourceUrl}/subscriptions/${id}`, { observe: 'response' });
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Create the plan in Razorpay. Idempotent. */
  provision(code: string): Observable<HttpResponse<IAdminPlan>> {
    return this.http.post<IAdminPlan>(`${this.resourceUrl}/plans/${code}/provision`, null, { observe: 'response' });
  }

  /** Re-read one subscription from Razorpay and apply it now. */
  sync(id: number): Observable<HttpResponse<IAdminSubscriptionRow>> {
    return this.http.post<IAdminSubscriptionRow>(`${this.resourceUrl}/subscriptions/${id}/sync`, null, { observe: 'response' });
  }

  /** Cancel by hand. immediate ⇒ access stops now; otherwise the paid period runs out. */
  cancel(id: number, immediate: boolean, note: string): Observable<HttpResponse<IAdminSubscriptionRow>> {
    return this.http.post<IAdminSubscriptionRow>(
      `${this.resourceUrl}/subscriptions/${id}/cancel`,
      { immediate, note },
      { observe: 'response' },
    );
  }

  /** Grant an agent free access for `days` days. */
  comp(tmAgentId: number, days: number, planCode: string | null, note: string): Observable<HttpResponse<IAdminSubscriptionRow>> {
    return this.http.post<IAdminSubscriptionRow>(
      `${this.resourceUrl}/agents/${tmAgentId}/comp`,
      { days, planCode: planCode || undefined, note },
      { observe: 'response' },
    );
  }
}

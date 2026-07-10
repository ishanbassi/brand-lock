import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { IAdminDashboardStats } from '../../../models/admin-dashboard.model';

/**
 * Admin dashboard data access. Hits the role-gated /api/admin/** namespace,
 * so these endpoints are only reachable with a ROLE_ADMIN JWT.
 */
@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/admin/dashboard');

  getStats(): Observable<HttpResponse<IAdminDashboardStats>> {
    return this.http.get<IAdminDashboardStats>(this.resourceUrl, { observe: 'response' });
  }
}

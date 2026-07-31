import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PartnerDashboardStats,
  PartnerProfile,
  PartnerRegistration,
  ReferralConversionSummary,
} from '../../../models/partner.model';

@Injectable({ providedIn: 'root' })
export class PartnerDataService {
  private readonly base = `${environment.BaseApiUrl}api`;

  constructor(private readonly http: HttpClient) {}

  registerPartner(data: PartnerRegistration): Observable<HttpResponse<PartnerProfile>> {
    return this.http.post<PartnerProfile>(`${this.base}/partner-portal/register`, data, { observe: 'response' });
  }

  getProfile(): Observable<PartnerProfile> {
    return this.http.get<PartnerProfile>(`${this.base}/partner-portal/profile`);
  }

  updateProfile(data: Partial<PartnerProfile>): Observable<PartnerProfile> {
    return this.http.put<PartnerProfile>(`${this.base}/partner-portal/profile`, data);
  }

  getDashboardStats(): Observable<PartnerDashboardStats> {
    return this.http.get<PartnerDashboardStats>(`${this.base}/partner-portal/dashboard/stats`);
  }

  getConversions(page = 0, size = 20): Observable<HttpResponse<ReferralConversionSummary[]>> {
    return this.http.get<ReferralConversionSummary[]>(`${this.base}/partner-portal/conversions?page=${page}&size=${size}`, {
      observe: 'response',
    });
  }
}

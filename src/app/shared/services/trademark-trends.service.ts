import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from '../../core/config/application-config.service';

export interface IFilingVolumePoint {
  bucketDate: string;
  count: number;
}

export interface IFilingVolumeTrend {
  granularity: string;
  range: string;
  points: IFilingVolumePoint[];
  totalInRange: number;
}

export interface IClassBreakdown {
  tmClass: number | null;
  className: string | null;
  count: number;
  percentage: number;
}

export interface IStatusBreakdown {
  bucket: string;
  count: number;
  percentage: number;
}

export interface IJournalActivity {
  journalNo: number;
  count: number;
  publishedDate: string;
}

export interface ITrendsSummary {
  totalFilingsInRange: number;
  momChangePercent: number | null;
  topClass: number | null;
  topClassName: string | null;
  topStatusBucket: string | null;
  lastUpdated: string;
}

export interface INamedBreakdown {
  label: string;
  count: number;
  percentage: number;
}

export interface IClassTrendSeries {
  tmClass: number;
  className: string | null;
  points: IFilingVolumePoint[];
}

export interface ITrendsPage {
  summary: ITrendsSummary;
  filingVolume: IFilingVolumeTrend;
  classBreakdown: IClassBreakdown[];
  statusBreakdown: IStatusBreakdown[];
  journalActivity: IJournalActivity[];
  classTrends: IClassTrendSeries[];
  stateBreakdown: INamedBreakdown[];
  typeBreakdown: INamedBreakdown[];
  orgTypeBreakdown: INamedBreakdown[];
  filingModeBreakdown: INamedBreakdown[];
  usageBreakdown: INamedBreakdown[];
  topWords: INamedBreakdown[];
}

export interface IDimensionTrends {
  dimension: 'state' | 'class';
  value: string;
  displayName: string;
  totalFilings: number;
  filingVolume: IFilingVolumePoint[];
  breakdownLabel: string;
  breakdown: INamedBreakdown[];
}

export interface IMonthlyReport {
  year: number;
  month: number;
  monthLabel: string;
  totalFilings: number;
  momChangePercent: number | null;
  classBreakdown: INamedBreakdown[];
  stateBreakdown: INamedBreakdown[];
  typeBreakdown: INamedBreakdown[];
}

export interface IJournalDetail {
  journalNo: number;
  publishedDate: string | null;
  totalMarks: number;
  classBreakdown: INamedBreakdown[];
  stateBreakdown: INamedBreakdown[];
}

/**
 * Reads the public "Trademark Filing Trends" aggregate endpoint — national registry
 * data (scraped IP India filings), never this agency's own CRM-authored applications.
 * One call returns everything the page needs; the backend assembles it from its own
 * independently-cached pieces.
 */
@Injectable({ providedIn: 'root' })
export class TrademarkTrendsService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/trademarks/trends');

  getTrendsPage(range = '90d', granularity = 'day', topN = 10, journalLimit = 12): Observable<ITrendsPage> {
    return this.http.get<ITrendsPage>(this.resourceUrl, { params: { range, granularity, topN, journalLimit } });
  }

  getStateTrends(slug: string): Observable<IDimensionTrends> {
    return this.http.get<IDimensionTrends>(`${this.resourceUrl}/state/${slug}`);
  }

  getClassTrends(tmClass: number): Observable<IDimensionTrends> {
    return this.http.get<IDimensionTrends>(`${this.resourceUrl}/class/${tmClass}`);
  }

  getMonthlyReport(year: number, month: number): Observable<IMonthlyReport> {
    return this.http.get<IMonthlyReport>(`${this.resourceUrl}/monthly/${year}/${month}`);
  }

  getJournalDetail(journalNo: number): Observable<IJournalDetail> {
    // journal detail lives under /api/trademarks/journal/:no, a sibling of /trends
    return this.http.get<IJournalDetail>(`${this.applicationConfigService.getEndpointFor('api/trademarks/journal')}/${journalNo}`);
  }
}

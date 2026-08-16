import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import dayjs from 'dayjs/esm';

import { ApplicationConfigService } from '../../core/config/application-config.service';
import { INamedBreakdown } from './trademark-trends.service';
import { ITrademark } from '../../../models/trademark.model';

/**
 * Summary for one /trademarks-by/:slug page. The marks themselves come from a separate
 * paginated call — a large filer's portfolio runs to hundreds of rows.
 */
export interface IProprietorProfile {
  slug: string;
  /** The most frequently recorded spelling of the name, used as the page's H1. */
  displayName: string;
  /** Other spellings the registry holds for the same entity, shown as an "also recorded as" note. */
  nameVariants: string[];
  totalFilings: number;
  /** False for thin portfolios — the page then renders with noindex and stays out of the sitemap. */
  indexable: boolean;
  firstFilingDate: string | null;
  latestFilingDate: string | null;
  primaryState: string | null;
  primaryStateSlug: string | null;
  classBreakdown: INamedBreakdown[];
  statusBreakdown: INamedBreakdown[];
}

/** Reads the public per-proprietor portfolio endpoints (scraped registry corpus only). */
@Injectable({ providedIn: 'root' })
export class TrademarkProprietorService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/trademarks/proprietor');

  getProfile(slug: string): Observable<IProprietorProfile> {
    return this.http.get<IProprietorProfile>(`${this.resourceUrl}/${encodeURIComponent(slug)}`);
  }

  getMarks(slug: string, page: number, size: number): Observable<HttpResponse<ITrademark[]>> {
    return this.http
      .get<ITrademark[]>(`${this.resourceUrl}/${encodeURIComponent(slug)}/marks`, {
        params: { page, size },
        observe: 'response',
      })
      .pipe(
        // The endpoint returns application_date as a plain ISO date; the shared card markup
        // renders it through dayjs, same as the other trademark listings.
        map(res =>
          res.clone({
            body: (res.body ?? []).map(tm => ({
              ...tm,
              applicationDate: tm.applicationDate ? dayjs(tm.applicationDate) : tm.applicationDate,
            })),
          }),
        ),
      );
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, filter, map, tap } from 'rxjs';

import dayjs from 'dayjs/esm';

import { ApplicationConfigService } from '../../core/config/application-config.service';
import { createRequestOption } from '../../core/request/request-util';
import { DATE_FORMAT } from '../../config/input.constants';
import { ITrademark, ITrademarkWithLogo, NewTrademark } from '../../../models/trademark.model';
import { IDocuments } from '../../../models/documents.model';
import { DocumentsService, RestDocuments } from './documents.service';

export type PartialUpdateTrademark = Partial<ITrademark> & Pick<ITrademark, 'id'>;
export type PartialUpdateTrademarkWithLogo = {
  trademark: Partial<ITrademark> & Pick<ITrademark, 'id'>;
  document: Partial<IDocuments>;
  file?: string | null;
  trademarkSlogan?: string | null;

};

type RestOf<T extends ITrademark | NewTrademark | PartialUpdateTrademarkWithLogo> = Omit<T, 'applicationDate' | 'createdDate' | 'modifiedDate' | 'renewalDate'> & {
  applicationDate?: string | null;
  createdDate?: string | null;
  modifiedDate?: string | null;
  renewalDate?: string | null;
};

export type RestTrademark = RestOf<ITrademark>;
export type RestTrademarkWithLogo = {trademark: RestTrademark , document:  RestDocuments}


export type NewRestTrademark = RestOf<NewTrademark>;

export type PartialUpdateRestTrademark = RestOf<PartialUpdateTrademark>;

export type EntityResponseType = HttpResponse<ITrademark>;
export type EntityArrayResponseType = HttpResponse<ITrademark[]>;

export type LiveRefreshState = 'FRESH' | 'QUEUED' | 'BUSY' | 'NONE' | 'FETCHING' | 'COMPLETED' | 'NOT_FOUND' | 'FAILED';

/**
 * Where the shared scraping session is. Mirrors PriorityScrapeQueueService.ScrapeStage.
 * The registry forces a captcha + emailed OTP login before any lookup, which is most of the
 * wait, so the detail page reports the stage instead of an unqualified spinner.
 */
export type ScrapeStage =
  | 'IDLE'
  | 'STARTING'
  | 'OPENING_PORTAL'
  | 'SOLVING_CAPTCHA'
  | 'OTP_SENT'
  | 'OTP_RECEIVED'
  | 'SIGNED_IN'
  | 'SEARCHING'
  | 'READING_RECORD'
  | 'SAVING';

export interface ILiveRefreshStatus {
  state: LiveRefreshState;
  trademark?: RestTrademark | null;
  stage?: ScrapeStage | null;
  /** 0 when this application is being fetched now, 1-based while waiting, null otherwise. */
  queuePosition?: number | null;
}

@Injectable({ providedIn: 'root' })
export class TrademarkService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);
  protected readonly documentsService =  inject(DocumentsService)

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/trademarks');
  

  create(trademark: NewTrademark): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(trademark);
    return this.http
      .post<RestTrademark>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(trademark: ITrademark): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(trademark);
    return this.http
      .put<RestTrademark>(`${this.resourceUrl}/${this.getTrademarkIdentifier(trademark)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(trademark: PartialUpdateTrademark): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(trademark);
    return this.http
      .patch<RestTrademark>(`${this.resourceUrl}/${this.getTrademarkIdentifier(trademark)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestTrademark>(`${this.resourceUrl}/get/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  findWithLogo(id: number): Observable<HttpResponse<ITrademarkWithLogo>> {
    return this.http
      .get<RestTrademarkWithLogo>(`${this.resourceUrl}/logo/${id}`, { observe: 'response' })
      .pipe(
        map(res => this.convertResponseFromServerWithLogo(res))

        );


  }
  partialUpdateWithLogo(trademarkWithLogo: PartialUpdateTrademarkWithLogo): Observable<EntityResponseType> {
  return this.http
    .patch<RestTrademark>(`${this.resourceUrl}/onboarding/${this.getTrademarkIdentifier(trademarkWithLogo.trademark)}`, trademarkWithLogo, { observe: 'response' })
    .pipe(map(res => this.convertResponseFromServer(res)));
  }

  getOnboardingDocuments(trademarkId: number): Observable<HttpResponse<IDocuments[]>> {
    return this.http
      .get<RestDocuments[]>(`${this.resourceUrl}/onboarding/${trademarkId}/documents`, { observe: 'response' })
      .pipe(map(res => res.clone({
        body: res.body ? res.body.map(item => this.documentsService.convertDateFromServer(item)) : null,
      })));
  }

  uploadOnboardingDocument(trademarkId: number, document: Partial<IDocuments>): Observable<HttpResponse<IDocuments>> {
    return this.http
      .post<RestDocuments>(`${this.resourceUrl}/onboarding/${trademarkId}/documents`, document, { observe: 'response' })
      .pipe(map(res => res.clone({
        body: res.body ? this.documentsService.convertDateFromServer(res.body) : null,
      })));
  }

  deleteOnboardingDocument(trademarkId: number, documentId: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/onboarding/${trademarkId}/documents/${documentId}`, { observe: 'response' });
  }
  
  liveSearch(query:string, tmClass?: number | null): Observable<EntityArrayResponseType> {
    return this.http
      .get<RestTrademark[]>(`${this.resourceUrl}/live-search`, { observe: 'response',params: createRequestOption({ trademark: query, tmClass }) })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }
  deepSearch(query:string): Observable<EntityArrayResponseType> {
    return this.http
      .get<RestTrademark[]>(`${this.resourceUrl}/search`, { observe: 'response',params:{trademark:query} })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }
  quickSearch(query:string, tmClass?: number | null): Observable<EntityArrayResponseType> {
    return this.http
      .get<RestTrademark[]>(`${this.resourceUrl}/quick-search`, { observe: 'response',params: createRequestOption({ trademark: query, tmClass }) })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  searchByApplicationNumber(applicationNo:string): Observable<EntityArrayResponseType> {
    return this.http
      .get<RestTrademark[]>(`${this.resourceUrl}/search-by-application-number`, { observe: 'response',params:{applicationNo} })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  /** Paginated search by proprietor/company name (as stored on the trademark record). */
  searchByProprietorName(name: string, req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption({ ...req, name });
    return this.http
      .get<RestTrademark[]>(`${this.resourceUrl}/search-by-proprietor-name`, { observe: 'response', params: options })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  /** Type-ahead of distinct proprietor/company names for the company-name search page. */
  proprietorNameSuggestions(name: string, limit = 8): Observable<string[]> {
    return this.http.get<string[]>(`${this.resourceUrl}/proprietor-name-suggestions`, { params: { name, limit } });
  }
  
  /** Asks the backend to scrape this application from the govt registry ahead of the normal automation. */
  requestLiveRefresh(applicationNo: number): Observable<ILiveRefreshStatus> {
    return this.http.post<ILiveRefreshStatus>(`${this.resourceUrl}/refresh/${applicationNo}`, null);
  }

  getLiveRefreshStatus(applicationNo: number): Observable<ILiveRefreshStatus> {
    return this.http.get<ILiveRefreshStatus>(`${this.resourceUrl}/refresh/${applicationNo}/status`);
  }

  findBySlug(slug: string): Observable<EntityResponseType> {
    return this.http
      .get<RestTrademark>(`${this.resourceUrl}/slug/${slug}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  /** Trademarks published in a given journal (scoped to the scraped journal corpus, never customer-owned applications). */
  queryByJournal(journalNo: number, req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption({ ...req, 'journalNo.equals': journalNo, 'source.equals': 'JOURNAL_PUBLICATION' });
    return this.http
      .get<RestTrademark[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  getJournalSummaries(req?: any): Observable<HttpResponse<any[]>> {
    return this.http.get<any[]>(`${this.resourceUrl}/journals/summary`, { params: createRequestOption(req), observe: 'response' });
  }

  /** Latest scraped trademark applications (public corpus, no client-owned rows). */
  queryLatestApplications(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption({ ...req, 'source.equals': 'SCRAPPER' });
    return this.http
      .get<RestTrademark[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }


  getTrademarkIdentifier(trademark: Pick<ITrademark, 'id'>): number {
    return trademark.id;
  }

  compareTrademark(o1: Pick<ITrademark, 'id'> | null, o2: Pick<ITrademark, 'id'> | null): boolean {
    return o1 && o2 ? this.getTrademarkIdentifier(o1) === this.getTrademarkIdentifier(o2) : o1 === o2;
  }

  

  public convertDateFromClient<T extends ITrademark | NewTrademark | PartialUpdateTrademark>(trademark: T): RestOf<T> {
    return {
      ...trademark,
      applicationDate: trademark.applicationDate?.format(DATE_FORMAT) ?? null,
      createdDate: trademark.createdDate?.toJSON() ?? null,
      modifiedDate: trademark.modifiedDate?.toJSON() ?? null,
      renewalDate: trademark.renewalDate?.format(DATE_FORMAT) ?? null,
    };
  }
    public convertDateFromServer(restTrademark: RestTrademark): ITrademark {
    return {
      ...restTrademark,
      applicationDate: restTrademark.applicationDate ? dayjs(restTrademark.applicationDate) : undefined,
      createdDate: restTrademark.createdDate ? dayjs(restTrademark.createdDate) : undefined,
      modifiedDate: restTrademark.modifiedDate ? dayjs(restTrademark.modifiedDate) : undefined,
      renewalDate: restTrademark.renewalDate ? dayjs(restTrademark.renewalDate) : undefined,
    };
  }
  public convertDate(restTrademark: ITrademark): ITrademark {
    return {
      ...restTrademark,
      applicationDate: restTrademark.applicationDate ? dayjs(restTrademark.applicationDate) : undefined,
      createdDate: restTrademark.createdDate ? dayjs(restTrademark.createdDate) : undefined,
      modifiedDate: restTrademark.modifiedDate ? dayjs(restTrademark.modifiedDate) : undefined,
      renewalDate: restTrademark.renewalDate ? dayjs(restTrademark.renewalDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestTrademark>): HttpResponse<ITrademark> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestTrademark[]>): HttpResponse<ITrademark[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }

  protected convertResponseFromServerWithLogo(res: HttpResponse<RestTrademarkWithLogo>): HttpResponse<ITrademarkWithLogo> {
    return res.clone({
      body: res.body ? {
        trademark : res.body.trademark ?  this.convertDateFromServer(res.body.trademark) : null,
         document: res.body.document ?  this.documentsService.convertDateFromServer(res.body.document) : null
        } : null,
    });
  }
}

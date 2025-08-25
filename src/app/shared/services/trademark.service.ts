import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { ApplicationConfigService } from '../../core/config/application-config.service';
import { DATE_FORMAT } from '../../config/input.constants';
import { ITrademark, NewTrademark } from '../../../models/trademark.model';
import { IDocuments } from '../../../models/documents.model';

export type PartialUpdateTrademark = Partial<ITrademark> & Pick<ITrademark, 'id'>;
export type PartialUpdateTrademarkWithLogo = {
  trademark: Partial<ITrademark> & Pick<ITrademark, 'id'>;
  document: Partial<IDocuments>;
  file: string | null;
  trademarkSlogan: string | null;

};

type RestOf<T extends ITrademark | NewTrademark> = Omit<T, 'applicationDate' | 'createdDate' | 'modifiedDate' | 'renewalDate'> & {
  applicationDate?: string | null;
  createdDate?: string | null;
  modifiedDate?: string | null;
  renewalDate?: string | null;
};

export type RestTrademark = RestOf<ITrademark>;

export type NewRestTrademark = RestOf<NewTrademark>;

export type PartialUpdateRestTrademark = RestOf<PartialUpdateTrademark>;

export type EntityResponseType = HttpResponse<ITrademark>;
export type EntityArrayResponseType = HttpResponse<ITrademark[]>;

@Injectable({ providedIn: 'root' })
export class TrademarkService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

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
      .get<RestTrademark>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }
  partialUpdateWithLogo(trademarkWithLogo: PartialUpdateTrademarkWithLogo): Observable<EntityResponseType> {
  return this.http
    .patch<RestTrademark>(`${this.resourceUrl}/onboarding/${this.getTrademarkIdentifier(trademarkWithLogo.trademark)}`, trademarkWithLogo, { observe: 'response' })
    .pipe(map(res => this.convertResponseFromServer(res)));
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
}

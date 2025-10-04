import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';
import { ITrademarkPlan, NewTrademarkPlan } from '../../models/trademark-plan.model';
import { ApplicationConfigService } from '../core/config/application-config.service';
import { createRequestOption } from '../core/request/request-util';


export type PartialUpdateTrademarkPlan = Partial<ITrademarkPlan> & Pick<ITrademarkPlan, 'id'>;

type RestOf<T extends ITrademarkPlan | NewTrademarkPlan> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

export type RestTrademarkPlan = RestOf<ITrademarkPlan>;

export type NewRestTrademarkPlan = RestOf<NewTrademarkPlan>;

export type PartialUpdateRestTrademarkPlan = RestOf<PartialUpdateTrademarkPlan>;

export type EntityResponseType = HttpResponse<ITrademarkPlan>;
export type EntityArrayResponseType = HttpResponse<ITrademarkPlan[]>;

@Injectable({ providedIn: 'root' })
export class TrademarkPlanService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/trademark-plans');

  create(trademarkPlan: NewTrademarkPlan): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(trademarkPlan);
    return this.http
      .post<RestTrademarkPlan>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(trademarkPlan: ITrademarkPlan): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(trademarkPlan);
    return this.http
      .put<RestTrademarkPlan>(`${this.resourceUrl}/${this.getTrademarkPlanIdentifier(trademarkPlan)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(trademarkPlan: PartialUpdateTrademarkPlan): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(trademarkPlan);
    return this.http
      .patch<RestTrademarkPlan>(`${this.resourceUrl}/${this.getTrademarkPlanIdentifier(trademarkPlan)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestTrademarkPlan>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestTrademarkPlan[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getTrademarkPlanIdentifier(trademarkPlan: Pick<ITrademarkPlan, 'id'>): number {
    return trademarkPlan.id;
  }

  compareTrademarkPlan(o1: Pick<ITrademarkPlan, 'id'> | null, o2: Pick<ITrademarkPlan, 'id'> | null): boolean {
    return o1 && o2 ? this.getTrademarkPlanIdentifier(o1) === this.getTrademarkPlanIdentifier(o2) : o1 === o2;
  }

  addTrademarkPlanToCollectionIfMissing<Type extends Pick<ITrademarkPlan, 'id'>>(
    trademarkPlanCollection: Type[],
    ...trademarkPlansToCheck: (Type | null | undefined)[]
  ): Type[] {
    const trademarkPlans: Type[] = trademarkPlansToCheck.filter(x => x != null);
    if (trademarkPlans.length > 0) {
      const trademarkPlanCollectionIdentifiers = trademarkPlanCollection.map(trademarkPlanItem =>
        this.getTrademarkPlanIdentifier(trademarkPlanItem),
      );
      const trademarkPlansToAdd = trademarkPlans.filter(trademarkPlanItem => {
        const trademarkPlanIdentifier = this.getTrademarkPlanIdentifier(trademarkPlanItem);
        if (trademarkPlanCollectionIdentifiers.includes(trademarkPlanIdentifier)) {
          return false;
        }
        trademarkPlanCollectionIdentifiers.push(trademarkPlanIdentifier);
        return true;
      });
      return [...trademarkPlansToAdd, ...trademarkPlanCollection];
    }
    return trademarkPlanCollection;
  }

  protected convertDateFromClient<T extends ITrademarkPlan | NewTrademarkPlan | PartialUpdateTrademarkPlan>(trademarkPlan: T): RestOf<T> {
    return {
      ...trademarkPlan,
      createdDate: trademarkPlan.createdDate?.toJSON() ?? null,
      modifiedDate: trademarkPlan.modifiedDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restTrademarkPlan: RestTrademarkPlan): ITrademarkPlan {
    return {
      ...restTrademarkPlan,
      createdDate: restTrademarkPlan.createdDate ? dayjs(restTrademarkPlan.createdDate) : undefined,
      modifiedDate: restTrademarkPlan.modifiedDate ? dayjs(restTrademarkPlan.modifiedDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestTrademarkPlan>): HttpResponse<ITrademarkPlan> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestTrademarkPlan[]>): HttpResponse<ITrademarkPlan[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';
import { ILead, NewLead } from '../../../models/lead.model';
import { ApplicationConfigService } from '../../core/config/application-config.service';
import { createRequestOption } from '../../core/request/request-util';


export type PartialUpdateLead = Partial<ILead> & Pick<ILead, 'id'>;

type RestOf<T extends ILead | NewLead> = Omit<T, 'createdDate' | 'modifiedDate'> & {
  createdDate?: string | null;
  modifiedDate?: string | null;
};

export type RestLead = RestOf<ILead>;

export type NewRestLead = RestOf<NewLead>;

export type PartialUpdateRestLead = RestOf<PartialUpdateLead>;

export type EntityResponseType = HttpResponse<ILead>;
export type EntityArrayResponseType = HttpResponse<ILead[]>;

@Injectable({ providedIn: 'root' })
export class LeadService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/leads');
  protected resourceUrlExtended = this.applicationConfigService.getEndpointFor('api/extended/leads');

  create(lead: NewLead): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(lead);
    console.log(this.resourceUrlExtended);
    return this.http.post<RestLead>(this.resourceUrlExtended, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(lead: ILead): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(lead);
    return this.http
      .put<RestLead>(`${this.resourceUrl}/${this.getLeadIdentifier(lead)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(lead: PartialUpdateLead): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(lead);
    return this.http
      .patch<RestLead>(`${this.resourceUrlExtended}/${this.getLeadIdentifier(lead)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestLead>(`${this.resourceUrlExtended}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestLead[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getLeadIdentifier(lead: Pick<ILead, 'id'>): number {
    return lead.id;
  }

  compareLead(o1: Pick<ILead, 'id'> | null, o2: Pick<ILead, 'id'> | null): boolean {
    return o1 && o2 ? this.getLeadIdentifier(o1) === this.getLeadIdentifier(o2) : o1 === o2;
  }


  protected convertDateFromClient<T extends ILead | NewLead | PartialUpdateLead>(lead: T): RestOf<T> {
    return {
      ...lead,
      createdDate: lead.createdDate?.toJSON() ?? null,
      modifiedDate: lead.modifiedDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restLead: RestLead): ILead {
    return {
      ...restLead,
      createdDate: restLead.createdDate ? dayjs(restLead.createdDate) : undefined,
      modifiedDate: restLead.modifiedDate ? dayjs(restLead.modifiedDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestLead>): HttpResponse<ILead> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestLead[]>): HttpResponse<ILead[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}

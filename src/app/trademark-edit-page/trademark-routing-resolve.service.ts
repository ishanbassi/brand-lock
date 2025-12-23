import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { ITrademark, ITrademarkWithLogo } from '../../models/trademark.model';
import { TrademarkService } from '../shared/services/trademark.service';


const trademarkResolve = (route: ActivatedRouteSnapshot): Observable<null | ITrademarkWithLogo> => {
  const id = route.params['id'];
  if (id) {
    return inject(TrademarkService)
      .findWithLogo(id)
      .pipe(
        mergeMap((trademark: HttpResponse<ITrademarkWithLogo>) => {
          if (trademark.body) {
            return of(trademark.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
        catchError((err) => {
          console.log('Error fetching trademark', err);
          inject(Router).navigate(['404']);
          return EMPTY;
        })
      );
  }
  return of(null);
};

export default trademarkResolve;

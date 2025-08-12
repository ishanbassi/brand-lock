export interface RestResponse<T = any> {
    message: string;
    status: boolean;
    data: any;
  }
  
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { catchError, map, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
  })
  export class DataService {
    
  constructor(private http: HttpClient) {   
    }

    getRecords(path: string): Observable<any> {
        return this.http
          .get(environment.BaseApiUrl + path, { headers: environment.AppHeaders })
          .pipe(catchError(this.handleError));
      }
    
      saveRecord(path: string, resource: any): Observable<any> {
        return this.http
          .post(environment.BaseApiUrl + path, resource, { headers: environment.AppHeaders })
          .pipe(catchError(this.handleError));
      }
    
      updateRecord(path: string, resource: any): Observable<any> {
        return this.http
          .put(environment.BaseApiUrl + path, resource, { headers: environment.AppHeaders })
          .pipe(catchError(this.handleError));
      }
    
      partialUpdateRecord(path: string, resource: any): Observable<any> {
        return this.http
          .patch(environment.BaseApiUrl + path, resource, { headers: environment.AppHeaders })
          .pipe(catchError(this.handleError));
      }
    
      removeRecord(path: string): Observable<any> {
        return this.http
          .delete(environment.BaseApiUrl + path, { headers: environment.AppHeaders })
          .pipe(catchError(this.handleError));
      }
    
    
      protected handleError(error: HttpErrorResponse): Promise<any> {
        if (error.status === 404) {
          return Promise.reject({ "message": error.message });
        }
        return Promise.reject(error.error);
      }
    
      public catchRestResponseError<T>(rawResponse$: Observable<RestResponse<T>>): Observable<RestResponse<T>> {
        return rawResponse$.pipe(
          map((rawResponse: RestResponse) => {
            if (!rawResponse.status) {
              throw new Error(rawResponse.message);
            }
            return rawResponse;
          })
        )
      }
    
  }  
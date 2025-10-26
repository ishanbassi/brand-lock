export interface RestResponse<T = any> {
    message: string;
    status: boolean;
    data: any;
  }
  
import { HttpClient, HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { catchError, map, Observable } from "rxjs";
import { CreateOrder } from "../../../models/create-order-request.model";
import { CreateOrderResponse } from "../../../models/create-order-response.model";
import { TrademarkOrderSummary } from "../../../models/trademark-order-summary.model";
import { RazorPayOrderResponse, RazorPaySignatureVerificationDTO } from "../../../models/razorpay-order-response.model";
import { ILead } from "../../../models/lead.model";
import { Account } from "../../../models/account.model";
import { JwtToken } from "../../../models/jwt.token";
import { IUserProfile } from "../../../models/user-profile.model";
import { DashboardStats } from "../../../models/dashboard-stats.model";

@Injectable({
    providedIn: 'root'
  })
  export class DataService {
  
  
    
  constructor(private http: HttpClient) {   
    }

    getRecords(path: string): Observable<any> {
        return this.http
          .get(environment.BaseApiUrl + path, { headers: environment.AppHeaders , observe: 'response' })
          .pipe(catchError(this.handleError));
      }
    
      saveRecord(path: string, resource: any): Observable<any> {
        return this.http
          .post(environment.BaseApiUrl + path, resource, { headers: environment.AppHeaders, observe: 'response' })
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

      createOrder(data:CreateOrder):Observable<HttpResponse<CreateOrderResponse>> {
      return this.saveRecord('api/razor-pay/payments/create-order', data);
    }

    findByOrderId(orderId: string):Observable<HttpResponse<TrademarkOrderSummary>> {
      return this.getRecords(`api/razor-pay/payments/order-id/${orderId}`)      
      }

      verifySignature(response: RazorPaySignatureVerificationDTO) {
        return this.saveRecord('api/razor-pay/payments/verify-signature', response)

      }
    
    register(account: Account): Observable<HttpResponse<IUserProfile>> {
      return this.saveRecord('api/portal/register', account);  
    }

    login(data: any): Observable<HttpResponse<JwtToken>> {
      return this.saveRecord('api/authenticate', data);
    }

    getCurrentUser():Observable<HttpResponse<IUserProfile>>{
      return this.getRecords("api/current-user");
    }

    getDashboardStats():Observable<HttpResponse<DashboardStats>>{
      return this.getRecords("api/portal/dashboard/stats");
    }
    
  }  
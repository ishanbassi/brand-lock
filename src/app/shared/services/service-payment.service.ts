import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateOrderResponse } from '../../../models/create-order-response.model';
import { ServiceOrderRequest } from '../../../models/service-order.model';
import { RazorPaySignatureVerificationDTO } from '../../../models/razorpay-order-response.model';
import { PaymentConfirmationResponse } from '../../../models/payment-confirmation-response.model';

// NOTE: These endpoints must be implemented on the backend:
//   POST api/razor-pay/payments/create-service-order
//   POST api/razor-pay/payments/verify-service-signature

@Injectable({ providedIn: 'root' })
export class ServicePaymentService {

  private base = environment.BaseApiUrl;

  constructor(private http: HttpClient) {}

  createServiceOrder(request: ServiceOrderRequest): Observable<HttpResponse<CreateOrderResponse>> {
    return this.http.post<CreateOrderResponse>(
      `${this.base}api/razor-pay/payments/create-service-order`,
      request,
      { observe: 'response' }
    );
  }

  verifyServiceSignature(payload: RazorPaySignatureVerificationDTO & { serviceType: string }): Observable<PaymentConfirmationResponse> {
    return this.http.post<PaymentConfirmationResponse>(
      `${this.base}api/razor-pay/payments/verify-service-signature`,
      payload
    );
  }
}

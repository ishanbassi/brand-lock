import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { WindowRefService } from '../shared/services/window-ref.service';
import { ScriptLoaderService } from '../shared/services/script-loader.service';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { LoadingService } from '../common/loading.service';
import { ServicePaymentService } from '../shared/services/service-payment.service';
import { GoogleConversionTrackingService } from '../shared/services/google-conversion-tracking.service';
import { SERVICE_CONFIG, ServiceType } from '../../models/service-order.model';
import { CreateOrderResponse } from '../../models/create-order-response.model';
import { RazorPayOrderResponse } from '../../models/razorpay-order-response.model';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { AuthService } from '../../models/auth.services';

@Component({
  selector: 'app-service-checkout-page',
  imports: [CommonModule, DashboardHeaderComponent],
  templateUrl: './service-checkout-page.component.html',
  styleUrl: './service-checkout-page.component.scss'
})
export class ServiceCheckoutPageComponent implements OnInit {

  serviceType?: ServiceType;
  serviceConfig?: { name: string; price: number; description: string };
  leadId?: number;
  applicantName?: string;
  applicantEmail?: string;
  applicantPhone?: string;
  trademarkNumber?: string;

  createOrderResponse?: CreateOrderResponse;
  paymentSuccess = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly toastService: ToastrService,
    private readonly winRef: WindowRefService,
    private readonly scriptLoaderService: ScriptLoaderService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly loadingService: LoadingService,
    private readonly servicePaymentService: ServicePaymentService,
    private readonly googleConversionTrackingService: GoogleConversionTrackingService,
    private readonly localstorageService: LocalStorageService,
    private readonly authservice: AuthService
  ) {}

  ngOnInit() {
    this.scriptLoaderService.load('https://checkout.razorpay.com/v1/checkout.js');

    this.route.queryParams.subscribe(params => {
      this.serviceType = params['service'] as ServiceType;
      this.leadId = params['lead_id'] ? +params['lead_id'] : undefined;
      this.trademarkNumber = params['tm_number'];

      if (!this.serviceType || !SERVICE_CONFIG[this.serviceType]) {
        this.router.navigateByUrl('/');
        return;
      }

      this.serviceConfig = SERVICE_CONFIG[this.serviceType];

      const lead = this.sessionStorageService.getObject('lead');
      if (lead) {
        this.applicantName = lead.fullName;
        this.applicantEmail = lead.email;
        this.applicantPhone = lead.phoneNumber;
        this.leadId = this.leadId ?? lead.id;
      }
    });
  }

  initiatePayment() {
    if (!this.serviceType || !this.serviceConfig) return;

    this.loadingService.show();
    this.servicePaymentService.createServiceOrder({
      serviceType: this.serviceType,
      leadId: this.leadId,
      amount: this.serviceConfig.price,
      description: this.serviceConfig.name
    }).subscribe({
      next: (res) => {
        this.createOrderResponse = res.body!;
        this.loadingService.hide();
        this.openRazorpay(this.createOrderResponse);
      },
      error: () => {
        this.loadingService.hide();
        this.toastService.error('Failed to initiate payment. Please try again.');
      }
    });
  }

  private openRazorpay(orderResponse: CreateOrderResponse) {
    const options: any = {
      key: orderResponse.keyId,
      amount: orderResponse.amount,
      currency: orderResponse.currency,
      name: 'Trademarx',
      description: this.serviceConfig?.name,
      image: '/assets/images/trademarx.svg',
      order_id: orderResponse.orderId,
      prefill: {
        name: this.applicantName,
        email: this.applicantEmail,
        contact: this.applicantPhone
      },
      modal: { escape: false },
      theme: { color: '#001F4D' },
      config: {
        display: {
          blocks: {
            payLater: {
              name: 'Pay in installments',
              instruments: [
                { method: 'emi' },
                { method: 'paylater' }
              ]
            }
          },
          sequence: ['block.payLater', 'block.other'],
          preferences: { show_default_blocks: true }
        }
      }
    };

    options.handler = (response: RazorPayOrderResponse) => {
      // The lead is what the backend uses to create (or find) the buyer's account and
      // link this payment to it — without it the purchase never shows on any dashboard.
      const lead = this.sessionStorageService.getObject('lead');
      this.servicePaymentService.verifyServiceSignature({
        ...response,
        serviceType: this.serviceType!,
        leadDTO: lead ?? null
      }).subscribe({
        next: (confirmation) => {
          if (confirmation?.token?.id_token) {
            const idToken = confirmation.token.id_token;
            this.localstorageService.storeAuthenticationToken(idToken);
            // Same as guest trademark checkout: the portal guard reads authorities from
            // the 'user' storage entry, which nothing else on this path populates.
            const { id, authorities } = this.authservice.decodeToken(idToken);
            this.localstorageService.setObject('user', { id, authorities });
          }
          this.googleConversionTrackingService.reportPurchaseConversion(
            response.razorpay_payment_id,
            orderResponse.amount,
            'portal/dashboard'
          );
          this.paymentSuccess = true;
          this.sessionStorageService.remove('lead');
          this.toastService.success('Payment successful! Our team will contact you within 24 hours.');
        },
        error: () => {
          this.toastService.error('Payment verification failed. Please contact support.');
        }
      });
    };

    options.modal.ondismiss = () => {
      this.toastService.warning('Transaction was cancelled.');
    };

    const rzp = new this.winRef.nativeWindow.Razorpay(options);
    rzp.open();
  }

  goHome() {
    this.router.navigateByUrl('/');
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { WindowRefService } from '../shared/services/window-ref.service';
import { DataService } from '../shared/services/data.service';
import { CreateOrderResponse } from '../../models/create-order-response.model';
import { CreateOrder } from '../../models/create-order-request.model';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { ITrademark } from '../../models/trademark.model';
import { TrademarkService } from '../shared/services/trademark.service';
import { ILead } from '../../models/lead.model';
import { LeadFormService } from '../../models/lead-form.service';
import { TrademarkFormService } from '../shared/services/trademark-form.service';
import { ReactiveFormsModule } from '@angular/forms';
import { LeadService } from '../shared/services/lead.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../shared/services/payment.service';
import { TrademarkOrderSummary } from '../../models/trademark-order-summary.model';
import { LoadingService } from '../common/loading.service';
import { finalize } from 'rxjs';
import { SharedModule } from '../shared/shared.module';
import { environment } from '../../environments/environment';
import { TrademarkTypeValues } from '../enumerations/trademark-type.model';
import { RazorPayOrderResponse, RazorPaySignatureVerificationDTO } from '../../models/razorpay-order-response.model';
import { PaymentConfirmationResponse } from '../../models/payment-confirmation-response.model';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { ToastrService } from 'ngx-toastr';
import { IUserProfile } from '../../models/user-profile.model';
import { AuthService } from '../../models/auth.services';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { GoogleConversionTrackingService } from '../shared/services/google-conversion-tracking.service';
import { ScriptLoaderService } from '../shared/services/script-loader.service';

@Component({
  selector: 'app-checkout-page',
  imports: [ReactiveFormsModule, SharedModule, DashboardHeaderComponent],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.scss'
})
export class CheckoutPageComponent implements OnInit {

  lead?: ILead | null = null;
  userProfile?: IUserProfile | null;
  protected leadFormService = inject(LeadFormService);
  leadForm = this.leadFormService.createLeadFormGroup();

  trademark?: ITrademark | null;
  protected trademarkFormService = inject(TrademarkFormService);
  trademarkForm = this.trademarkFormService.createTrademarkFormGroup();
  orderId?: string;
  applicationId?: number;
  environment = environment;
  isAuthorizedUser: any;
  paymentSuccess = false;

  constructor(
    private readonly winRef: WindowRefService,
    private readonly dataService: DataService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly trademarkService: TrademarkService,
    private readonly leadService: LeadService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly paymentService: PaymentService,
    private readonly loadingService: LoadingService,
    private readonly toastService: ToastrService,
    private readonly localstorageService: LocalStorageService,
    private readonly authservice: AuthService,
    private readonly googleConversionTrackingService: GoogleConversionTrackingService,
    private readonly scriptLoaderService: ScriptLoaderService
  ) {}

  trademarkOrderSummary?: TrademarkOrderSummary | null;
  createOrderRequest?: CreateOrder;
  createOrderResponse?: CreateOrderResponse | null;

  ngOnInit() {
    this.scriptLoaderService.load('https://checkout.razorpay.com/v1/checkout.js');
    this.isAuthorizedUser = this.authservice.isAuthorizedUser(['ROLE_USER', 'ROLE_ADMIN']).hasRoleAccess;

    this.route.queryParams.subscribe(params => {
      this.orderId = params['order_id'];
      this.applicationId = params['application'];
      if (this.orderId) {
        this.dataService.findByOrderId(this.orderId)
          .subscribe({
            next: (res) => {
              this.trademarkOrderSummary = res.body;
              this.trademark = this.trademarkOrderSummary?.trademarkDTO;
              this.lead = this.trademarkOrderSummary?.leadDTO;
              this.userProfile = this.trademarkOrderSummary?.userProfileDTO;
              this.createOrderRequest = {
                trademarkDTO: this.trademark,
                paymentDTO: this.trademarkOrderSummary?.paymentDTO
              };
              this.leadFormService.addValidationsToFormAndValidate(this.leadForm);
            },
            error: (err) => {
              console.error(err);
            }
          });
        return;
      }
      this.router.navigateByUrl('portal/dashboard');
    });
  }

  createRzpayOrder() {
    if (!this.createOrderRequest) return;
    this.dataService.createOrder(this.createOrderRequest).subscribe({
      next: (res) => {
        this.createOrderResponse = res.body;
        this.payWithRazor(this.createOrderResponse!);
      }
    });
  }

  payWithRazor(orderResponse: CreateOrderResponse) {
    this.loadingService.show();
    const options: any = {
      key: orderResponse.keyId,
      amount: orderResponse.amount,
      currency: orderResponse.currency,
      name: 'Trademarx',
      description: this.trademarkOrderSummary?.trademarkDTO.trademarkPlan?.name,
      image: '/assets/images/trademarx.svg',
      order_id: orderResponse.orderId,
      modal: { escape: false },
      notes: {},
      theme: { color: '#0c238a' }
    };

    options.handler = ((response: RazorPayOrderResponse) => {
      options.response = response;
      const signatureVerificationDto: RazorPaySignatureVerificationDTO = response;
      signatureVerificationDto.leadDTO = this.trademarkOrderSummary?.leadDTO;
      signatureVerificationDto.userProfileDTO = this.userProfile;

      this.dataService.verifySignature(signatureVerificationDto)
        .pipe(finalize(() => this.loadingService.hide()))
        .subscribe({
          next: (paymentConfirmationResponse: PaymentConfirmationResponse) => {
            if (paymentConfirmationResponse?.token?.idToken) {
              this.localstorageService.storeAuthenticationToken(paymentConfirmationResponse.token.idToken);
              this.sessionStorageService.remove('trademark');
            }
            this.googleConversionTrackingService.reportPurchaseConversion(
              response.razorpay_payment_id,
              this.createOrderResponse?.amount,
              'portal/dashboard'
            );
            this.paymentSuccess = true;
            this.toastService.success('Payment successful! Your application will be filed within 24 hours.');
          },
          error: () => {
            this.toastService.error('Payment verification failed. Please contact support.');
          }
        });
    });

    options.modal.ondismiss = (() => {
      this.loadingService.hide();
      this.toastService.warning('Transaction was cancelled.');
    });

    const rzp = new this.winRef.nativeWindow.Razorpay(options);
    rzp.open();
  }

  getTrademarkType(type: string | null | undefined) {
    if (!type) return '';
    return TrademarkTypeValues.find(t => t.value === type)?.label || type;
  }

  goToDashboard() {
    this.router.navigateByUrl('portal/dashboard');
  }
}

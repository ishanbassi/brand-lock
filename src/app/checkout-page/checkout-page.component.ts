import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { WindowRefService } from '../shared/services/window-ref.service';
import { DataService } from '../shared/services/data.service';
import { CreateOrderResponse } from '../../models/create-order-response.model';
import { CreateOrder } from '../../models/create-order-request.model';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { ITrademark } from '../../models/trademark.model';
import { TrademarkService } from '../shared/services/trademark.service';
import { ILead } from '../../models/lead.model';
import { IDocuments } from '../../models/documents.model';
import { ITrademarkPlan } from '../../models/trademark-plan.model';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../shared/services/payment.service';
import { TrademarkPlanService } from '../shared/trademark-plan.service';
import { TrademarkOrderSummary } from '../../models/trademark-order-summary.model';
import { LoadingService } from '../common/loading.service';
import { finalize, switchMap } from 'rxjs';
import { SharedModule } from '../shared/shared.module';
import { environment } from '../../environments/environment';
import { TrademarkTypeValues } from '../enumerations/trademark-type.model';
import { OrganizationType, OrganizationTypeValues } from '../enumerations/organization-type.model';
import { DocumentType, DocumentTypeValues } from '../enumerations/document-type.model';
import { RazorPayOrderResponse, RazorPaySignatureVerificationDTO } from '../../models/razorpay-order-response.model';
import { PaymentConfirmationResponse } from '../../models/payment-confirmation-response.model';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { ToastrService } from 'ngx-toastr';
import { IUserProfile } from '../../models/user-profile.model';
import { AuthService } from '../../models/auth.services';
import { GoogleConversionTrackingService } from '../shared/services/google-conversion-tracking.service';
import { ScriptLoaderService } from '../shared/services/script-loader.service';
import { OnboardingStateService } from '../shared/services/onboarding-state.service';

const GOVT_FEE_STANDARD = 9000;
const GOVT_FEE_CONCESSION = 4500;

@Component({
  selector: 'app-checkout-page',
  imports: [SharedModule],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.scss'
})
export class CheckoutPageComponent implements OnInit {

  lead?: ILead | null = null;
  userProfile?: IUserProfile | null;
  trademark?: ITrademark | null;

  orderId?: string;
  applicationId?: number;
  environment = environment;
  isAuthorizedUser: any;

  plans: ITrademarkPlan[] = [];
  documents: IDocuments[] = [];
  isChangingPlan = false;
  isPaying = false;

  constructor(
    private readonly winRef: WindowRefService,
    private readonly dataService: DataService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly trademarkService: TrademarkService,
    private readonly trademarkPlanService: TrademarkPlanService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly paymentService: PaymentService,
    private readonly loadingService: LoadingService,
    private readonly toastService: ToastrService,
    private readonly localstorageService: LocalStorageService,
    private readonly authservice: AuthService,
    private readonly googleConversionTrackingService: GoogleConversionTrackingService,
    private readonly scriptLoaderService: ScriptLoaderService,
    private readonly onboardingStateService: OnboardingStateService
  ) {}

  trademarkOrderSummary?: TrademarkOrderSummary | null;
  createOrderRequest?: CreateOrder;
  createOrderResponse?: CreateOrderResponse | null;

  ngOnInit() {
    this.scriptLoaderService.load('https://checkout.razorpay.com/v1/checkout.js');
    this.isAuthorizedUser = this.authservice.isAuthorizedUser(['ROLE_USER', 'ROLE_ADMIN']).hasRoleAccess;

    this.trademarkPlanService.query().subscribe(res => {
      this.plans = res.body || [];
    });

    this.route.queryParams.subscribe(params => {
      this.orderId = params['order_id'];
      this.applicationId = params['application'];
      if (this.orderId) {
        this.loadOrderSummary(this.orderId);
        return;
      }
      this.router.navigateByUrl('portal/dashboard');
    });
  }

  private loadOrderSummary(orderId: string) {
    this.dataService.findByOrderId(orderId)
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
          if (this.trademark?.id) {
            this.trademarkService.getOnboardingDocuments(this.trademark.id).subscribe({
              next: (docsRes) => this.documents = docsRes.body ?? [],
              error: () => this.documents = []
            });
          }
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  // ── Display helpers ──────────────────────────────────────────────────────────

  get applicantName(): string {
    if (this.isAuthorizedUser && this.userProfile) {
      return `${this.userProfile.firstName ?? ''} ${this.userProfile.lastName ?? ''}`.trim();
    }
    return this.lead?.fullName ?? '—';
  }

  get applicantEmail(): string {
    return (this.isAuthorizedUser ? this.userProfile?.email : this.lead?.email) ?? '—';
  }

  get applicantPhone(): string {
    return (this.isAuthorizedUser ? this.userProfile?.phoneNumber : this.lead?.phoneNumber) ?? '—';
  }

  get tmClassLabel(): string {
    const classes = this.trademarkOrderSummary?.orderSummaries
      ?.map(item => item.tmClass)
      .filter(tmClass => tmClass != null);
    if (classes?.length) return classes.map(tmClass => `Class ${tmClass}`).join(', ');
    if (this.trademark?.tmClass) return `Class ${this.trademark.tmClass}`;
    return 'To be classified by our experts';
  }

  get organizationTypeLabel(): string | null {
    if (!this.trademark?.organizationType) return null;
    return OrganizationTypeValues.find(o => o.value === this.trademark?.organizationType)?.label
      ?? this.trademark.organizationType;
  }

  get kycDocuments(): IDocuments[] {
    return this.documents.filter(d => d.documentType !== DocumentType.LOGO);
  }

  documentLabel(doc: IDocuments): string {
    return DocumentTypeValues.find(d => d.value === doc.documentType)?.label ?? (doc.documentType || 'Document');
  }

  get hasMsmeCertificate(): boolean {
    return this.documents.some(d => d.documentType === DocumentType.MSME_CERTIFICATE);
  }

  get isIndividualApplicant(): boolean {
    const orgType = this.trademark?.organizationType;
    return !orgType || orgType === OrganizationType.SOLE_PROPRIETORSHIP || orgType === OrganizationType.OTHER;
  }

  /** Government fee payable at filing (informational — not collected today). */
  get govtFee(): number {
    if (this.isIndividualApplicant || this.hasMsmeCertificate) return GOVT_FEE_CONCESSION;
    return GOVT_FEE_STANDARD;
  }

  get govtFeeStandard(): number {
    return GOVT_FEE_STANDARD;
  }

  get govtFeeConcessionApplies(): boolean {
    return !this.isIndividualApplicant && this.hasMsmeCertificate;
  }

  get selectedPlanId(): number | null {
    return this.trademark?.trademarkPlan?.id ?? null;
  }

  getTrademarkType(type: string | null | undefined) {
    if (!type) return '';
    return TrademarkTypeValues.find(t => t.value === type)?.label || type;
  }

  // ── Plan switching ───────────────────────────────────────────────────────────

  changePlan(plan: ITrademarkPlan) {
    if (!this.trademark?.id || plan.id === this.selectedPlanId || this.isChangingPlan) return;
    this.isChangingPlan = true;
    this.loadingService.show();

    this.trademarkService.partialUpdate({
      id: this.trademark.id,
      trademarkPlan: { id: plan.id, name: plan.name }
    }).pipe(
      switchMap(() => this.paymentService.createPaymentFromTrademark(this.trademark!.id)),
      finalize(() => {
        this.isChangingPlan = false;
        this.loadingService.hide();
      })
    ).subscribe({
      next: (payment) => {
        this.sessionStorageService.set('payment_id', payment.body?.id);
        this.onboardingStateService.saveState({
          paymentId: payment.body?.id ?? null,
          orderId: payment.body?.orderId ?? null
        });
        // Refresh the URL so a reload lands on the new order.
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { order_id: payment.body?.orderId },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      },
      error: () => {
        this.toastService.error('Could not switch plan. Please try again.');
      }
    });
  }

  // ── Payment ──────────────────────────────────────────────────────────────────

  createRzpayOrder() {
    if (!this.createOrderRequest || this.isPaying) return;
    this.isPaying = true;
    this.dataService.createOrder(this.createOrderRequest).subscribe({
      next: (res) => {
        this.createOrderResponse = res.body;
        this.payWithRazor(this.createOrderResponse!);
      },
      error: () => {
        this.isPaying = false;
        this.toastService.error('Could not start the payment. Please try again.');
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
      theme: { color: '#0c238a' },
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

    options.handler = ((response: RazorPayOrderResponse) => {
      options.response = response;
      const signatureVerificationDto: RazorPaySignatureVerificationDTO = response;
      signatureVerificationDto.leadDTO = this.trademarkOrderSummary?.leadDTO;
      signatureVerificationDto.userProfileDTO = this.userProfile;

      this.dataService.verifySignature(signatureVerificationDto)
        .pipe(finalize(() => {
          this.loadingService.hide();
          this.isPaying = false;
        }))
        .subscribe({
          next: (res: HttpResponse<PaymentConfirmationResponse>) => {
            const paymentConfirmationResponse = res.body;
            if (paymentConfirmationResponse?.token?.id_token) {
              const idToken = paymentConfirmationResponse.token.id_token;
              this.localstorageService.storeAuthenticationToken(idToken);
              // Guest checkout creates the account inline, so the guard checked by
              // /portal/dashboard needs authorities decoded from the token here —
              // nothing else on this path ever populates the 'user' storage entry.
              const { id, authorities } = this.authservice.decodeToken(idToken);
              this.localstorageService.setObject('user', { id, authorities });
            }
            // Onboarding is complete — drop the saved progress.
            this.onboardingStateService.clear();
            // The tracking service navigates to the redirect URL once the
            // conversion event is reported (with a 2s fallback).
            this.googleConversionTrackingService.reportPurchaseConversion(
              response.razorpay_payment_id,
              this.createOrderResponse?.amount,
              `/trademark-registration/payment-success?order_id=${this.orderId}`
            );
          },
          error: () => {
            this.toastService.error('Payment verification failed. Please contact support.');
          }
        });
    });

    options.modal.ondismiss = (() => {
      this.loadingService.hide();
      this.isPaying = false;
      this.toastService.warning('Transaction was cancelled.');
    });

    const rzp = new this.winRef.nativeWindow.Razorpay(options);
    rzp.open();
  }
}

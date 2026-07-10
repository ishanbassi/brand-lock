import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize, switchMap } from 'rxjs';
import { ILead } from '../../models/lead.model';
import { ITrademark } from '../../models/trademark.model';
import { ITrademarkPlan } from '../../models/trademark-plan.model';
import { DocumentType } from '../enumerations/document-type.model';
import { OrganizationType } from '../enumerations/organization-type.model';
import { LoadingService } from '../common/loading.service';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { TrademarkService } from '../shared/services/trademark.service';
import { TrademarkPlanService } from '../shared/trademark-plan.service';
import { PaymentService } from '../shared/services/payment.service';
import { OnboardingStateService } from '../shared/services/onboarding-state.service';
import { SharedModule } from '../shared/shared.module';
import { DocumentSlot, DocumentSlotComponent } from '../shared/document-slot/document-slot.component';

interface BusinessTypeOption {
  value: OrganizationType;
  label: string;
  description: string;
}

@Component({
  selector: 'app-tm-business-details',
  standalone: true,
  imports: [SharedModule, DocumentSlotComponent],
  templateUrl: './tm-business-details.component.html',
  styleUrl: './tm-business-details.component.scss'
})
export class TmBusinessDetailsComponent implements OnInit {

  lead: ILead | null = null;
  trademark: ITrademark | null = null;
  plans: ITrademarkPlan[] = [];

  businessTypes: BusinessTypeOption[] = [
    {
      value: OrganizationType.SOLE_PROPRIETORSHIP,
      label: 'Sole Proprietor',
      description: 'You run the business as an individual'
    },
    {
      value: OrganizationType.PARTNERSHIP,
      label: 'Partnership',
      description: 'Partnership firm or LLP'
    },
    {
      value: OrganizationType.PRIVATE_COMPANY,
      label: 'Private Company',
      description: 'Pvt. Ltd. registered under Companies Act'
    },
  ];

  selectedBusinessType: OrganizationType | null = null;

  documentSlots: DocumentSlot[] = [
    {
      type: DocumentType.APPLICANT_IDENTITY,
      label: 'Aadhaar Card',
      hint: 'Identity proof of the applicant',
      uploading: false,
      document: null
    },
    {
      type: DocumentType.PAN_CARD,
      label: 'PAN Card',
      hint: 'Individual or business PAN',
      uploading: false,
      document: null
    },
    {
      type: DocumentType.ADDRESS_PROOF,
      label: 'GST Certificate',
      hint: 'Serves as business address proof',
      uploading: false,
      document: null
    },
  ];

  msmeSlot: DocumentSlot = {
    type: DocumentType.MSME_CERTIFICATE,
    label: 'MSME / Udyam Certificate',
    hint: 'Unlocks the 50% government fee concession',
    uploading: false,
    document: null
  };

  onClickValidation = false;
  isSubmitting = false;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly sessionStorageService = inject(SessionStorageService);
  private readonly trademarkService = inject(TrademarkService);
  private readonly trademarkPlanService = inject(TrademarkPlanService);
  private readonly paymentService = inject(PaymentService);
  private readonly onboardingStateService = inject(OnboardingStateService);
  private readonly loadingService = inject(LoadingService);
  private readonly toastService = inject(ToastrService);
  private readonly router = inject(Router);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.onboardingStateService.restoreSession();
    this.lead = this.sessionStorageService.getObject('lead');
    const trademarkInSession = this.sessionStorageService.getObject('trademark');

    // Fallback plan source: a resumed visitor may have a trademark without a
    // plan attached, and payment creation needs one.
    this.trademarkPlanService.query().subscribe(res => {
      this.plans = res.body || [];
    });

    if (!trademarkInSession?.id) {
      this.router.navigateByUrl('trademark-registration/brand-details');
      return;
    }

    this.trademarkService.find(trademarkInSession.id).subscribe({
      next: (res) => {
        this.trademark = res.body;
        if (this.trademark?.organizationType) {
          this.selectedBusinessType = this.trademark.organizationType as OrganizationType;
        }
      },
      error: () => {
        this.router.navigateByUrl('trademark-registration/brand-details');
      }
    });

    this.trademarkService.getOnboardingDocuments(trademarkInSession.id).subscribe(res => {
      const documents = res.body ?? [];
      for (const doc of documents) {
        const slot = this.allSlots.find(s => s.type === doc.documentType);
        if (slot && !slot.document) {
          slot.document = doc;
        }
      }
    });
  }

  get allSlots(): DocumentSlot[] {
    return [...this.documentSlots, this.msmeSlot];
  }

  get showMsmeSlot(): boolean {
    return !!this.selectedBusinessType && this.selectedBusinessType !== OrganizationType.SOLE_PROPRIETORSHIP;
  }

  get msmeUploaded(): boolean {
    return !!this.msmeSlot.document;
  }

  get uploadedCount(): number {
    const visible = this.showMsmeSlot ? this.allSlots : this.documentSlots;
    return visible.filter(s => !!s.document).length;
  }

  get visibleSlotCount(): number {
    return this.showMsmeSlot ? this.allSlots.length : this.documentSlots.length;
  }

  get businessTypeLabel(): string {
    return this.businessTypes.find(t => t.value === this.selectedBusinessType)?.label ?? '—';
  }

  selectBusinessType(type: OrganizationType) {
    this.selectedBusinessType = type;
  }

  onSlotUploaded(slot: DocumentSlot) {
    if (slot.type === DocumentType.MSME_CERTIFICATE) {
      this.onboardingStateService.saveState({ msmeUploaded: true });
    }
  }

  onSlotRemoved(slot: DocumentSlot) {
    if (slot.type === DocumentType.MSME_CERTIFICATE) {
      this.onboardingStateService.saveState({ msmeUploaded: false });
    }
  }

  back() {
    this.router.navigateByUrl('trademark-registration/brand-details');
  }

  submit() {
    this.onClickValidation = true;
    if (!this.selectedBusinessType) {
      this.toastService.warning('Please select your type of business to continue.');
      return;
    }
    if (!this.trademark?.id) {
      this.toastService.warning('Please wait while we load your application.');
      return;
    }

    this.isSubmitting = true;
    this.loadingService.show();

    const needsPlan = !this.trademark.trademarkPlan?.id && this.plans.length > 0;

    this.trademarkService.partialUpdate({
      id: this.trademark.id,
      organizationType: this.selectedBusinessType,
      ...(needsPlan ? { trademarkPlan: { id: this.plans[0].id, name: this.plans[0].name } } : {}),
    }).pipe(
      switchMap(() => this.paymentService.createPaymentFromTrademark(this.trademark!.id)),
      finalize(() => {
        this.isSubmitting = false;
        this.loadingService.hide();
      })
    ).subscribe({
      next: (payment) => {
        this.sessionStorageService.set('payment_id', payment.body?.id);
        this.onboardingStateService.saveState({
          step: 'checkout',
          lead: this.lead,
          trademarkId: this.trademark!.id,
          paymentId: payment.body?.id ?? null,
          orderId: payment.body?.orderId ?? null,
          organizationType: this.selectedBusinessType,
          msmeUploaded: this.msmeUploaded,
        });
        this.router.navigate(['trademark-registration/checkout'], {
          queryParams: { order_id: payment.body?.orderId }
        });
      },
      error: () => {
        this.toastService.error('Something went wrong. Please try again.');
      }
    });
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { PartialUpdateTrademarkWithLogo, TrademarkService } from '../shared/services/trademark.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../common/loading.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ITrademark } from '../../models/trademark.model';
import { TrademarkFormService, TrademarkWithLogoFormGroup } from '../shared/services/trademark-form.service';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { DocumentType } from '../enumerations/document-type.model';
import { DocumentSlot, DocumentSlotComponent } from '../shared/document-slot/document-slot.component';
import { TrademarkType } from '../enumerations/trademark-type.model';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { OrganizationTypeValues } from '../enumerations/organization-type.model';
import { TrademarkStatusPipe } from '../shared/pipe/trademark-status-translate.pipe';
import { PhoneInputComponent } from '../phone-input/phone-input.component';

@Component({
  selector: 'app-trademark-edit-page',
  imports: [ReactiveFormsModule, SharedModule, PhoneInputComponent, DocumentSlotComponent, TrademarkStatusPipe],
  templateUrl: './trademark-edit-page.component.html',
  styleUrl: './trademark-edit-page.component.scss'
})
export class TrademarkEditPageComponent implements OnInit {

  onClickValidation: boolean = false;
  organizationType: any = OrganizationTypeValues;
  isSubmitting: boolean = false;
  TrademarkTypeEnum  = TrademarkType;

  // ── Status / journey (mirrors the dashboard's featured-application dossier) ──
  activeStatuses = ['DRAFT', 'FILED', 'UNDER_EXAMINATION', 'PUBLISHED', 'UNKNOWN'];
  inProcessStatuses = ['OBJECTED', 'EXAMINATION_REPLY_FILED', 'ACCEPTED_AND_ADVERTISED', 'OPPOSED', 'HEARING'];
  failureStatuses = ['ABANDONED', 'WITHDRAWN', 'REJECTED', 'EXPIRED'];
  protectedStatuses = ['REGISTERED', 'RENEWED'];
  progressStages = ['Filed', 'Examination', 'Published', 'Registered'];

  constructor(
    private readonly trademarkService:TrademarkService,
    private readonly toastService:ToastrService,
    private readonly loadingService:LoadingService,
    private readonly route: ActivatedRoute,
    private readonly router:Router,
    private readonly sessionStorageService: SessionStorageService,
  ){}
  trademark: ITrademark | null = null;
  protected trademarkFormService = inject(TrademarkFormService);


  trademarkForm: TrademarkWithLogoFormGroup = this.trademarkFormService.createTrademarkFormGroupWithLogo();

  /** All application documents, including the logo — managed here as a single set of slots. */
  documentSlots: DocumentSlot[] = [
    { type: DocumentType.LOGO, label: 'Logo', hint: 'Your brand mark or logo image', uploading: false, document: null },
    { type: DocumentType.APPLICANT_IDENTITY, label: 'Aadhaar Card', hint: 'Identity proof of the applicant', uploading: false, document: null },
    { type: DocumentType.PAN_CARD, label: 'PAN Card', hint: 'Individual or business PAN', uploading: false, document: null },
    { type: DocumentType.ADDRESS_PROOF, label: 'GST Certificate', hint: 'Serves as business address proof', uploading: false, document: null },
    { type: DocumentType.SIGNED_POA, label: 'Signed Power of Attorney', hint: 'Authorises us to file on your behalf', uploading: false, document: null },
    { type: DocumentType.MSME_CERTIFICATE, label: 'MSME / Udyam Certificate', hint: 'Unlocks the 50% government fee concession', uploading: false, document: null },
  ];


    ngOnInit(): void {
    this.route.data.subscribe(({ trademarkWithLogo }) => {
      this.trademark = trademarkWithLogo.trademark;
      if (trademarkWithLogo.trademark) {
        this.updateForm(trademarkWithLogo.trademark);
        this.loadSupportingDocuments();
      }
    });
    this.addValidationsToFormAndValidate(this.trademarkForm);
  }

  private loadSupportingDocuments(): void {
    if (!this.trademark?.id) return;
    this.trademarkService.getOnboardingDocuments(this.trademark.id).subscribe(res => {
      const documents = res.body ?? [];
      for (const slot of this.documentSlots) {
        slot.document = documents.find(d => d.documentType === slot.type) ?? null;
      }
    });
  }

  protected updateForm(trademark:ITrademark): void {
    this.trademark = trademark;
    this.trademarkFormService.resetForm(this.trademarkForm.get('trademark') as FormGroup, trademark);
  }

  // ── Status styling / journey (mirrors dashboard.component.ts) ──────────
  statusClass(status: string | null | undefined): string {
    if (this.protectedStatuses.includes(status!)) return 'registered';
    if (this.inProcessStatuses.includes(status!)) return 'in-process';
    if (this.failureStatuses.includes(status!)) return 'failure';
    if (this.activeStatuses.includes(status!)) return 'active';
    return 'failure';
  }

  get isRegistered(): boolean {
    return this.protectedStatuses.includes(this.trademark?.trademarkStatus ?? '');
  }

  /** Index within progressStages the current status maps to (-1 = off-track). */
  get stageIndex(): number {
    switch (this.trademark?.trademarkStatus) {
      case 'DRAFT':
      case 'FILED':
        return 0;
      case 'UNDER_EXAMINATION':
      case 'OBJECTED':
      case 'EXAMINATION_REPLY_FILED':
        return 1;
      case 'PUBLISHED':
      case 'ACCEPTED_AND_ADVERTISED':
      case 'OPPOSED':
      case 'HEARING':
        return 2;
      case 'REGISTERED':
      case 'RENEWED':
        return 3;
      default:
        return -1;
    }
  }

  get stageNote(): string {
    switch (this.trademark?.trademarkStatus) {
      case 'DRAFT':
        return 'Payment received — our attorneys are preparing your filing. It reaches the Registry within 24 hours.';
      case 'FILED':
        return 'Filed with the Registry and waiting in the examination queue.';
      case 'UNDER_EXAMINATION':
        return 'The Registry is examining your application.';
      case 'OBJECTED':
        return 'The Registry raised an objection — our team is drafting the reply.';
      case 'EXAMINATION_REPLY_FILED':
        return 'Our reply to the examination report has been filed.';
      case 'ACCEPTED_AND_ADVERTISED':
      case 'PUBLISHED':
        return 'Accepted and published in the Trademark Journal — the 4-month opposition window has begun.';
      case 'OPPOSED':
        return 'An opposition was filed — our team is handling the proceedings.';
      case 'HEARING':
        return 'A hearing is scheduled with the Registry.';
      case 'REGISTERED':
        return 'Registered and protected for 10 years. You can now use the ® symbol.';
      case 'RENEWED':
        return 'Renewed — your protection continues for another 10 years.';
      default:
        return 'We are reviewing this application. Your attorney will reach out with the next step.';
    }
  }

  submit() {
      this.onClickValidation = true;
      this.isSubmitting = true;
      this.trademarkForm.markAllAsTouched();
      if (this.trademarkForm.invalid) {
        return;
      }
      const trademark  =this.trademarkFormService.getTrademark(this.trademarkForm.get('trademark') as FormGroup) as ITrademark;

      const phoneNumber:any = this.trademarkForm.get('trademark')?.get('phoneNumber')?.value || null;
      if(phoneNumber){
        trademark.phoneNumber = phoneNumber.number;
      }
      // Logo (and every other document) is uploaded independently via the Supporting
      // Documents slots above, not through this form — so no document/file is sent here.
      const trademarkDataWithLogo:PartialUpdateTrademarkWithLogo = {
        trademark,
        document: {},
        file: null,
        trademarkSlogan:this.trademarkForm.get('trademarkSlogan')?.value || null

      }
      this.loadingService.show();


      this.trademarkService.partialUpdateWithLogo(trademarkDataWithLogo)
      .subscribe({
        next: (trademark) => {
          this.isSubmitting = false;
          this.loadingService.hide();
          this.toastService.success('Trademark updated successfully');
        },
        error: () => {
          this.isSubmitting = false;
          this.loadingService.hide();
        }
      })




    }

addValidationsToFormAndValidate(form: FormGroup<any>) {
        form.get('trademark')?.get('phoneNumber')?.setValidators([Validators.required]);
        form.get('trademark')?.get('phoneNumber')?.updateValueAndValidity();



      }

}

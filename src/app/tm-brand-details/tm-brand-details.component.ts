import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, OnInit, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize, switchMap } from 'rxjs';
import { ILead } from '../../models/lead.model';
import { IDocuments } from '../../models/documents.model';
import { ITrademark, NewTrademark } from '../../models/trademark.model';
import { ITrademarkPlan } from '../../models/trademark-plan.model';
import { IPayment } from '../../models/payment.model';
import { DocumentType } from '../enumerations/document-type.model';
import { TrademarkType } from '../enumerations/trademark-type.model';
import { LoadingService } from '../common/loading.service';
import { AuthService } from '../../models/auth.services';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { TrademarkService, PartialUpdateTrademarkWithLogo } from '../shared/services/trademark.service';
import { PaymentService } from '../shared/services/payment.service';
import { TrademarkPlanService } from '../shared/trademark-plan.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-tm-brand-details',
  standalone: true,
  imports: [ReactiveFormsModule, SharedModule],
  templateUrl: './tm-brand-details.component.html',
  styleUrl: './tm-brand-details.component.scss'
})
export class TmBrandDetailsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  lead: ILead | null = null;
  trademark: ITrademark | null = null;
  document: IDocuments | null = null;
  existingPayment: IPayment | null = null;
  plans: ITrademarkPlan[] = [];
  selectedPlan: ITrademarkPlan | null = null;

  onClickValidation = false;
  isSubmitting = false;
  isInitializing = false;
  isDragOver = false;

  uploadedFileBase64: string | null = null;
  uploadedFileContentType: string | null = null;
  uploadedFileName: string | null = null;

  brandForm = new FormGroup({
    brandName: new FormControl('', [Validators.required, Validators.minLength(1)])
  });

  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService);
  private readonly sessionStorageService = inject(SessionStorageService);
  private readonly trademarkService = inject(TrademarkService);
  private readonly paymentService = inject(PaymentService);
  private readonly trademarkPlanService = inject(TrademarkPlanService);
  private readonly loadingService = inject(LoadingService);
  private readonly toastService = inject(ToastrService);
  private readonly router = inject(Router);

  ngOnInit() {
    // Skip entirely on the server — session storage is unavailable there and
    // would cause a spurious redirect to "/" that the browser then has to undo.
    if (!isPlatformBrowser(this.platformId)) return;

    this.lead = this.sessionStorageService.getObject('lead');
    const isAuthorized = this.authService.isAuthorizedUser(['ROLE_USER', 'ROLE_ADMIN']).hasRoleAccess;

    if (!this.lead && !isAuthorized) {
      this.router.navigateByUrl('/');
      return;
    }

    this.trademarkPlanService.query().subscribe(res => {
      this.plans = res.body || [];
      if (this.plans.length > 0 && !this.selectedPlan) {
        this.selectedPlan = this.plans[0];
      }
    });

    const paymentId = this.sessionStorageService.get('payment_id');
    if (paymentId) {
      this.paymentService.find(+paymentId).subscribe(res => {
        this.existingPayment = res.body;
      });
    }

    const trademarkInSession = this.sessionStorageService.getObject('trademark');
    if (trademarkInSession?.id) {
      // Keep the button disabled until the trademark is fully loaded so submit()
      // never runs with a null trademark reference.
      this.isInitializing = true;
      this.trademarkService.findWithLogo(trademarkInSession.id).subscribe({
        next: (res) => {
          this.trademark = res.body?.trademark || null;
          this.document = res.body?.document || null;
          if (this.trademark?.name) {
            this.brandForm.patchValue({ brandName: this.trademark.name });
          }
          if (this.trademark?.trademarkPlan?.id && this.plans.length > 0) {
            const matched = this.plans.find(p => p.id === this.trademark?.trademarkPlan?.id);
            if (matched) this.selectedPlan = matched;
          }
          this.isInitializing = false;
        },
        error: () => {
          this.isInitializing = false;
        }
      });
    } else {
      this.createDefaultTrademark();
    }
  }

  private createDefaultTrademark() {
    if (!this.lead?.id) return;
    this.isInitializing = true;
    this.loadingService.show();

    const newTm: NewTrademark = {
      id: null,
      type: TrademarkType.TRADEMARK as keyof typeof TrademarkType,
      lead: { id: this.lead.id },
    };

    this.trademarkService.create(newTm).subscribe({
      next: (res) => {
        this.trademark = res.body;
        this.sessionStorageService.setObject('trademark', res.body);
        this.isInitializing = false;
        this.loadingService.hide();
      },
      error: () => {
        this.isInitializing = false;
        this.loadingService.hide();
        this.toastService.error('Failed to initialize your application. Please try again.');
      }
    });
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave() {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.processFile(file);
  }

  private processFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      this.toastService.error('File size must be under 5MB');
      return;
    }
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      this.toastService.error('Only PNG, JPG, and SVG files are accepted');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const commaIndex = result.indexOf(',');
      this.uploadedFileBase64 = result.substring(commaIndex + 1);
      this.uploadedFileContentType = file.type;
      this.uploadedFileName = file.name;
      this.document = null;
    };
    reader.readAsDataURL(file);
  }

  clearLogo() {
    this.uploadedFileBase64 = null;
    this.uploadedFileContentType = null;
    this.uploadedFileName = null;
    this.document = null;
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  selectPlan(plan: ITrademarkPlan) {
    this.selectedPlan = plan;
  }

  get logoPreviewSrc(): string | null {
    if (this.uploadedFileBase64 && this.uploadedFileContentType) {
      return `data:${this.uploadedFileContentType};base64,${this.uploadedFileBase64}`;
    }
    return null;
  }

  get hasNewLogo(): boolean {
    return !!this.uploadedFileBase64;
  }

  get hasPreviousLogo(): boolean {
    return !!this.document?.fileUrl && !this.uploadedFileBase64;
  }

  get logoDisplayName(): string {
    return this.uploadedFileName || this.document?.fileName || 'Logo uploaded';
  }

  submit() {
    this.onClickValidation = true;
    this.brandForm.markAllAsTouched();

    if (this.brandForm.invalid) return;
    if (!this.trademark?.id) {
      this.toastService.warning('Please wait while we set up your application.');
      return;
    }
    if (!this.selectedPlan) {
      this.toastService.error('Please select a plan to continue.');
      return;
    }

    this.isSubmitting = true;
    this.loadingService.show();

    const type: keyof typeof TrademarkType = this.uploadedFileBase64
      ? TrademarkType.TRADEMARK_WITH_IMAGE as keyof typeof TrademarkType
      : TrademarkType.TRADEMARK as keyof typeof TrademarkType;

    const trademarkUpdate: Partial<ITrademark> & Pick<ITrademark, 'id'> = {
      id: this.trademark.id,
      name: this.brandForm.get('brandName')!.value!,
      type,
      trademarkPlan: { id: this.selectedPlan.id, name: this.selectedPlan.name },
      ...(this.lead?.id ? { lead: { id: this.lead.id } } : {}),
    };

    const documentUpdate: Partial<IDocuments> = {
      ...(this.document?.id ? { id: this.document.id } : {}),
      documentType: DocumentType.LOGO as keyof typeof DocumentType,
      fileName: this.uploadedFileName ?? this.document?.fileName,
      fileContentType: this.uploadedFileContentType ?? this.document?.fileContentType,
      trademark: { id: this.trademark.id },
    };

    const payload: PartialUpdateTrademarkWithLogo = {
      trademark: trademarkUpdate,
      document: documentUpdate,
      file: this.uploadedFileBase64,
      trademarkSlogan: null,
    };

    this.trademarkService.partialUpdateWithLogo(payload).pipe(
      switchMap((tm) => {
        if (this.existingPayment?.id) {
          this.existingPayment.amount = this.selectedPlan!.fees;
          return this.paymentService.update(this.existingPayment);
        }
        return this.paymentService.createPaymentFromTrademark(tm.body!.id);
      }),
      finalize(() => {
        this.isSubmitting = false;
        this.loadingService.hide();
      })
    ).subscribe({
      next: (payment) => {
        this.sessionStorageService.set('payment_id', payment.body?.id);
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

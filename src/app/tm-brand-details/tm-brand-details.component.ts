import { isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, OnInit, PLATFORM_ID, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, debounceTime, distinctUntilChanged, filter, finalize, of, switchMap, tap } from 'rxjs';
import { ILead } from '../../models/lead.model';
import { IDocuments } from '../../models/documents.model';
import { ITrademark, NewTrademark } from '../../models/trademark.model';
import { ITrademarkClass } from '../../models/trademark-class.model';
import { ITrademarkPlan } from '../../models/trademark-plan.model';
import { DocumentType } from '../enumerations/document-type.model';
import { TrademarkType } from '../enumerations/trademark-type.model';
import { LoadingService } from '../common/loading.service';
import { AuthService } from '../../models/auth.services';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { TrademarkService, PartialUpdateTrademarkWithLogo } from '../shared/services/trademark.service';
import { DataService } from '../shared/services/data.service';
import { TrademarkClassService } from '../shared/services/trademark-class.service';
import { TrademarkPlanService } from '../shared/trademark-plan.service';
import { OnboardingStateService } from '../shared/services/onboarding-state.service';
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
  plans: ITrademarkPlan[] = [];

  onClickValidation = false;
  isSubmitting = false;
  isInitializing = false;
  isDragOver = false;

  uploadedFileBase64: string | null = null;
  uploadedFileContentType: string | null = null;
  uploadedFileName: string | null = null;

  // Business-scope → class suggestion
  classSearching = false;
  classSuggestions: ITrademarkClass[] = [];
  selectedClass: ITrademarkClass | null = null;
  showSuggestions = false;

  brandForm = new FormGroup({
    brandName: new FormControl('', [Validators.required, Validators.minLength(1)]),
    businessScope: new FormControl('')
  });

  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService);
  private readonly sessionStorageService = inject(SessionStorageService);
  private readonly trademarkService = inject(TrademarkService);
  private readonly dataService = inject(DataService);
  private readonly trademarkClassService = inject(TrademarkClassService);
  private readonly trademarkPlanService = inject(TrademarkPlanService);
  private readonly onboardingStateService = inject(OnboardingStateService);
  private readonly loadingService = inject(LoadingService);
  private readonly toastService = inject(ToastrService);
  private readonly router = inject(Router);

  ngOnInit() {
    // Skip entirely on the server — session storage is unavailable there and
    // would cause a spurious redirect to "/" that the browser then has to undo.
    if (!isPlatformBrowser(this.platformId)) return;

    this.onboardingStateService.restoreSession();
    this.lead = this.sessionStorageService.getObject('lead');
    const isAuthorized = this.authService.isAuthorizedUser(['ROLE_USER', 'ROLE_ADMIN']).hasRoleAccess;

    if (!this.lead && !isAuthorized) {
      this.router.navigateByUrl('/');
      return;
    }

    // Plans are not shown on this step, but the application needs a default
    // plan attached so the payment can be created later in the flow.
    this.trademarkPlanService.query().subscribe(res => {
      this.plans = res.body || [];
    });

    this.setupClassSuggestions();

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
          this.restoreSelectedClass();
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

  private setupClassSuggestions() {
    this.brandForm.get('businessScope')!.valueChanges.pipe(
      tap(term => {
        if (!term || term.trim().length < 3) {
          this.classSuggestions = [];
          this.showSuggestions = false;
        }
      }),
      filter((term): term is string => !!term && term.trim().length >= 3),
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.classSearching = true),
      switchMap(term =>
        this.trademarkClassService.search(term.trim(), 8).pipe(
          catchError(() => of(null))
        )
      )
    ).subscribe(res => {
      this.classSearching = false;
      this.classSuggestions = res?.body ?? [];
      this.showSuggestions = this.classSuggestions.length > 0;
    });
  }

  private restoreSelectedClass() {
    const classRef = this.trademark?.trademarkClasses?.[0];
    if (!classRef?.id) return;
    this.trademarkClassService.find(classRef.id).subscribe(res => {
      if (res.body) {
        this.selectedClass = res.body;
      }
    });
  }

  /** Strip the trailing "*" WIPO base-term marker for display (e.g. "clothing*" → "clothing"). */
  displayKeyword(keyword?: string | null): string {
    return (keyword ?? '').replace(/\*+$/, '').trim();
  }

  selectClassSuggestion(suggestion: ITrademarkClass) {
    this.selectedClass = suggestion;
    this.classSuggestions = [];
    this.showSuggestions = false;
    this.brandForm.patchValue({ businessScope: '' });
  }

  clearSelectedClass() {
    this.selectedClass = null;
  }

  hideSuggestionsSoon() {
    // Delay so a click on a suggestion registers before the list hides.
    setTimeout(() => this.showSuggestions = false, 180);
  }

  private createDefaultTrademark() {
    const isAuthorized = this.authService.isAuthorizedUser(['ROLE_USER', 'ROLE_ADMIN']).hasRoleAccess;
    if (!this.lead?.id && !isAuthorized) return;

    this.isInitializing = true;
    this.loadingService.show();

    // Anonymous onboarding attaches the application to its lead. An authenticated
    // user starting a filing from the dashboard has no lead, so we attach it to
    // their profile instead — the backend then fills in the applicant details
    // (name, email, phone) and the application shows up on their dashboard.
    if (this.lead?.id) {
      this.persistNewTrademark({ lead: { id: this.lead.id } });
      return;
    }

    this.dataService.getCurrentUser().subscribe({
      next: (res) => {
        const profileId = res.body?.id;
        if (!profileId) {
          this.failInitialization();
          return;
        }
        this.persistNewTrademark({ user: { id: profileId } });
      },
      error: () => this.failInitialization()
    });
  }

  private persistNewTrademark(owner: Pick<NewTrademark, 'lead' | 'user'>) {
    const newTm: NewTrademark = {
      id: null,
      type: TrademarkType.TRADEMARK as keyof typeof TrademarkType,
      ...owner,
    };

    this.trademarkService.create(newTm).subscribe({
      next: (res) => {
        this.trademark = res.body;
        this.sessionStorageService.setObject('trademark', res.body);
        this.onboardingStateService.saveState({
          step: 'brand-details',
          lead: this.lead,
          trademarkId: res.body?.id ?? null
        });
        this.isInitializing = false;
        this.loadingService.hide();
      },
      error: () => this.failInitialization()
    });
  }

  private failInitialization() {
    this.isInitializing = false;
    this.loadingService.hide();
    this.toastService.error('Failed to initialize your application. Please try again.');
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

    if (this.brandForm.get('brandName')?.invalid) return;
    if (!this.trademark?.id) {
      this.toastService.warning('Please wait while we set up your application.');
      return;
    }

    this.isSubmitting = true;
    this.loadingService.show();

    const type: keyof typeof TrademarkType = this.uploadedFileBase64
      ? TrademarkType.TRADEMARK_WITH_IMAGE as keyof typeof TrademarkType
      : TrademarkType.TRADEMARK as keyof typeof TrademarkType;

    // Attach the default plan silently — fees are reviewed on the checkout step.
    const plan = this.trademark.trademarkPlan?.id
      ? this.trademark.trademarkPlan
      : (this.plans.length > 0 ? { id: this.plans[0].id, name: this.plans[0].name } : null);

    const trademarkUpdate: Partial<ITrademark> & Pick<ITrademark, 'id'> = {
      id: this.trademark.id,
      name: this.brandForm.get('brandName')!.value!,
      type,
      ...(plan ? { trademarkPlan: plan } : {}),
      ...(this.selectedClass ? { trademarkClasses: [{ id: this.selectedClass.id }], tmClass: this.selectedClass.tmClass } : {}),
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
      finalize(() => {
        this.isSubmitting = false;
        this.loadingService.hide();
      })
    ).subscribe({
      next: () => {
        this.onboardingStateService.saveState({
          step: 'business-details',
          lead: this.lead,
          trademarkId: this.trademark!.id,
          brandName: this.brandForm.get('brandName')!.value
        });
        this.router.navigateByUrl('trademark-registration/business-details');
      },
      error: () => {
        this.toastService.error('Something went wrong. Please try again.');
      }
    });
  }
}

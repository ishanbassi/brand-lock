import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { LeadFormService } from '../../models/lead-form.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../common/loading.service';
import { LeadService } from '../shared/services/lead.service';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { GoogleConversionTrackingService } from '../shared/services/google-conversion-tracking.service';
import { NewLead } from '../../models/lead.model';
import { finalize, Subject } from 'rxjs';
import { PhoneInputComponent } from '../phone-input/phone-input.component';
import { ServiceType } from '../../models/service-order.model';
import { OnboardingStateService } from '../shared/services/onboarding-state.service';

@Component({
  selector: 'app-lead-form',
  imports: [ReactiveFormsModule, SharedModule, PhoneInputComponent],
  templateUrl: './lead-form.component.html',
  styleUrl: './lead-form.component.scss'
})
export class LeadFormComponent implements OnInit {

  onClickValidation: boolean = false;
  isSubmitting: boolean = false;
  isNavSubmitting: boolean = false;
  @Input() heading: string = 'Apply Now';
  @Input() cta: string = 'Apply Now';
  @Input() comments = '';
  @Input() showTextArea = false;
  @Input() planTypeSubject?: Subject<any>;
  /** When set, successful submission redirects to /service-checkout?service=<serviceType> */
  @Input() serviceType?: ServiceType;
  @ViewChild('ctaFormElement') ctaFormElement!: ElementRef;

  constructor(
    private readonly leadFormService: LeadFormService,
    private readonly toastService: ToastrService,
    private readonly loadingService: LoadingService,
    private readonly leadService: LeadService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly googleConversionTrackingService: GoogleConversionTrackingService,
    private readonly onboardingStateService: OnboardingStateService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.planTypeSubject?.subscribe(planType => {
      this.ctaForm.get('selectedPackage')?.setValue(planType);
      this.focusOnCtaForm();
    });
  }

  ctaForm = new FormGroup({
    fullName: new FormControl(''),
    city: new FormControl(''),
    email: new FormControl(''),
    phoneNumber: new FormControl(''),
    selectedPackage: new FormControl(),
    comments: new FormControl()
  });

  submit() {
    this.onClickValidation = true;
    this.isSubmitting = true;
    this.saveLead(this.ctaForm);
  }

  saveLead(form: FormGroup) {
    this.addValidationsToFormAndValidate(form);
    if (!form.valid) {
      this.isSubmitting = false;
      this.isNavSubmitting = false;
      return;
    }

    if (!this.showTextArea && this.comments?.slice() !== '') {
      form.patchValue({ 'comments': this.comments });
    }

    const lead = this.leadFormService.getLead(form) as NewLead;
    this.loadingService.show();
    this.leadService.create(lead)
      .pipe(finalize(() => {
        this.isSubmitting = false;
        this.isNavSubmitting = false;
        this.loadingService.hide();
        if (!this.serviceType) {
          this.resetFormValidations(form);
        }
      }))
      .subscribe({
        next: (newLead) => {
          this.sessionStorageService.setObject('lead', newLead.body);
          this.trackConversion();
          if (this.serviceType) {
            if(this.serviceType === 'TRADEMARK_REGISTRATION'){
              // Returning visitors resume where they left off; the fresh lead
              // is attached to the in-progress application either way.
              const resumeUrl = this.onboardingStateService.resumeUrl();
              this.onboardingStateService.saveState({ lead: newLead.body ?? null });
              this.router.navigateByUrl(resumeUrl ?? 'trademark-registration/brand-details');
              return;
            }
            this.router.navigate(['/service-checkout'], {
              queryParams: { service: this.serviceType, lead_id: newLead.body?.id }
            });
          } else {
            this.toastService.success('Thank you! One of our team members will contact you soon.');
          }
        },
        error: () => {
          this.toastService.error('There were some issues while submitting. Please try later.');
        }
      });
  }

  addValidationsToFormAndValidate(form: FormGroup<any>) {
    form.get('fullName')?.setValidators([Validators.required]);
    form.get('email')?.setValidators([Validators.required, Validators.pattern('[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,4}$')]);
    form.get('phoneNumber')?.setValidators([Validators.required]);
    form.get('fullName')?.updateValueAndValidity();
    form.get('email')?.updateValueAndValidity();
    form.get('phoneNumber')?.updateValueAndValidity();
    if (this.showTextArea) {
      form.get('comments')?.setValidators([Validators.required]);
      form.get('comments')?.updateValueAndValidity();
    }
    form.markAllAsTouched();
  }

  trackConversion() {
    this.googleConversionTrackingService.reportLeadFormSubmit();
  }

  resetFormValidations(formGroup: FormGroup<any>) {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(controlName => {
      formGroup.get(controlName)?.clearValidators();
      formGroup.get(controlName)?.updateValueAndValidity();
    });
  }

  focusOnCtaForm() {
    if (this.ctaFormElement) {
      const firstInput = this.ctaFormElement.nativeElement.querySelector('input');
      if (firstInput) {
        firstInput.focus();
      }
    }
  }
}

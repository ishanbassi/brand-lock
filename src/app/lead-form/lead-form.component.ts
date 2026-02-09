import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '../shared/shared.module';
import { MatIcon } from '@angular/material/icon';
import { LeadFormService } from '../../models/lead-form.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../common/loading.service';
import { LeadService } from '../shared/services/lead.service';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoogleConversionTrackingService } from '../shared/services/google-conversion-tracking.service';
import { NewLead } from '../../models/lead.model';
import { finalize, Subject } from 'rxjs';

@Component({
  selector: 'app-lead-form',
  imports: [ReactiveFormsModule, MatInputModule, SharedModule, MatIcon,MatProgressSpinnerModule],
  templateUrl: './lead-form.component.html',
  styleUrl: './lead-form.component.scss'
})
export class LeadFormComponent implements OnInit {

  onClickValidation: boolean = false;
  isSubmitting: boolean = false;
  isNavSubmitting: boolean = false;
  @Input() heading:string = 'Apply Now';
  @Input() cta:string = 'Apply Now';
  @Input() comments = "";
  @Input() planTypeSubject?:Subject<any>;
  @ViewChild('ctaFormElement') ctaFormElement!: ElementRef;

  constructor(
    private readonly leadFormService: LeadFormService,
    private readonly toastService: ToastrService,
    private readonly loadingService:LoadingService,
    private readonly leadService: LeadService,
    private readonly localStorageService: LocalStorageService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly googleConversionTrackingService:GoogleConversionTrackingService,
    
  ){}
  ngOnInit(): void {
      this.planTypeSubject?.subscribe(planType => {
      this.ctaForm.get('selectedPackage')?.setValue(planType);
      this.focusOnCtaForm();
    })
  }

  ctaForm = new FormGroup({
    fullName: new FormControl('',),
    city: new FormControl('',),
    email: new FormControl('',),
    phoneNumber: new FormControl(''),
    selectedPackage: new FormControl(),
    comments: new FormControl()
  })

  submit() {
    this.onClickValidation = true;
    this.isSubmitting = true;
    this.saveLead(this.ctaForm);
    // this.submitNetlifyForm(this.ctaForm);
  }

  saveLead(form: FormGroup) {
      this.addValidationsToFormAndValidate(form);
      if (!form.valid) {
        this.isSubmitting = false;
        this.isNavSubmitting = false;
        return;
      }
      form.patchValue({
        "comments":this.comments
      })
      const lead = this.leadFormService.getLead(form) as NewLead;
      this.loadingService.show();
      this.leadService.create(lead)
      .pipe(finalize(() => {
        this.isSubmitting = false;
        this.isNavSubmitting = false;
        this.loadingService.hide();
        this.resetFormValidations(form);
      }))
      .subscribe({
        next: (newLead) => {
            this.sessionStorageService.setObject('lead', newLead.body);
            this.toastService.success("Thank you for your submission! One of our team members will contact you soon.");
            console.log("Form successfully submitted");
            this.trackConversion();
            // this.router.navigateByUrl("trademark-registration/step-2");
            
            
          },  
          error: (err) => {
            this.toastService.error("There were some issues while submitting the detils. Please try later.");
          }
      });
    }
    addValidationsToFormAndValidate(form: FormGroup<any>) {
    form.get('fullName')?.setValidators([Validators.required]);
    form.get('email')?.setValidators([Validators.required, Validators.pattern("[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,4}$")]);
    form.get('phoneNumber')?.setValidators([Validators.required, Validators.pattern("[0-9]{10}")]);

    // Recalculate validity with new validators
    form.get('fullName')?.updateValueAndValidity();
    form.get('email')?.updateValueAndValidity();
    form.get('phoneNumber')?.updateValueAndValidity();
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

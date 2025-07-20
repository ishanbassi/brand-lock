import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SharedModule } from '../../shared/shared.module';
import { NewLead } from '../../lead/lead.model';
import { HomeService } from '../../pages/home/home.service';
import { LeadFormService } from '../../lead/lead-form.service';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { PhoneInputComponent } from '../../phone-input/phone-input.component';
import { LoadingService } from '../../common/loading.service';
import { ToastService } from '../../shared/toast.service';
import { Router } from '@angular/router';
import { TrademarkOnboardingBtnSectionComponent } from '../../trademark-onboarding-btn-section/trademark-onboarding-btn-section.component';
declare let gtag: Function; // Add this at the top of your TypeScript file


@Component({
  selector: 'app-basic-details',
  imports: [ReactiveFormsModule, MatInputModule, SharedModule, MatIcon, MatStepperModule,
     MatCardModule, MatToolbarModule, MatButtonModule, MatIconModule,
     MatProgressSpinnerModule,NgxIntlTelInputModule,PhoneInputComponent, MatButton, TrademarkOnboardingBtnSectionComponent
  ],
  templateUrl: './basic-details.component.html',
  styleUrl: './basic-details.component.scss'
})
export class BasicDetailsComponent {

  onClickValidation: boolean = false;
  isSubmitting: boolean = false;
    basicDetailsForm = new FormGroup({
      fullName: new FormControl('',[Validators.required]),
      city: new FormControl('',[Validators.required]),
      email: new FormControl('',[Validators.required,Validators.pattern("[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,4}$")]),
      phoneNumber: new FormControl<any>('',[Validators.required]),
      selectedPackage: new FormControl()
  })

  constructor(
     private readonly homeService: HomeService,
      private readonly leadFormService: LeadFormService,
      private loadingService:LoadingService,
      private toastService:ToastService,
      private router:Router
       
  ){}

  submit() {
    this.onClickValidation = true;
    this.isSubmitting = true;
    this.saveLead(this.basicDetailsForm);
    // this.submitNetlifyForm(this.ctaForm);
  }
   saveLead(form: FormGroup) {
      // this.addValidationsToFormAndValidate(form);
      if (!form.valid) {

        this.isSubmitting = false;
        return;
      }
      // setting phone number
      form.patchValue({
        "phoneNumber":form.value['phoneNumber']?.number
      })
      const lead = this.leadFormService.getLead(form) as NewLead;
      this.loadingService.show();
      this.homeService.saveLead(lead)
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this.loadingService.hide();
            this.router.navigateByUrl("trademark-registration/step-2")

          },  
          error: () => {
            this.isSubmitting = false;
            this.loadingService.hide();
          }
        })
    }

    addValidationsToFormAndValidate(form: FormGroup<any>) {
        form.get('fullName')?.setValidators([Validators.required]);
        form.get('email')?.setValidators([Validators.required, Validators.pattern("[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,4}$")]);
        form.get('city')?.setValidators([Validators.required]);
        form.get('phoneNumber')?.setValidators([Validators.required]);
    
        // Recalculate validity with new validators
        form.get('fullName')?.updateValueAndValidity();
        form.get('email')?.updateValueAndValidity();
        form.get('city')?.updateValueAndValidity();
        form.get('phoneNumber')?.updateValueAndValidity();
        form.markAllAsTouched();
    
      }

      skip(){
        this.router.navigateByUrl("trademark-registration/step-2")
      }

}

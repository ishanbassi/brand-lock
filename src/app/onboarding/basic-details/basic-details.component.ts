import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SharedModule } from '../../shared/shared.module';
import { ILead, NewLead } from '../../../models/lead.model';
import { HomeService } from '../../pages/home/home.service';
import { LeadFormService } from '../../../models/lead-form.service';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { PhoneInputComponent } from '../../phone-input/phone-input.component';
import { LoadingService } from '../../common/loading.service';
import { ToastService } from '../../shared/toast.service';
import { Router } from '@angular/router';
import { TrademarkOnboardingBtnSectionComponent } from '../../trademark-onboarding-btn-section/trademark-onboarding-btn-section.component';
import { LeadService } from '../../shared/services/lead.service';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { SessionStorageService } from '../../shared/services/session-storage.service';
import { finalize, Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { ValidationMessageComponent } from '../../shared/validation-message/validation-message.component';
declare let gtag: Function; // Add this at the top of your TypeScript file


@Component({
  selector: 'app-basic-details',
  imports: [ReactiveFormsModule, MatInputModule, SharedModule, MatIcon, MatStepperModule,
     MatCardModule, MatToolbarModule, MatButtonModule, MatIconModule,
     MatProgressSpinnerModule,NgxIntlTelInputModule,PhoneInputComponent, MatButton, TrademarkOnboardingBtnSectionComponent, ValidationMessageComponent
  ],
  templateUrl: './basic-details.component.html',
  styleUrl: './basic-details.component.scss'
})
export class BasicDetailsComponent implements OnInit {

  onClickValidation: boolean = false;
  isSubmitting: boolean = false;
  lead: ILead | null = null;
  protected leadFormService = inject(LeadFormService);
  leadForm = this.leadFormService.createLeadFormGroup();


  constructor(
     private readonly homeService: HomeService,
      private loadingService:LoadingService,
      private toastService:ToastService,
      private router:Router,
      private readonly leadService: LeadService,
      private readonly localStorageService: LocalStorageService,
      private readonly sessionStorageService: SessionStorageService
       
  ){}

  ngOnInit(): void {
    const lead = this.sessionStorageService.getObject('lead');
    
    if(lead){

      this.leadService.find(this.sessionStorageService.getObject('lead').id).subscribe({
        next: (response) => {
          this.lead = response.body; 
          if(this.lead) {
            this.updateForm(this.lead);
          }
        }
      })

    } 
    this.addValidationsToFormAndValidate(this.leadForm);
  }

  submit() {
    this.onClickValidation = true;
    this.isSubmitting = true;
    this.saveLead(this.leadForm);
    // this.submitNetlifyForm(this.ctaForm);
  }
   saveLead(form: FormGroup) {
      if (!form.valid) {
        this.isSubmitting = false;
        this.leadForm.markAllAsTouched();
        console.log(form)
        return;
      }
      // setting phone number
      form.patchValue({
        "phoneNumber":form.value['phoneNumber']?.number
      })
      const lead = this.leadFormService.getLead(form);
      this.loadingService.show();

      if(lead.id != null){
        this.subscribeToSaveResponse(this.leadService.partialUpdate(lead))
      }else{
        this.subscribeToSaveResponse(this.leadService.create(lead as NewLead))
      }
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


    
      }


    protected subscribeToSaveResponse(result: Observable<HttpResponse<ILead>>): void {
      result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
        next: (newLead) => this.onSaveSuccess(newLead),
        error: () => this.onSaveError(),
      });
  }

  protected onSaveSuccess( newLead: HttpResponse<ILead>): void {
    this.sessionStorageService.setObject('lead', newLead.body);
    this.router.navigateByUrl("trademark-registration/step-2")
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSubmitting = false;
    this.loadingService.hide();
  }

  protected updateForm(lead: ILead): void {
    this.lead = lead;
    this.leadFormService.resetForm(this.leadForm, lead);

  }


}

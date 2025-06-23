import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgxMaskDirective } from 'ngx-mask';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { SharedModule } from '../../shared/shared.module';
import { NewLead } from '../../lead/lead.model';
import { HomeService } from '../../pages/home/home.service';
import { LeadFormService } from '../../lead/lead-form.service';
declare let gtag: Function; // Add this at the top of your TypeScript file


@Component({
  selector: 'app-basic-details',
  imports: [ReactiveFormsModule, MatInputModule, SharedModule, MatIcon, MatStepperModule,
     MatCardModule, MatToolbarModule, MatButtonModule, MatIconModule,
    NgxMaskDirective, MatProgressSpinnerModule
  ],
  templateUrl: './basic-details.component.html',
  styleUrl: './basic-details.component.scss'
})
export class BasicDetailsComponent {

  onClickValidation: boolean = false;
  isSubmitting: boolean = false;
    basicDetailsForm = new FormGroup({
      fullName: new FormControl('',),
      city: new FormControl('',),
      email: new FormControl('',),
      phoneNumber: new FormControl(''),
      selectedPackage: new FormControl()
  })

  constructor(
     private readonly homeService: HomeService,
      private readonly leadFormService: LeadFormService,
       
  ){}

  submit() {
    this.onClickValidation = true;
    this.isSubmitting = true;
    this.saveLead(this.basicDetailsForm);
    // this.submitNetlifyForm(this.ctaForm);
  }
   saveLead(form: FormGroup) {
      this.addValidationsToFormAndValidate(form);
      if (!form.valid) {
        this.isSubmitting = false;
        return;
      }
      const lead = this.leadFormService.getLead(form) as NewLead;
      this.homeService.saveLead(lead)
        .subscribe({
          next: () => {
            this.isSubmitting = false;
          },  
          error: () => {
            this.isSubmitting = false;
          }
        })
    }

    addValidationsToFormAndValidate(form: FormGroup<any>) {
        form.get('fullName')?.setValidators([Validators.required]);
        form.get('email')?.setValidators([Validators.required, Validators.pattern("[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,4}$")]);
        form.get('city')?.setValidators([Validators.required]);
        form.get('phoneNumber')?.setValidators([Validators.required, Validators.pattern("[0-9]{10}")]);
    
        // Recalculate validity with new validators
        form.get('fullName')?.updateValueAndValidity();
        form.get('email')?.updateValueAndValidity();
        form.get('city')?.updateValueAndValidity();
        form.get('phoneNumber')?.updateValueAndValidity();
        form.markAllAsTouched();
    
      }

}

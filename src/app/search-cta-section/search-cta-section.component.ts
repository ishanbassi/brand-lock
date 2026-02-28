import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { ILead, NewLead } from '../../models/lead.model';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LeadFormService } from '../../models/lead-form.service';
import { LoadingService } from '../common/loading.service';
import { LeadService } from '../shared/services/lead.service';
import { finalize, Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-search-cta-section',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './search-cta-section.component.html',
  styleUrl: './search-cta-section.component.scss'
})
export class SearchCtaSectionComponent implements OnInit {
    protected leadFormService = inject(LeadFormService);
    leadForm = this.leadFormService.createLeadFormGroup();


    lead: ILead | null = null;
    phoneNumber = '';
    phoneSubmitted = false;
    isSubmitting: boolean = false;
    onClickValidation: boolean = false;
    @Input() query?: string;
    


    constructor(
      private readonly loadingService: LoadingService,
      private readonly leadService: LeadService,
      private toastService: ToastrService,
      
    ){}

    ngOnInit(): void {
      this.addValidationsToFormAndValidate(this.leadForm);
    }
  

  saveLead(form: FormGroup) {
  
  
      if (!form.valid) {
        this.isSubmitting = false;
        this.leadForm.markAllAsTouched();
        return;
      }
      form.patchValue({
        "comments": `Detail trademark Search report for query ${this.query}.`
      })
  
      const lead = this.leadFormService.getLead(form);
      this.loadingService.show();
  
      if (lead.id != null) {
        this.subscribeToSaveResponse(this.leadService.partialUpdate(lead))
      } else {
        this.subscribeToSaveResponse(this.leadService.create(lead as NewLead))
      }
    }

    protected subscribeToSaveResponse(result: Observable<HttpResponse<ILead>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: (newLead) => this.onSaveSuccess(newLead),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(newLead: HttpResponse<ILead>): void {
    this.toastService.info("Thank you! Your detailed trademark report will be sent to your phone within 10 minutes.");
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.leadForm.reset();
    this.resetFormValidations(this.leadForm);
    this.isSubmitting = false;
    this.loadingService.hide();
  }
  resetFormValidations(formGroup: FormGroup<any>) {
    Object.keys(formGroup.controls).forEach(controlName => {
      formGroup.get(controlName)?.clearValidators();
      formGroup.get(controlName)?.updateValueAndValidity();
    });
  }

  submit() {
    this.onClickValidation = true;
    this.isSubmitting = true;
    this.saveLead(this.leadForm);
  }

  addValidationsToFormAndValidate(form: FormGroup<any>) {
    
    form.get('phoneNumber')?.setValidators([Validators.required, Validators.pattern("[0-9]{10}"), Validators.maxLength(10)]);
    form.get('phoneNumber')?.updateValueAndValidity();
  }


}

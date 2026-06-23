import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { LeadService } from '../shared/services/lead.service';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { LoadingService } from '../common/loading.service';
import { PhoneInputComponent } from '../phone-input/phone-input.component';
import { NavbarV2Component } from '../navbar-v2/navbar-v2.component';
import { FooterV2Component } from '../footer-v2/footer-v2.component';
import { NewLead } from '../../models/lead.model';

@Component({
  selector: 'app-trademark-renewal',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PhoneInputComponent, NavbarV2Component, FooterV2Component],
  templateUrl: './trademark-renewal.component.html',
  styleUrl: './trademark-renewal.component.scss'
})
export class TrademarkRenewalComponent implements OnInit {

  isSubmitting = false;
  onClickValidation = false;

  renewalForm = new FormGroup({
    fullName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,4}$')]),
    phoneNumber: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    trademarkNumber: new FormControl('', [Validators.required])
  });

  constructor(
    private readonly router: Router,
    private readonly leadService: LeadService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly loadingService: LoadingService,
    private readonly toastService: ToastrService
  ) {}

  ngOnInit() {}

  submit() {
    this.onClickValidation = true;
    this.renewalForm.markAllAsTouched();
    if (this.renewalForm.invalid) return;

    this.isSubmitting = true;
    this.loadingService.show();

    const formValue = this.renewalForm.value;
    const lead: NewLead = {
      id:null,
      fullName: formValue.fullName!,
      email: formValue.email!,
      phoneNumber: (formValue.phoneNumber as any)?.number ?? formValue.phoneNumber!,
      city: formValue.city!,
      comments: `TRADEMARK RENEWAL | TM No: ${formValue.trademarkNumber}`
    };

    this.leadService.create(lead)
      .pipe(finalize(() => {
        this.isSubmitting = false;
        this.loadingService.hide();
      }))
      .subscribe({
        next: (response) => {
          this.sessionStorageService.setObject('lead', response.body);
          
          this.toastService.success('Thank you! One of our team members will contact you soon.');
          // this.router.navigate(['/service-checkout'], {
          //   queryParams: {
          //     service: 'TRADEMARK_RENEWAL',
          //     lead_id: response.body?.id,
          //     tm_number: formValue.trademarkNumber
          //   }
          // });
        },
        error: () => {
          this.toastService.error('Failed to submit details. Please try again.');
        }
      });
  }
}

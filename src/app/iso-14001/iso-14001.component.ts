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
import { NewLead } from '../../models/lead.model';

@Component({
  selector: 'app-iso-14001',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PhoneInputComponent],
  templateUrl: './iso-14001.component.html',
  styleUrl: './iso-14001.component.scss'
})
export class Iso14001Component implements OnInit {

  isSubmitting = false;
  onClickValidation = false;

  form = new FormGroup({
    fullName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,4}$')]),
    phoneNumber: new FormControl('', [Validators.required]),
    businessName: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required])
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
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSubmitting = true;
    this.loadingService.show();

    const fv = this.form.value;
    const lead: NewLead = {
      id: null,
      fullName: fv.fullName!,
      email: fv.email!,
      phoneNumber: (fv.phoneNumber as any)?.number ?? fv.phoneNumber!,
      city: fv.city!,
      comments: `ISO 14001:2015 | Business: ${fv.businessName}`
    };

    this.leadService.create(lead)
      .pipe(finalize(() => { this.isSubmitting = false; this.loadingService.hide(); }))
      .subscribe({
        next: (response) => {
          this.sessionStorageService.setObject('lead', response.body);
          this.toastService.success('Thank you! One of our team members will contact you soon.');

          // this.router.navigate(['/service-checkout'], {
          //   queryParams: { service: 'ISO_14001', lead_id: response.body?.id }
          // });
        },
        error: () => this.toastService.error('Failed to submit. Please try again.')
      });
  }
}

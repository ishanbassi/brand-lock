import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import dayjs from 'dayjs/esm';
import { finalize } from 'rxjs';
import { NewLead } from '../../models/lead.model';
import { LeadService } from '../shared/services/lead.service';
import { GoogleConversionTrackingService } from '../shared/services/google-conversion-tracking.service';

/**
 * Inline lead card shown between search results when similar marks were found.
 * A visitor who sees existing similar trademarks is at the exact moment of
 * doubt ("can I still register mine?") — this captures that as a lead.
 */
@Component({
  selector: 'app-search-expert-opinion',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-expert-opinion.component.html',
  styleUrl: './search-expert-opinion.component.scss'
})
export class SearchExpertOpinionComponent {
  @Input() query?: string;
  @Input() resultCount = 0;

  submitted = false;
  isSubmitting = false;

  leadForm = new FormGroup({
    phoneNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{10}')]),
  });

  constructor(
    private readonly leadService: LeadService,
    private readonly toastService: ToastrService,
    private readonly googleConversionTrackingService: GoogleConversionTrackingService,
  ) {}

  submit(): void {
    if (this.isSubmitting) {
      return;
    }
    this.leadForm.markAllAsTouched();
    if (!this.leadForm.valid) {
      return;
    }
    const now = dayjs();
    const lead: NewLead = {
      id: null,
      phoneNumber: this.leadForm.value.phoneNumber,
      brandName: this.query ?? null,
      comments: `Free conflict assessment for "${this.query}" — ${this.resultCount} similar mark(s) found in search`,
      leadSource: 'SEARCH_RESULTS_INLINE',
      contactMethod: 'CALL',
      status: 'NEW',
      createdDate: now,
      modifiedDate: now,
      deleted: false,
    };
    this.isSubmitting = true;
    this.leadService
      .create(lead)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.submitted = true;
          this.googleConversionTrackingService.reportLeadFormSubmit();
        },
        error: () => {
          this.toastService.error('There were some issues while submitting. Please try later.');
        },
      });
  }
}

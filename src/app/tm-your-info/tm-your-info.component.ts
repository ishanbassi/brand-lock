import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { NewLead } from '../../models/lead.model';
import { LeadService } from '../shared/services/lead.service';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { OnboardingStateService } from '../shared/services/onboarding-state.service';
import { GoogleConversionTrackingService } from '../shared/services/google-conversion-tracking.service';
import { LoadingService } from '../common/loading.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-tm-your-info',
  standalone: true,
  imports: [ReactiveFormsModule, SharedModule],
  templateUrl: './tm-your-info.component.html',
  styleUrl: './tm-your-info.component.scss'
})
export class TmYourInfoComponent implements OnInit {
  onClickValidation = false;
  isSubmitting = false;
  searchedTrademark: string | null = null;

  infoForm = new FormGroup({
    fullName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.pattern('[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,4}$')]),
    phoneNumber: new FormControl('', [Validators.required]),
  });

  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly leadService = inject(LeadService);
  private readonly sessionStorageService = inject(SessionStorageService);
  private readonly onboardingStateService = inject(OnboardingStateService);
  private readonly googleConversionTrackingService = inject(GoogleConversionTrackingService);
  private readonly loadingService = inject(LoadingService);
  private readonly toastService = inject(ToastrService);

  ngOnInit(): void {
    this.searchedTrademark = this.route.snapshot.queryParamMap.get('trademark');

    // sessionStorage isn't available during SSR - skip the "already known" check there.
    if (!isPlatformBrowser(this.platformId)) return;

    // A visitor who already has a lead on file (e.g. came back to this URL) can
    // skip straight to wherever their application actually is.
    const existingLead = this.sessionStorageService.getObject('lead');
    if (existingLead) {
      const resumeUrl = this.onboardingStateService.resumeUrl();
      this.router.navigateByUrl(resumeUrl ?? '/trademark-registration/brand-details');
    }
  }

  submit(): void {
    this.onClickValidation = true;
    this.infoForm.markAllAsTouched();
    if (this.infoForm.invalid) return;

    this.isSubmitting = true;
    const { fullName, email, phoneNumber } = this.infoForm.getRawValue();
    const lead: NewLead = {
      id: null,
      fullName,
      email,
      phoneNumber,
      brandName: this.searchedTrademark,
    };

    this.loadingService.show();
    this.leadService.create(lead)
      .pipe(finalize(() => {
        this.isSubmitting = false;
        this.loadingService.hide();
      }))
      .subscribe({
        next: (res) => {
          this.sessionStorageService.setObject('lead', res.body);
          this.googleConversionTrackingService.reportLeadFormSubmit();
          const resumeUrl = this.onboardingStateService.resumeUrl();
          this.onboardingStateService.saveState({ lead: res.body ?? null });
          this.router.navigateByUrl(resumeUrl ?? '/trademark-registration/brand-details');
        },
        error: () => {
          this.toastService.error('There were some issues while submitting. Please try again.');
        }
      });
  }
}

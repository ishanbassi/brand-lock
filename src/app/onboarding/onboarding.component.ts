import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { OnboardingStepperComponent } from '../onboarding-stepper/onboarding-stepper.component';
import { filter } from 'rxjs';
import { GoogleConversionTrackingService } from '../shared/services/google-conversion-tracking.service';
import { OnboardingStateService } from '../shared/services/onboarding-state.service';


@Component({
  selector: 'app-onboarding',
  imports: [RouterModule, CommonModule, OnboardingStepperComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss'
})
export class OnboardingComponent implements OnInit {
  showSidebar = true;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly onboardingStateService = inject(OnboardingStateService);

  constructor(
    private readonly router: Router,
    private readonly googleConversionTrackingService: GoogleConversionTrackingService
  ) {}

  ngOnInit() {
    this.updateSidebarVisibility(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateSidebarVisibility(this.router.url);
      });

    this.resumeSavedProgress();
  }

  /**
   * A visitor who left mid-onboarding and comes back lands on the step they
   * were on. Runs only on fresh entry into the onboarding shell, so in-app
   * back-navigation between steps is never overridden.
   */
  private resumeSavedProgress(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.onboardingStateService.restoreSession();
    const state = this.onboardingStateService.getState();
    if (!state || state.step === 'brand-details') return;

    const url = this.router.url;
    if (!url.includes('brand-details')) return;

    const resumeUrl = this.onboardingStateService.resumeUrl();
    if (resumeUrl) {
      this.router.navigateByUrl(resumeUrl);
    }
  }

  private updateSidebarVisibility(url: string): void {
    this.showSidebar = !url.includes('select-plan') && !url.includes('checkout');
  }

  trackCallToActionEvent() {
    this.googleConversionTrackingService.reportClickToCall();
  }
}

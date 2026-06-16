import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OnboardingStepperComponent } from '../onboarding-stepper/onboarding-stepper.component';
import { filter } from 'rxjs';
import { GoogleConversionTrackingService } from '../shared/services/google-conversion-tracking.service';


@Component({
  selector: 'app-onboarding',
  imports: [RouterModule, CommonModule, OnboardingStepperComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss'
})
export class OnboardingComponent implements OnInit {
  showSidebar = true;

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
  }

  private updateSidebarVisibility(url: string): void {
    this.showSidebar = !url.includes('select-plan') && !url.includes('checkout');
  }

  trackCallToActionEvent() {
    this.googleConversionTrackingService.reportClickToCall();
  }
}

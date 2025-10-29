import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MatStep, MatStepHeader, MatStepper } from '@angular/material/stepper';
import { filter, timer } from 'rxjs';
import { TrademarkOnboardingBtnSectionComponent } from '../trademark-onboarding-btn-section/trademark-onboarding-btn-section.component';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-onboarding-stepper',
  standalone: true,
  imports: [CommonModule,RouterModule, MatStepper, MatStep, MatIcon],
  templateUrl: './onboarding-stepper.component.html',
  styleUrl: './onboarding-stepper.component.scss',
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false }
    }
  ]

})
export class OnboardingStepperComponent implements OnInit {
  @ViewChild('stepper', { static: true }) stepper!:MatStepper;
  currentStepIndex = 0;

  constructor(
    private readonly router: Router,
    private cdRef: ChangeDetectorRef
    ) {}
  

   ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.setStepIndexFromRoute(this.router.url);
      });

    this.setStepIndexFromRoute(this.router.url);
  }

  private setStepIndexFromRoute(url: string): void {


    if (url.includes('step-1')) {
      this.currentStepIndex = 0;

    } else if (url.includes('step-2')) {
      this.currentStepIndex = 1;
    } else if (url.includes('step-3')) {
      this.currentStepIndex = 2;
    }
    else if (url.includes('step-4'))   {
      this.currentStepIndex = 3;
    }
    this.cdRef.detectChanges();

  }


}

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-onboarding-stepper',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './onboarding-stepper.component.html',
  styleUrl: './onboarding-stepper.component.scss',
})
export class OnboardingStepperComponent implements OnInit {
  currentStepIndex = 0;

  steps = [
    { label: 'Your Details', description: 'Name, email & phone' },
    { label: 'Trademark Type', description: 'What you want to protect' },
    { label: 'Brand Details', description: 'Name, logo or slogan' },
  ];

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
    } else if (url.includes('step-4')) {
      this.currentStepIndex = 3;
    }
    this.cdRef.detectChanges();
  }
}

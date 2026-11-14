import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agent-pricing-plans',
  standalone: true,
  templateUrl: './agent-pricing-plans.component.html',
  styleUrl: './agent-pricing-plans.component.scss',
})
export class AgentPricingPlansComponent {
  @Input() useOnboardingModal = false;
  @Output() readonly onboardingRequested = new EventEmitter<void>();

  readonly annualBilling = signal(true);
  readonly proPrice = computed(() => (this.annualBilling() ? '₹999' : '₹1,499'));
  readonly proPeriod = computed(() =>
    this.annualBilling() ? '/ month - billed annually' : '/ month - billed monthly',
  );

  constructor(private readonly router: Router) {}

  toggleBilling(): void {
    this.annualBilling.update(value => !value);
  }

  startOnboarding(): void {
    if (this.useOnboardingModal) {
      this.onboardingRequested.emit();
      return;
    }
    void this.router.navigate(['/create-agent-account']);
  }
}

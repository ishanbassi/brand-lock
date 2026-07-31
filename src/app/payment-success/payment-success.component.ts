import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TrademarkOrderSummary } from '../../models/trademark-order-summary.model';
import { DataService } from '../shared/services/data.service';
import { OnboardingStateService } from '../shared/services/onboarding-state.service';
import { ReferralAttributionService } from '../shared/services/referral-attribution.service';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.scss'
})
export class PaymentSuccessComponent implements OnInit {

  orderSummary: TrademarkOrderSummary | null = null;
  orderId: string | null = null;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataService = inject(DataService);
  private readonly onboardingStateService = inject(OnboardingStateService);
  private readonly referralAttributionService = inject(ReferralAttributionService);

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Payment is done — nothing left to resume.
    this.onboardingStateService.clear();
    this.referralAttributionService.clear();

    this.route.queryParams.subscribe(params => {
      this.orderId = params['order_id'] ?? null;
      if (this.orderId) {
        this.dataService.findByOrderId(this.orderId).subscribe({
          next: (res) => this.orderSummary = res.body,
          error: () => this.orderSummary = null
        });
      }
    });
  }

  get brandName(): string | null {
    return this.orderSummary?.trademarkDTO?.name ?? null;
  }

  get amountPaid(): number | null {
    return this.orderSummary?.totalFees ?? null;
  }

  get applicantEmail(): string | null {
    return this.orderSummary?.userProfileDTO?.email ?? this.orderSummary?.leadDTO?.email ?? null;
  }

  goToDashboard() {
    this.router.navigateByUrl('/portal/dashboard');
  }
}

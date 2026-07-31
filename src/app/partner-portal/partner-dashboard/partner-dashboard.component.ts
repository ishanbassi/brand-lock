import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { PartnerDataService } from '../../shared/services/partner-data.service';
import { PartnerDashboardStats, PartnerProfile, ReferralConversionSummary } from '../../../models/partner.model';

@Component({
  selector: 'app-partner-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './partner-dashboard.component.html',
  styleUrl: './partner-dashboard.component.scss',
})
export class PartnerDashboardComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly partnerDataService = inject(PartnerDataService);
  private readonly toastr = inject(ToastrService);

  profile?: PartnerProfile;
  stats?: PartnerDashboardStats;
  conversions: ReferralConversionSummary[] = [];
  siteOrigin = 'https://trademarx.in';

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.siteOrigin = window.location.origin;
    }

    this.partnerDataService.getProfile().subscribe({
      next: (profile) => (this.profile = profile),
    });

    this.partnerDataService.getDashboardStats().subscribe({
      next: (stats) => (this.stats = stats),
    });

    this.partnerDataService.getConversions().subscribe({
      next: (res) => (this.conversions = res.body ?? []),
    });
  }

  get trackedLink(): string {
    return `${this.siteOrigin}/?ref=${this.profile?.partnerCode ?? ''}`;
  }

  get plainLinkSnippet(): string {
    return `<a href="${this.trackedLink}" rel="sponsored">Trademark Registration by Trademarx</a>`;
  }

  get badgeSnippet(): string {
    return (
      `<a href="${this.trackedLink}" rel="sponsored" ` +
      `style="display:inline-flex;align-items:center;gap:6px;padding:10px 18px;` +
      `background:linear-gradient(135deg,#6366f1,#818cf8);color:#ffffff;` +
      `font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;` +
      `text-decoration:none;border-radius:8px;">` +
      `Trademark Registration by Trademarx</a>`
    );
  }

  get bannerSnippet(): string {
    return (
      `<a href="${this.trackedLink}" rel="sponsored">` +
      `<img src="${this.siteOrigin}/assets/images/partner-banner-300x250.png" ` +
      `width="300" height="250" alt="Trademark Registration by Trademarx" style="border:0;" />` +
      `</a>`
    );
  }

  copy(text: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    navigator.clipboard.writeText(text).then(
      () => this.toastr.success('Copied to clipboard'),
      () => this.toastr.error('Could not copy — please copy manually'),
    );
  }
}

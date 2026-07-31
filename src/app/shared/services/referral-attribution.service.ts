import { Injectable, inject } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

interface ReferralAttribution {
  code: string;
  firstSeenAt: number;
  lastSeenAt: number;
  landingPath: string;
}

const STORAGE_KEY = 'tm_referral';

/** A referral code stays attributable for 30 days after the most recent click. */
const ATTRIBUTION_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Tracks the referral partner code (?ref=CODE) that brought a visitor to the
 * site, so it can be attached to leads and orders created later in the same
 * attribution window. Shaped like OnboardingStateService: localStorage-backed
 * via the SSR-safe LocalStorageService, last-click-wins.
 */
@Injectable({ providedIn: 'root' })
export class ReferralAttributionService {
  private readonly localStorageService = inject(LocalStorageService);

  /** Record (or refresh) a referral code seen in the current URL. */
  captureFromUrl(code: string, landingPath: string): void {
    if (!code) return;
    const existing = this.localStorageService.getObject(STORAGE_KEY) as ReferralAttribution | null;
    const now = Date.now();

    if (existing && existing.code === code) {
      // Same partner's code seen again — just keep the attribution window sliding.
      this.localStorageService.setObject(STORAGE_KEY, { ...existing, lastSeenAt: now });
      return;
    }

    // A different (or first) code always wins — last-click attribution.
    const attribution: ReferralAttribution = {
      code,
      firstSeenAt: now,
      lastSeenAt: now,
      landingPath,
    };
    this.localStorageService.setObject(STORAGE_KEY, attribution);
  }

  /** The currently attributable referral code, or null if none or expired. */
  getActiveCode(): string | null {
    const attribution = this.localStorageService.getObject(STORAGE_KEY) as ReferralAttribution | null;
    if (!attribution) return null;
    if (Date.now() - attribution.lastSeenAt > ATTRIBUTION_WINDOW_MS) {
      return null;
    }
    return attribution.code;
  }

  clear(): void {
    this.localStorageService.remove(STORAGE_KEY);
  }
}

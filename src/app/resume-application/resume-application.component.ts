import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import {
  OnboardingStateService,
  STEP_META,
  TOTAL_STEPS,
} from '../shared/services/onboarding-state.service';

/**
 * Floating "resume your application" prompt.
 *
 * Shown on public/marketing pages when a visitor has an unfinished trademark
 * application saved in localStorage (they left mid-flow and came back). Clicking
 * "Continue" restores their session and drops them back on the exact step they
 * left. Hidden while the visitor is actively inside the onboarding flow.
 */
@Component({
  selector: 'app-resume-application',
  standalone: true,
  templateUrl: './resume-application.component.html',
  styleUrl: './resume-application.component.scss',
})
export class ResumeApplicationComponent implements OnInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly onboardingState = inject(OnboardingStateService);
  private readonly router = inject(Router);

  /** Routes where the prompt must never appear (the visitor is already in the flow). */
  private static readonly HIDDEN_ROUTE = '/trademark-registration';

  visible = false;
  private shownOnce = false;

  brandName: string | null = null;
  stepLabel = '';
  stepIndex = 1;
  readonly totalSteps = TOTAL_STEPS;
  progressPercent = 0;
  leftAgo = '';

  ngOnInit(): void {
    // localStorage / timers are browser-only; skip during SSR.
    if (!isPlatformBrowser(this.platformId)) return;

    // The prompt lives in the persistent public layout, so re-evaluate on every
    // navigation: hide it inside the flow, resurface it back on marketing pages.
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.evaluate());

    this.evaluate();
  }

  private evaluate(): void {
    if (this.onOnboardingRoute() || !this.onboardingState.hasResumableApplication()) {
      this.visible = false;
      return;
    }

    const state = this.onboardingState.getState()!;
    const meta = STEP_META[state.step] ?? STEP_META['brand-details'];

    this.brandName = state.brandName?.trim() || null;
    this.stepLabel = meta.label;
    this.stepIndex = meta.index;
    this.progressPercent = Math.round((meta.index / this.totalSteps) * 100);
    this.leftAgo = this.formatLeftAgo(state.updatedAt);

    if (this.shownOnce) {
      this.visible = true;
    } else {
      // Small delay on first appearance so the card slides in after the page
      // settles rather than competing with the initial paint.
      this.shownOnce = true;
      setTimeout(() => {
        if (!this.onOnboardingRoute() && this.onboardingState.hasResumableApplication()) {
          this.visible = true;
        }
      }, 900);
    }
  }

  private onOnboardingRoute(): boolean {
    return this.router.url.startsWith(ResumeApplicationComponent.HIDDEN_ROUTE);
  }

  continue(): void {
    const url = this.onboardingState.resumeUrl();
    this.onboardingState.restoreSession();
    this.visible = false;
    this.router.navigateByUrl(url ?? '/trademark-registration/brand-details');
  }

  dismiss(): void {
    this.visible = false;
    this.onboardingState.dismissPrompt();
  }

  /** "just now" / "2 hours ago" / "3 days ago" — best-effort recall hint. */
  private formatLeftAgo(updatedAt?: number | null): string {
    if (!updatedAt) return '';
    const diffMs = Date.now() - updatedAt;
    if (diffMs < 60_000) return 'just now';

    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
}

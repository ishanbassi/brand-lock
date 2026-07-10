import { Injectable, inject } from '@angular/core';
import { ILead } from '../../../models/lead.model';
import { LocalStorageService } from './local-storage.service';
import { SessionStorageService } from './session-storage.service';

/**
 * Steps of the trademark-registration onboarding, in order.
 * Used to resume a returning visitor at the step they left off.
 */
export type OnboardingStep = 'brand-details' | 'business-details' | 'checkout';

export interface OnboardingState {
  step: OnboardingStep;
  lead?: ILead | null;
  trademarkId?: number | null;
  paymentId?: number | null;
  orderId?: string | null;
  /** True when the MSME/Udyam certificate was uploaded (drives the govt-fee concession messaging). */
  msmeUploaded?: boolean;
  organizationType?: string | null;
  /** Brand name captured on the first step, shown in the "resume application" prompt. */
  brandName?: string | null;
  /** Epoch millis of the last progress update — used to show "left X ago" in the prompt. */
  updatedAt?: number | null;
}

/** Human-readable labels + ordinal for each step, used by the resume-application prompt. */
export const STEP_META: Record<OnboardingStep, { label: string; index: number }> = {
  'brand-details': { label: 'Brand details', index: 1 },
  'business-details': { label: 'Business details', index: 2 },
  checkout: { label: 'Payment', index: 3 },
};

const STORAGE_KEY = 'tm_onboarding';

/** Session-scoped flag so a dismissed prompt stays hidden until the next browser session. */
const DISMISS_KEY = 'tm_onboarding_prompt_dismissed';

const STEP_ORDER: OnboardingStep[] = ['brand-details', 'business-details', 'checkout'];

export const TOTAL_STEPS = STEP_ORDER.length;

/**
 * Persists trademark-registration onboarding progress in localStorage so a
 * visitor who leaves mid-flow is brought back to the step they were on.
 * Cleared once payment completes.
 */
@Injectable({ providedIn: 'root' })
export class OnboardingStateService {
  private readonly localStorageService = inject(LocalStorageService);
  private readonly sessionStorageService = inject(SessionStorageService);

  getState(): OnboardingState | null {
    return this.localStorageService.getObject(STORAGE_KEY);
  }

  saveState(partial: Partial<OnboardingState>): void {
    const current = this.getState() ?? { step: 'brand-details' as OnboardingStep };
    this.localStorageService.setObject(STORAGE_KEY, { ...current, ...partial, updatedAt: Date.now() });
  }

  clear(): void {
    this.localStorageService.remove(STORAGE_KEY);
    this.sessionStorageService.remove('trademark');
    this.sessionStorageService.remove('payment_id');
    this.sessionStorageService.remove('lead');
    this.sessionStorageService.remove(DISMISS_KEY);
  }

  /**
   * True when there is a saved, unfinished application worth prompting the
   * visitor to resume (and they have not dismissed the prompt this session).
   */
  hasResumableApplication(): boolean {
    const state = this.getState();
    return !!state?.trademarkId && !this.isPromptDismissed();
  }

  isPromptDismissed(): boolean {
    return this.sessionStorageService.get(DISMISS_KEY) === 'true';
  }

  /** Hide the resume prompt for the rest of this browser session. */
  dismissPrompt(): void {
    this.sessionStorageService.set(DISMISS_KEY, 'true');
  }

  /**
   * URL the visitor should land on for the saved step
   * (null when there is nothing to resume).
   */
  resumeUrl(): string | null {
    const state = this.getState();
    if (!state) return null;
    switch (state.step) {
      case 'checkout':
        return state.orderId
          ? `/trademark-registration/checkout?order_id=${state.orderId}`
          : '/trademark-registration/business-details';
      case 'business-details':
        return '/trademark-registration/business-details';
      default:
        return '/trademark-registration/brand-details';
    }
  }

  /** True when `candidate` comes later in the flow than `base`. */
  isStepAhead(candidate: OnboardingStep, base: OnboardingStep): boolean {
    return STEP_ORDER.indexOf(candidate) > STEP_ORDER.indexOf(base);
  }

  /**
   * Copies persisted state back into sessionStorage so the existing step
   * components (which read lead/trademark from the session) keep working
   * after the browser tab was closed.
   */
  restoreSession(): void {
    const state = this.getState();
    if (!state) return;
    if (state.lead && !this.sessionStorageService.getObject('lead')) {
      this.sessionStorageService.setObject('lead', state.lead);
    }
    if (state.trademarkId && !this.sessionStorageService.getObject('trademark')) {
      this.sessionStorageService.setObject('trademark', { id: state.trademarkId });
    }
    if (state.paymentId && !this.sessionStorageService.get('payment_id')) {
      this.sessionStorageService.set('payment_id', state.paymentId);
    }
  }
}

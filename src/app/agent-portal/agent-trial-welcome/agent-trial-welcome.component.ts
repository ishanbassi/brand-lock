import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, PLATFORM_ID, ViewChild, computed, inject, signal } from '@angular/core';
import dayjs from 'dayjs';
import { BillingState, FEATURE_ORDER, describeFeature } from '../../../models/billing.model';
import { BillingService } from '../../shared/services/billing.service';
import { AuthService } from '../../../models/auth.services';
import { IconComponent } from '../ui/icon.component';

/** A short pause lets the dashboard arrive before the first-run welcome takes focus. */
const TRIAL_WELCOME_DELAY_MS = 1400;

/**
 * First-run acknowledgement of either the portfolio-based free access or a Pro trial.
 *
 * The server, not registration state in the browser, decides whether this can appear. The dismissal
 * is scoped to the signed-in account for free access and to the trial's end time for trials. A
 * future trial or an administrator-granted extension naturally receives its own acknowledgement.
 */
@Component({
  selector: 'ap-agent-trial-welcome',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './agent-trial-welcome.component.html',
  styleUrl: './agent-trial-welcome.component.scss',
})
export class AgentTrialWelcomeComponent implements OnInit, OnDestroy {
  private readonly billing = inject(BillingService);
  private readonly auth = inject(AuthService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('dialog') private dialog?: ElementRef<HTMLElement>;
  @ViewChild('closeButton') private closeButton?: ElementRef<HTMLButtonElement>;

  readonly visible = signal(false);
  readonly trial = signal<BillingState | null>(null);
  /** The no-cost plan is already active on the server; this dialog only explains it. */
  readonly hasFreePortfolioAccess = computed(() => !!this.trial()?.freeUnlimitedAccess);
  readonly features = computed(() => {
    const entitlements = this.trial()?.entitlements;
    if (!entitlements) return [];
    // AI drafts are intentionally not in FEATURE_ORDER: the plan reserves the allowance, but the
    // feature itself has no agent-facing workflow yet and must not be advertised as available.
    return FEATURE_ORDER.map(feature => describeFeature(feature, entitlements[feature])).filter((line): line is string => !!line);
  });
  readonly daysRemaining = computed(() => {
    const endsAt = this.trial()?.trialEndsAt;
    return endsAt ? Math.max(0, Math.ceil(dayjs(endsAt).diff(dayjs(), 'hour') / 24)) : 0;
  });
  readonly trialEndLabel = computed(() => {
    const endsAt = this.trial()?.trialEndsAt;
    return endsAt ? dayjs(endsAt).format('D MMMM YYYY') : '';
  });

  // Browser timers use numeric handles. Avoid ReturnType here because Node's global overload
  // takes precedence in this SSR-enabled project, even when calling window.setTimeout.
  private showTimer?: number;
  private focusedBeforeOpen: HTMLElement | null = null;

  ngOnInit(): void {
    if (!this.isBrowser) return;
    const knownState = this.billing.state();
    if (knownState) {
      this.armWelcome(knownState);
      return;
    }
    this.billing.loadState().subscribe({ next: state => this.armWelcome(state), error: () => undefined });
  }

  ngOnDestroy(): void {
    if (this.showTimer !== undefined) window.clearTimeout(this.showTimer);
  }

  dismiss(): void {
    const state = this.trial();
    if (state) {
      try {
        localStorage.setItem(this.dismissalKey(state), 'dismissed');
      } catch {
        // Private browsing or disabled storage should never prevent dismissing a welcome dialog.
      }
    }
    this.visible.set(false);
    this.focusedBeforeOpen?.focus();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.visible()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.dismiss();
      return;
    }
    if (event.key !== 'Tab' || !this.dialog) return;
    const focusable = Array.from(this.dialog.nativeElement.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private armWelcome(state: BillingState): void {
    // Small practices receive this instead of the paid-trial welcome. The entitlement is resolved
    // on the server, so a stale or manipulated browser value can never grant access.
    if (state.freeUnlimitedAccess) {
      if (this.wasDismissed(state)) return;
      this.show(state);
      return;
    }

    if ((state.status !== 'TRIALING' && state.status !== 'SCHEDULED') || !state.entitled || !state.trialEndsAt || this.wasDismissed(state)) return;
    this.show(state);
  }

  private show(state: BillingState): void {
    this.trial.set(state);
    this.showTimer = window.setTimeout(() => {
      this.focusedBeforeOpen = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      this.visible.set(true);
      window.setTimeout(() => this.closeButton?.nativeElement.focus());
    }, TRIAL_WELCOME_DELAY_MS);
  }

  private dismissalKey(state: BillingState): string {
    if (state.freeUnlimitedAccess) {
      // User id scopes the acknowledgement when several agents use the same browser. A login is
      // retained as a safe fallback for the short post-registration window before the full user
      // object has populated.
      const user = this.auth.getUser();
      const account = user?.id ?? user?.login ?? 'current-agent';
      return `agent-free-portfolio-welcome:${account}`;
    }
    return `agent-trial-welcome:${state.trialEndsAt}`;
  }

  private wasDismissed(state: BillingState): boolean {
    try {
      return localStorage.getItem(this.dismissalKey(state)) === 'dismissed';
    } catch {
      return false;
    }
  }
}

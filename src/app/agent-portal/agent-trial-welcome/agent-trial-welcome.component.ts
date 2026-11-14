import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, PLATFORM_ID, ViewChild, computed, inject, signal } from '@angular/core';
import dayjs from 'dayjs';
import { BillingState, FEATURE_ORDER, describeFeature } from '../../../models/billing.model';
import { BillingService } from '../../shared/services/billing.service';
import { IconComponent } from '../ui/icon.component';

/** A short pause lets the dashboard arrive before the first-run welcome takes focus. */
const TRIAL_WELCOME_DELAY_MS = 1400;

/**
 * First-run acknowledgement of the Pro trial.
 *
 * The server, not registration state in the browser, decides whether this can appear. The dismissal
 * is scoped to the trial's end time: it is remembered for this trial but naturally clears when a
 * future trial or an administrator-granted extension has a different window.
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
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  @ViewChild('dialog') private dialog?: ElementRef<HTMLElement>;
  @ViewChild('closeButton') private closeButton?: ElementRef<HTMLButtonElement>;

  readonly visible = signal(false);
  readonly trial = signal<BillingState | null>(null);
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
      this.armForTrial(knownState);
      return;
    }
    this.billing.loadState().subscribe({ next: state => this.armForTrial(state), error: () => undefined });
  }

  ngOnDestroy(): void {
    if (this.showTimer !== undefined) window.clearTimeout(this.showTimer);
  }

  dismiss(): void {
    const state = this.trial();
    if (state?.trialEndsAt) {
      try {
        localStorage.setItem(this.dismissalKey(state.trialEndsAt), 'dismissed');
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

  private armForTrial(state: BillingState): void {
    if ((state.status !== 'TRIALING' && state.status !== 'SCHEDULED') || !state.entitled || !state.trialEndsAt || this.wasDismissed(state.trialEndsAt)) return;
    this.trial.set(state);
    this.showTimer = window.setTimeout(() => {
      this.focusedBeforeOpen = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      this.visible.set(true);
      window.setTimeout(() => this.closeButton?.nativeElement.focus());
    }, TRIAL_WELCOME_DELAY_MS);
  }

  private dismissalKey(trialEndsAt: string): string {
    return `agent-trial-welcome:${trialEndsAt}`;
  }

  private wasDismissed(trialEndsAt: string): boolean {
    try {
      return localStorage.getItem(this.dismissalKey(trialEndsAt)) === 'dismissed';
    } catch {
      return false;
    }
  }
}

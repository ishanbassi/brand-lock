import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

export type AgentOnboardingIntent =
  | { kind: 'agent-preview'; agentName: string; agentNames?: string[] }
  | { kind: 'spreadsheet' };

/**
 * Carries a choice made on the public agent home into account creation without putting a mutable
 * claim request in the URL. The backend still validates the name when it is claimed.
 */
@Injectable({ providedIn: 'root' })
export class AgentOnboardingIntentService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly key = 'trademarx.agent-onboarding-intent';

  set(intent: AgentOnboardingIntent): void {
    if (!isPlatformBrowser(this.platformId)) return;
    sessionStorage.setItem(this.key, JSON.stringify(intent));
  }

  consume(): AgentOnboardingIntent | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const raw = sessionStorage.getItem(this.key);
    sessionStorage.removeItem(this.key);
    if (!raw) return null;
    try {
      const intent = JSON.parse(raw) as AgentOnboardingIntent;
      if (intent.kind === 'agent-preview' && typeof intent.agentName === 'string' && intent.agentName.trim().length >= 2) {
        const agentNames = Array.isArray(intent.agentNames)
          ? [...new Set(intent.agentNames.filter(name => typeof name === 'string').map(name => name.trim()).filter(name => name.length >= 2))]
          : [];
        const agentName = intent.agentName.trim();
        return { kind: 'agent-preview', agentName, agentNames: agentNames.includes(agentName) ? agentNames : [agentName, ...agentNames] };
      }
      return intent.kind === 'spreadsheet' ? intent : null;
    } catch {
      return null;
    }
  }
}

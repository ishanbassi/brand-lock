import { Injectable, REQUEST_CONTEXT, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

/**
 * Which site this request is for — the public trademark site, or the agent portal subdomain.
 *
 * In production, the agent portal lives at agent.trademarx.in and is deliberately not part of the trademark
 * registration product: an agent represents other people's marks and is not a customer filing
 * their own. One Angular build serves both, so something has to tell them apart.
 *
 * Reads the host from the SSR request context on the server and from the URL in the browser. Both
 * halves matter in production: a browser-only check would still let the server render agent pages under the main
 * domain and hand them to a crawler before the client ever corrected it.
 *
 * Note this is a routing and presentation concern, not a security boundary. The API is shared and a
 * token works from any origin, so authorisation is enforced server-side in SecurityConfiguration —
 * agents hold ROLE_AGENT only and cannot reach member endpoints regardless of which host they came
 * from.
 */
export interface SsrHostContext {
  host?: string;
}

/** Subdomain the agent portal is served from. */
export const AGENT_HOST_PREFIX = 'agent.';

@Injectable({ providedIn: 'root' })
export class HostContextService {
  private readonly context = inject(REQUEST_CONTEXT, { optional: true }) as SsrHostContext | null;
  private readonly platformId = inject(PLATFORM_ID);

  /** Hostname for this request, lower-cased and without any port. */
  get host(): string {
    if (isPlatformBrowser(this.platformId)) {
      return window.location.hostname.toLowerCase();
    }
    return (this.context?.host ?? '').toLowerCase().split(':')[0];
  }

  /** Whether this build keeps the portal on a distinct origin. Local development uses one origin. */
  get requiresAgentSubdomain(): boolean {
    return environment.production;
  }

  /** True when this request is for the agent portal production subdomain. */
  get isAgentHost(): boolean {
    if (!this.requiresAgentSubdomain) {
      return false;
    }
    const h = this.host;
    // Prefix match keeps production-like staging hosts working too
    // (for example, agent.staging.trademarx.in), while local development stays single-origin.
    return h.startsWith(AGENT_HOST_PREFIX);
  }

  /**
   * Absolute URL of the same path on the other site, for cross-host redirects.
   *
   * Router navigation cannot cross an origin, so moving between the two is a full page load.
   */
  urlOnMainHost(path: string): string {
    if (!this.requiresAgentSubdomain) {
      return `${this.protocol}//${this.authority}${path}`;
    }
    const h = this.host.startsWith(AGENT_HOST_PREFIX) ? this.host.slice(AGENT_HOST_PREFIX.length) : this.host;
    return `${this.protocol}//${h}${path}`;
  }

  urlOnAgentHost(path: string): string {
    if (!this.requiresAgentSubdomain) {
      return `${this.protocol}//${this.authority}${path}`;
    }
    const h = this.host.startsWith(AGENT_HOST_PREFIX) ? this.host : `${AGENT_HOST_PREFIX}${this.host}`;
    return `${this.protocol}//${h}${path}`;
  }

  /** Browser origin includes a dev-server port; SSR request hosts already include it when present. */
  private get authority(): string {
    if (isPlatformBrowser(this.platformId)) {
      return window.location.host.toLowerCase();
    }
    return (this.context?.host ?? '').toLowerCase();
  }

  private get protocol(): string {
    return isPlatformBrowser(this.platformId) ? window.location.protocol : 'https:';
  }
}

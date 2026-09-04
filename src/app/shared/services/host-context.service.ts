import { Injectable, REQUEST_CONTEXT, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Which site this request is for — the public trademark site, or the agent portal subdomain.
 *
 * The agent portal lives at agent.trademarx.in and is deliberately not part of the trademark
 * registration product: an agent represents other people's marks and is not a customer filing
 * their own. One Angular build serves both, so something has to tell them apart.
 *
 * Reads the host from the SSR request context on the server and from the URL in the browser. Both
 * halves matter: a browser-only check would still let the server render agent pages under the main
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

  /** True when this request is for the agent portal subdomain. */
  get isAgentHost(): boolean {
    const h = this.host;
    // Prefix match rather than equality so staging and local hosts work too
    // (agent.localhost, agent.staging.trademarx.in).
    return h.startsWith(AGENT_HOST_PREFIX);
  }

  /**
   * Absolute URL of the same path on the other site, for cross-host redirects.
   *
   * Router navigation cannot cross an origin, so moving between the two is a full page load.
   */
  urlOnMainHost(path: string): string {
    const h = this.host.startsWith(AGENT_HOST_PREFIX) ? this.host.slice(AGENT_HOST_PREFIX.length) : this.host;
    return `${this.protocol}//${h}${path}`;
  }

  urlOnAgentHost(path: string): string {
    const h = this.host.startsWith(AGENT_HOST_PREFIX) ? this.host : `${AGENT_HOST_PREFIX}${this.host}`;
    return `${this.protocol}//${h}${path}`;
  }

  private get protocol(): string {
    return isPlatformBrowser(this.platformId) ? window.location.protocol : 'https:';
  }
}

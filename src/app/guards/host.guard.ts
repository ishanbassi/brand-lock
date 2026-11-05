import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../models/auth.services';
import { HostContextService } from '../shared/services/host-context.service';

/**
 * Keeps the agent portal on its own subdomain and off the public trademark site.
 *
 * The two are separate products: the main site sells trademark registration to the person who owns
 * the mark, while the agent portal serves practitioners managing other people's. Mixing them was
 * confusing on its own, and it also meant an agent account could wander into the registration flow.
 *
 * These guards are for routing and presentation only. Authorisation is enforced server-side — the
 * API is shared and a JWT works from any origin, so hostname is not and cannot be a security
 * boundary. See SecurityConfiguration, where agents hold ROLE_AGENT alone and are barred from the
 * member endpoints regardless of which host they arrive from.
 */

/** Allows agent-portal routes only on the agent subdomain. */
export const agentHostGuard: CanActivateFn = () => {
  const hostContext = inject(HostContextService);
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  // The split is a production deployment concern. Locally both applications deliberately share
  // localhost so `ng serve` needs no agent.localhost DNS/hosts-file setup.
  if (!hostContext.requiresAgentSubdomain || hostContext.isAgentHost) {
    return true;
  }

  // Wrong host. Send the browser to the agent site rather than rendering the portal here —
  // a router navigation cannot cross origins, so this has to be a full page load.
  if (isPlatformBrowser(platformId)) {
    window.location.href = hostContext.urlOnAgentHost(window.location.pathname + window.location.search);
    return false;
  }

  // During SSR there is no window to redirect. Refusing the route keeps agent pages from being
  // rendered under the main domain and handed to a crawler.
  return router.createUrlTree(['/not-found']);
};

/**
 * Keeps the agent landing page useful for prospective practitioners while taking a signed-in
 * agent straight to the workspace they came to use. Authentication is stored in browser storage,
 * so SSR deliberately renders the public page and lets the browser make this decision on hydrate.
 */
export const agentHomeGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!isPlatformBrowser(platformId) || !authService.hasValidToken() || !authService.hasRole(['ROLE_AGENT'])) {
    return true;
  }

  return router.createUrlTree(['/agent-portal/dashboard']);
};

/**
 * Keeps the public site off the agent subdomain.
 *
 * Without this, agent.trademarx.in would happily serve the marketing pages, the registration flow
 * and the member portal — duplicating the entire site on a second domain, which is bad for the
 * separation and worse for search (two hosts serving identical content).
 */
export const mainHostGuard: CanActivateFn = () => {
  const hostContext = inject(HostContextService);
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  if (!hostContext.requiresAgentSubdomain || !hostContext.isAgentHost) {
    return true;
  }

  if (isPlatformBrowser(platformId)) {
    const path = window.location.pathname;

    // The bare root is the address an agent actually types. Keep it on the agent product,
    // where practitioners can understand the workspace before signing in.
    if (path === '/' || path === '') {
      return router.createUrlTree(['/agent-home']);
    }

    window.location.href = hostContext.urlOnMainHost(path + window.location.search);
    return false;
  }

  // No window to redirect with during SSR, so refusing the route is what keeps public pages from
  // being rendered under the agent host and handed to a crawler.
  //
  // The agent home is public and independently guarded by the agent host, so it is safe to
  // render it here without falling into the authenticated portal route.
  return router.createUrlTree(['/agent-home']);
};

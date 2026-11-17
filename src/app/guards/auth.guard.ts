import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../models/auth.services';
import { HostContextService } from '../shared/services/host-context.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly hostContext: HostContextService,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let roles = route.data['roles'] as Array<string>;

    const response: any = this.authService.isAuthorizedUser(roles);
    if (roles.includes('ROLE_ANONYMOUS')) {
      if (response.hasAccess) {
        this.router.navigate([this.homeRouteForCurrentUser()]);
        return false;
      }
      return true;
    }
    if (!response.hasAccess) {
      // On the agent subdomain, sending an unauthenticated visitor to '/login' would bounce them
      // off to the main marketing site (that route is behind mainHostGuard) — so someone whose
      // session expired mid-portal would be thrown out of the product entirely. Keep them here.
      // Locally, the portal shares localhost with the public site, so its route (rather than the
      // host) identifies which sign-in screen belongs to an expired agent session.
      const loginRoute = this.hostContext.isAgentHost || state.url.startsWith('/agent-portal') ? 'agent-login' : 'login';
      this.router.navigate([loginRoute], { queryParams: { returnUrl: state.url } });
      return false;
    }
    if (!response.hasRoleAccess) {
      this.router.navigate(['403']);
      return false;
    }
    // The public member, admin, and partner portals are role-exclusive. The seeded admin also
    // carries ROLE_USER (liquibase data/user_authority.csv), so the check above would otherwise
    // wave it into the customer portal — where each endpoint resolves a UserProfile row that
    // admin and partner accounts do not have. Send those users to the portal matching their
    // highest role.
    //
    // Agent access is intentionally additive, though: a staff account can have ROLE_ADMIN,
    // ROLE_USER, and ROLE_AGENT. Once that account has passed the ROLE_AGENT route check, keep it
    // in the agent portal instead of sending it to the admin dashboard merely because admin is
    // its highest role.
    if (state.url.startsWith('/agent-portal')) {
      return true;
    }

    const home = this.homeRouteForCurrentUser();
    if (!state.url.startsWith(`/${home.split('/')[0]}`)) {
      this.router.navigate([home]);
      return false;
    }
    return true;
  }

  /** Landing route for an already-authenticated user, by highest-privilege role. */
  private homeRouteForCurrentUser(): string {
    return this.authService.homeRoute();
  }
}
export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  return inject(PermissionsService).canActivate(next, state);
}

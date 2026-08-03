import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../models/auth.services';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  constructor(private readonly authService: AuthService, private readonly router: Router) {
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
      this.router.navigate(['login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
    if (!response.hasRoleAccess) {
      this.router.navigate(['403']);
      return false;
    }
    // Every route still guarded here is one of the four portal shells, and those are
    // role-exclusive. The seeded admin also carries ROLE_USER (liquibase
    // data/user_authority.csv), so the check above would otherwise wave it into the
    // customer portal — where each endpoint resolves a UserProfile row that admin,
    // agent and partner accounts don't have, so the dashboard 403s and the account
    // chip renders blank. Send them to the portal that matches their highest role.
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

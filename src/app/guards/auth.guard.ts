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
    return true;
  }

  /** Landing route for an already-authenticated user, by highest-privilege role. */
  private homeRouteForCurrentUser(): string {
    if (this.authService.hasRole(['ROLE_ADMIN'])) {
      return 'admin-portal/dashboard';
    }
    if (this.authService.hasRole(['ROLE_AGENT'])) {
      return 'agent-portal/dashboard';
    }
    if (this.authService.hasRole(['ROLE_PARTNER'])) {
      return 'partner-portal/dashboard';
    }
    return 'portal/dashboard';
  }
}
export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  return inject(PermissionsService).canActivate(next, state);
}

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
    let roles = route.data['roles']  as Array<string>;
    
    const response: any = this.authService.isAuthorizedUser(roles);
    if (roles.includes('ROLE_ANONYMOUS')) {
      console.log(response)
      if(response.hasAccess){
        this.router.navigate(['portal/dashboard']);
        return false;
      }
      return true;
    }
    if (!response.hasAccess) {
      this.router.navigate(['account/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
    if (!response.hasRoleAccess) {
      this.router.navigate(['403']);
      return false;
    }
    return true;
  }
}
export const AuthGuard: CanActivateFn = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  return inject(PermissionsService).canActivate(next, state);
}

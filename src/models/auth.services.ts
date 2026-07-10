import { Injectable } from '@angular/core';
import { LocalStorageService } from '../app/shared/services/local-storage.service';
import { IUser } from './user.model';
import { SessionStorageService } from '../app/shared/services/session-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private  readonly localStorageService: LocalStorageService, private readonly sessionStorageService:SessionStorageService) {
  }

  logout() {
    this.localStorageService.remove('token');
    this.localStorageService.remove('user');
    this.localStorageService.remove('userProfile');
    this.sessionStorageService.remove('trademark');
    this.sessionStorageService.remove("initial-onboarding");
  }

  getToken(): any {
    const token: any = this.localStorageService.getObject('token');
    return token;
  }

  getUser(): IUser {
    const user: any = this.localStorageService.getObject('user');
    return user;
  }


  getRoles():Array<{name:string}> {
    const user: any = this.localStorageService.getObject('user');
    if (!user) {
      return new Array<any>();
    }
    return user.authorities;
  }

  getProfilePicture() {
    const user: any = this.localStorageService.getObject('user');
    if (!user.profileImages) {
      return null;
    }
    const profilePic = user.profileImages.find((x: any) => !x.isDeleted);
    return profilePic;
  }

  hasRole(roles: any[]): boolean {
    // Authorities come back as objects ({ name: 'ROLE_ADMIN' }) — matching the
    // AuthGuard's own comparison. Fall back to a plain string just in case.
    const authorities = this.getUser()?.authorities ?? [];
    return roles.some(r => authorities.some((x: any) => (x?.name ?? x) === r));
  }


  /**
   * The JWT itself carries the user's authorities (backend "auth" claim,
   * space-separated) and id ("user_id" claim). Decoding it client-side lets
   * callers know the role immediately after login without a profile fetch —
   * ROLE_ADMIN/ROLE_AGENT accounts have no UserProfile row to fetch.
   */
  decodeToken(token: string): { id?: number; authorities: { name: string }[] } {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      const auth: string = payload.auth ?? '';
      return {
        id: payload.user_id,
        authorities: auth.split(' ').filter(Boolean).map((name: string) => ({ name }))
      };
    } catch {
      return { authorities: [] };
    }
  }

  hasValidToken(): boolean {
    const token: any = this.getToken();
    if (!token) {
      return false;
    }
    return true;
  }

  isAuthorizedUser(roles: Array<string>) {
    if (!this.hasValidToken()) {
      this.localStorageService.remove('token');
      this.localStorageService.remove('user');
    }
    return { hasAccess: this.hasValidToken(), hasRoleAccess: roles.some(x => this.getRoles().some(role => role.name == x))};
  }
}

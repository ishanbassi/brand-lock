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
   * Landing route for the signed-in user, by highest-privilege role — no leading slash.
   * The four portals are role-exclusive, and the seeded admin also carries ROLE_USER,
   * so "highest role wins" is what decides which portal an account belongs to. Shared by
   * the AuthGuard (to redirect out of the wrong portal) and the 403 page (to offer a way
   * back to the right one), so the two can't disagree.
   */
  homeRoute(): string {
    if (this.hasRole(['ROLE_ADMIN'])) {
      return 'admin-portal/dashboard';
    }
    if (this.hasRole(['ROLE_AGENT'])) {
      return 'agent-portal/dashboard';
    }
    if (this.hasRole(['ROLE_PARTNER'])) {
      return 'partner-portal/dashboard';
    }
    return 'portal/dashboard';
  }

  /**
   * Contact details for a logged-in customer, when all three are known —
   * used to skip lead-capture fields the account already has on file.
   * Freshly-created accounts only carry {id, authorities} until the portal
   * fetches the full profile, so this can legitimately return null.
   */
  getKnownContact(): { fullName: string; email: string; phoneNumber: string } | null {
    const user: any = this.getUser();
    if (!user) {
      return null;
    }
    const fullName: string = (user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' ')).trim();
    const email: string | undefined = user.email;
    const phoneNumber: string | undefined = user.phoneNumber;
    if (!fullName || !email || !phoneNumber) {
      return null;
    }
    return { fullName, email, phoneNumber };
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

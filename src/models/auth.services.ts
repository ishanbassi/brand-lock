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
    return roles.some(r => this.getUser().authorities?.some(x => x == r));
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

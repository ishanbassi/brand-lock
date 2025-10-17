import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from '../app/shared/services/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private sessionExpired = false;
  private showExpiredSessionMessage = false;

  constructor(private localStorageService: LocalStorageService, private readonly router: Router) {
  }

  logout() {
    this.localStorageService.remove('token');
    this.localStorageService.remove('user');
    this.localStorageService.remove('userProfile');
  }

  getToken(): any {
    const token: any = this.localStorageService.getObject('token');
    return token;
  }

  getUser(): any {
    const user: any = this.localStorageService.getObject('user');
    return user;
  }


  getRoles() {
    const user: any = this.localStorageService.getObject('user');
    if (!user) {
      return new Array<string>();
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
    // this is used in case user has single role
    //return roles.indexOf(this.getRoles()) !== -1;
    return roles.some(r => this.getUser().authorities.includes(r));
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
    return { hasAccess: this.hasValidToken(), hasRoleAccess: roles.some(x => this.getRoles().indexOf(x) !== -1) };
  }
}

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {

  currentStorage = sessionStorage;
  set(key: string, value: any): boolean {
    try {
      this.currentStorage.setItem(key, value);
      return true;
    } catch (reason) {
      return false;
    }
  }

  get(key: string): any {
    const result = this.currentStorage.getItem(key);
    if (result == null) {
      return null;
    }
    return result;
  }

  setObject(key: string, object: any): boolean {
    this.currentStorage.setItem(key, JSON.stringify(object));
    return true;
  }

  getObject(key: string): any {
    const result = this.currentStorage.getItem(key);
    if (result == null) {
      return null;
    }
    return JSON.parse(result);
  }

  remove(key: string) {
    this.currentStorage.removeItem(key);
  }

  storeAuthenticationToken(authenticationToken: string): void {
    authenticationToken = JSON.stringify(authenticationToken);
    this.clearAuthenticationToken();
    this.currentStorage.setItem('token', authenticationToken);
  }

  clearAuthenticationToken(): void {
    this.currentStorage.removeItem('token');
    this.currentStorage.removeItem('token');
  }

  getAuthenticationToken(): string | null {
    const authenticationToken = localStorage.getItem('token') ?? sessionStorage.getItem('token');
    return authenticationToken ? (JSON.parse(authenticationToken) as string | null) : authenticationToken;
  }
}

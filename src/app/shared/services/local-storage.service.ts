import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  private get storage(): Storage | null {
    if (!this.isBrowser) {
      return null;
    }
    return localStorage;
  }

  set(key: string, value: any): boolean {
    try {
      this.storage?.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  get(key: string): any {
    return this.storage?.getItem(key) ?? null;
  }

  setObject(key: string, object: any): boolean {
    try {
      this.storage?.setItem(key, JSON.stringify(object));
      return true;
    } catch {
      return false;
    }
  }

  getObject(key: string): any {
    const result = this.storage?.getItem(key);
    return result ? JSON.parse(result) : null;
  }

  remove(key: string): void {
    this.storage?.removeItem(key);
  }

  storeAuthenticationToken(authenticationToken: string): void {
    if (!this.isBrowser) return;
    this.clearAuthenticationToken();
    localStorage.setItem('token', JSON.stringify(authenticationToken));
  }

  clearAuthenticationToken(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  }

  getAuthenticationToken(): string | null {
    if (!this.isBrowser) return null;

    const token =
      localStorage.getItem('token') ??
      sessionStorage.getItem('token');

    return token ? JSON.parse(token) : null;
  }
}

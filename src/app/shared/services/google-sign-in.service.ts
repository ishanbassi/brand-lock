import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (configuration: { client_id: string; callback: (response: GoogleCredentialResponse) => void; auto_select: boolean; ux_mode: 'popup' }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
        };
      };
    };
  }
}

export interface GoogleCredentialResponse {
  credential: string;
}

/** Loads and hosts the browser-only Google Identity Services button. */
@Injectable({ providedIn: 'root' })
export class GoogleSignInService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private loadPromise?: Promise<void>;

  get configured(): boolean {
    return Boolean(environment.googleClientId?.trim());
  }

  async renderButton(parent: HTMLElement, onCredential: (credential: string) => void): Promise<void> {
    if (!this.configured || !isPlatformBrowser(this.platformId)) return;
    await this.loadLibrary();

    const identity = window.google?.accounts?.id;
    if (!identity) throw new Error('Google sign-in could not be loaded.');

    parent.replaceChildren();
    identity.initialize({
      client_id: environment.googleClientId,
      callback: response => onCredential(response.credential),
      auto_select: false,
      ux_mode: 'popup',
    });
    identity.renderButton(parent, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: parent.clientWidth || 320,
    });
  }

  private loadLibrary(): Promise<void> {
    if (window.google?.accounts?.id) return Promise.resolve();
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve, reject) => {
      const existing = this.document.getElementById('google-identity-services') as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Google sign-in could not be loaded.')), { once: true });
        return;
      }

      const script = this.document.createElement('script');
      script.id = 'google-identity-services';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Google sign-in could not be loaded.'));
      this.document.head.appendChild(script);
    });
    return this.loadPromise;
  }
}

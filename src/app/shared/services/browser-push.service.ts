import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface BrowserPushConfig {
  enabled: boolean;
  publicKey?: string;
}

interface BrowserPushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

/**
 * Owns browser permission and the device subscription, never the notification preferences.
 *
 * <p>Permission is requested only from {@link enable}, which is called by a real settings click.
 * Browsers increasingly reject permission prompts raised during startup, and a surprise prompt is
 * a poor experience even where they do not.
 */
@Injectable({ providedIn: 'root' })
export class BrowserPushService {
  private readonly base = `${environment.BaseApiUrl}api/notifications/browser-push`;
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  readonly supported = signal(false);
  readonly permission = signal<NotificationPermission | 'unsupported'>('unsupported');
  readonly subscribed = signal(false);
  readonly busy = signal(false);
  readonly error = signal<string | null>(null);

  async refreshStatus(): Promise<void> {
    if (!this.browserAvailable()) {
      return;
    }
    this.supported.set(true);
    this.permission.set(Notification.permission);

    try {
      const registration = await navigator.serviceWorker.getRegistration('/push-worker.js');
      this.subscribed.set(Boolean(registration && (await registration.pushManager.getSubscription())));
    } catch {
      // A worker can be unavailable in a private or hardened browser. Keep the settings useful.
      this.subscribed.set(false);
    }
  }

  /** Registers the worker, asks for permission, and persists this device's subscription. */
  async enable(): Promise<boolean> {
    if (!this.browserAvailable()) {
      this.error.set('Browser alerts are not supported in this browser.');
      return false;
    }

    this.busy.set(true);
    this.error.set(null);
    try {
      const permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
      this.permission.set(permission);
      if (permission !== 'granted') {
        this.error.set(permission === 'denied' ? 'Browser alerts are blocked in this browser.' : 'Allow browser alerts to turn this on.');
        return false;
      }

      const config = await firstValueFrom(this.http.get<BrowserPushConfig>(`${this.base}/config`));
      if (!config.enabled || !config.publicKey) {
        this.error.set('Browser alerts are not configured for this environment yet.');
        return false;
      }

      const registration = await navigator.serviceWorker.register('/push-worker.js', { scope: '/' });
      await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription() ?? await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.base64UrlToUint8Array(config.publicKey),
      });

      await firstValueFrom(this.http.put<void>(`${this.base}/subscriptions`, this.subscriptionPayload(subscription)));
      this.subscribed.set(true);
      return true;
    } catch {
      this.error.set('Browser alerts could not be enabled. Please try again.');
      return false;
    } finally {
      this.busy.set(false);
    }
  }

  /** Disconnects this browser from the account. Browser permission itself is controlled by the browser. */
  async disable(): Promise<void> {
    if (!this.browserAvailable()) {
      return;
    }
    this.busy.set(true);
    this.error.set(null);
    try {
      const registration = await navigator.serviceWorker.getRegistration('/push-worker.js');
      const subscription = registration ? await registration.pushManager.getSubscription() : null;
      if (subscription) {
        await firstValueFrom(this.http.delete<void>(`${this.base}/subscriptions`, { body: this.subscriptionPayload(subscription) }));
        await subscription.unsubscribe();
      }
      this.subscribed.set(false);
    } catch {
      this.error.set('Browser alerts could not be disconnected. Please try again.');
    } finally {
      this.busy.set(false);
    }
  }

  private browserAvailable(): boolean {
    return isPlatformBrowser(this.platformId) && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }

  private subscriptionPayload(subscription: PushSubscription): BrowserPushSubscriptionPayload {
    const json = subscription.toJSON();
    const p256dh = json.keys?.['p256dh'];
    const auth = json.keys?.['auth'];
    if (!subscription.endpoint || !p256dh || !auth) {
      throw new Error('Incomplete PushSubscription');
    }
    return { endpoint: subscription.endpoint, keys: { p256dh, auth } };
  }

  private base64UrlToUint8Array(value: string): Uint8Array {
    const normalized = `${value}${'='.repeat((4 - (value.length % 4)) % 4)}`.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(normalized);
    return Uint8Array.from(binary, character => character.charCodeAt(0));
  }
}

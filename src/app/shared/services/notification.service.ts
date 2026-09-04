import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AppNotification,
  NotificationCategory,
  NotificationChannel,
  NotificationMode,
  NotificationPage,
  NotificationPreferenceRow,
  NotificationSummary,
} from '../../../models/notification.model';

/**
 * The notification feed, and the polling that keeps the bell current.
 *
 * <p>Polling rather than a WebSocket, deliberately. There is no STOMP or WebSocket dependency in
 * the backend, the live-refresh feature already set the precedent of polling, and production is a
 * 2 GB box — a socket layer to keep one badge current is not a trade worth making.
 *
 * <p>Two guards make that polling cheap. It only runs while the tab is visible, so a browser with
 * twenty background tabs open is not twenty requests a minute; and it never starts during
 * server-side rendering, where an interval would keep the SSR request alive and hang prerendering.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly base = `${environment.BaseApiUrl}api/notifications`;

  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  /** Drives the badge. Shared by the bell and the notifications page. */
  readonly unreadCount = signal(0);
  readonly latest = signal<AppNotification[]>([]);

  private pollHandle: ReturnType<typeof setInterval> | null = null;
  private visibilityListener: (() => void) | null = null;

  /** 60s. Fast enough that the bell is not visibly stale, slow enough to stay a rounding error. */
  private static readonly POLL_MS = 60_000;

  /**
   * Begins polling. Safe to call more than once — the shell mounts once, but a hot reload or a
   * second subscriber must not end up with two intervals racing the same signal.
   */
  startPolling(): void {
    if (!isPlatformBrowser(this.platformId) || this.pollHandle !== null) {
      return;
    }

    this.refreshSummary();

    this.pollHandle = setInterval(() => {
      if (this.document.visibilityState === 'visible') {
        this.refreshSummary();
      }
    }, NotificationService.POLL_MS);

    // Coming back to the tab should not mean waiting out the rest of the interval.
    this.visibilityListener = () => {
      if (this.document.visibilityState === 'visible') {
        this.refreshSummary();
      }
    };
    this.document.addEventListener('visibilitychange', this.visibilityListener);

    this.destroyRef.onDestroy(() => this.stopPolling());
  }

  stopPolling(): void {
    if (this.pollHandle !== null) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
    if (this.visibilityListener) {
      this.document.removeEventListener('visibilitychange', this.visibilityListener);
      this.visibilityListener = null;
    }
  }

  refreshSummary(): void {
    this.http.get<NotificationSummary>(`${this.base}/summary`).subscribe({
      next: summary => {
        this.unreadCount.set(summary.unreadCount ?? 0);
        this.latest.set(summary.items ?? []);
      },
      // A failed poll is not worth telling the user about; the next tick tries again.
      error: () => undefined,
    });
  }

  list(options: { category?: NotificationCategory | null; unreadOnly?: boolean; page?: number; size?: number } = {}): Observable<NotificationPage> {
    const params: Record<string, string> = {
      page: String(options.page ?? 0),
      size: String(options.size ?? 20),
      unreadOnly: String(options.unreadOnly ?? false),
    };
    if (options.category) {
      params['category'] = options.category;
    }
    return this.http.get<NotificationPage>(this.base, { params });
  }

  markRead(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/read`, {});
  }

  markAllRead(): Observable<{ updated: number }> {
    return this.http.post<{ updated: number }>(`${this.base}/read-all`, {});
  }

  dismiss(id: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${id}/dismiss`, {});
  }

  getPreferences(): Observable<NotificationPreferenceRow[]> {
    return this.http.get<NotificationPreferenceRow[]>(`${this.base}/preferences`);
  }

  setPreference(category: NotificationCategory, channel: NotificationChannel, mode: NotificationMode): Observable<void> {
    return this.http.put<void>(`${this.base}/preferences`, { category, channel, mode });
  }
}

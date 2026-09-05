import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { IconComponent } from '../ui/icon.component';
import { Router } from '@angular/router';
import {
  AppNotification,
  NotificationCategory,
  NotificationChannel,
  NotificationMode,
  NotificationPreferenceRow,
} from '../../../models/notification.model';
import { NotificationService } from '../../shared/services/notification.service';

interface CategoryTab {
  key: NotificationCategory | null;
  label: string;
}

@Component({
  selector: 'app-agent-notifications',
  standalone: true,
  imports: [IconComponent, CommonModule],
  templateUrl: './agent-notifications.component.html',
  styleUrl: './agent-notifications.component.scss',
})
export class AgentNotificationsComponent implements OnInit {
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly tabs: CategoryTab[] = [
    { key: null, label: 'All' },
    { key: 'WATCH', label: 'Watch' },
    { key: 'DOCKET', label: 'Deadlines' },
    { key: 'PORTFOLIO', label: 'Portfolio' },
    { key: 'AI', label: 'Drafts' },
    { key: 'DOCUMENT', label: 'Documents' },
    { key: 'ACCOUNT', label: 'Account' },
  ];

  /** Rows the preference grid renders, in the order they matter to an agent. */
  readonly preferenceCategories: { key: NotificationCategory; label: string; hint: string }[] = [
    { key: 'DOCKET', label: 'Deadlines', hint: 'Docket reminders and overdue dates' },
    { key: 'WATCH', label: 'Watch', hint: 'Journal conflicts, new filings, competitors' },
    { key: 'PORTFOLIO', label: 'Portfolio', hint: 'Imports, claims, status changes, renewals' },
    { key: 'AI', label: 'Drafts', hint: 'Generated replies and letters' },
    { key: 'DOCUMENT', label: 'Documents', hint: 'Archiving and storage' },
    { key: 'ACCOUNT', label: 'Account', hint: 'Approval and allowances' },
  ];

  readonly modes: { value: NotificationMode; label: string }[] = [
    { value: 'INSTANT', label: 'As it happens' },
    { value: 'DAILY_DIGEST', label: 'Daily digest' },
    { value: 'OFF', label: 'Off' },
  ];

  readonly view = signal<'feed' | 'settings'>('feed');
  readonly activeTab = signal<NotificationCategory | null>(null);
  readonly unreadOnly = signal(false);

  readonly items = signal<AppNotification[]>([]);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly unreadCount = this.notifications.unreadCount;

  readonly preferences = signal<NotificationPreferenceRow[]>([]);
  readonly savingPreference = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  // ── Feed ─────────────────────────────────────────────────────────────────

  load(page = 0): void {
    this.loading.set(true);
    this.notifications.list({ category: this.activeTab(), unreadOnly: this.unreadOnly(), page }).subscribe({
      next: result => {
        this.items.set(result.items ?? []);
        this.page.set(page);
        this.totalPages.set(result.totalPages ?? 0);
        this.notifications.unreadCount.set(result.unreadCount ?? 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  selectTab(key: NotificationCategory | null): void {
    this.activeTab.set(key);
    this.load();
  }

  toggleUnreadOnly(): void {
    this.unreadOnly.set(!this.unreadOnly());
    this.load();
  }

  /**
   * Marks read and follows the link.
   *
   * <p>The row is updated locally rather than by reloading the list: a reload with the "unread
   * only" filter on would make the row the user just clicked vanish from under them.
   */
  activate(item: AppNotification): void {
    if (!item.read) {
      this.markRead(item);
    }
    if (item.actionUrl) {
      const [path, query] = item.actionUrl.split('?');
      const queryParams = query ? Object.fromEntries(new URLSearchParams(query)) : {};
      void this.router.navigate([path], { queryParams });
    }
  }

  markRead(item: AppNotification): void {
    this.notifications.markRead(item.id).subscribe({
      next: () => {
        this.items.update(list => list.map(n => (n.id === item.id ? { ...n, read: true } : n)));
        this.notifications.refreshSummary();
      },
      error: () => undefined,
    });
  }

  markAllRead(): void {
    this.notifications.markAllRead().subscribe({
      next: () => {
        this.items.update(list => list.map(n => ({ ...n, read: true })));
        this.notifications.refreshSummary();
      },
      error: () => undefined,
    });
  }

  dismiss(item: AppNotification, event: MouseEvent): void {
    event.stopPropagation();
    this.notifications.dismiss(item.id).subscribe({
      next: () => {
        this.items.update(list => list.filter(n => n.id !== item.id));
        this.notifications.refreshSummary();
      },
      error: () => undefined,
    });
  }

  // ── Settings ─────────────────────────────────────────────────────────────

  showSettings(): void {
    this.view.set('settings');
    if (this.preferences().length === 0) {
      this.notifications.getPreferences().subscribe({
        next: rows => this.preferences.set(rows ?? []),
        error: () => undefined,
      });
    }
  }

  showFeed(): void {
    this.view.set('feed');
  }

  modeFor(category: NotificationCategory, channel: NotificationChannel): NotificationMode {
    const row = this.preferences().find(r => r.category === category);
    return row ? row[channel] : 'OFF';
  }

  setMode(category: NotificationCategory, channel: NotificationChannel, mode: NotificationMode): void {
    const key = `${category}:${channel}`;
    this.savingPreference.set(key);

    // Updated locally first: the control has to respond to the click immediately, and a failed
    // save reverts on the next load rather than blocking the UI on a round trip.
    this.preferences.update(rows => rows.map(r => (r.category === category ? { ...r, [channel]: mode } : r)));

    this.notifications.setPreference(category, channel, mode).subscribe({
      next: () => this.savingPreference.set(null),
      error: () => this.savingPreference.set(null),
    });
  }

  /**
   * True where turning a category off means silencing a statutory deadline.
   *
   * <p>Not blocked — an agent may genuinely run their docket elsewhere — but it is said plainly
   * beside the control, because the consequence of this particular switch is a missed date.
   */
  isRiskyToDisable(category: NotificationCategory): boolean {
    return category === 'DOCKET' || category === 'WATCH';
  }

  timeAgo(iso: string): string {
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return '';

    const minutes = Math.floor((Date.now() - then) / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(then).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}

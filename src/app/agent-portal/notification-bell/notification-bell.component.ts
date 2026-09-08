import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { IconComponent } from '../ui/icon.component';
import { Router, RouterModule } from '@angular/router';
import { AppNotification } from '../../../models/notification.model';
import { NotificationService } from '../../shared/services/notification.service';

/**
 * The bell in the portal topbar: unread count, and the newest few behind it.
 *
 * <p>Reads the shared signals on {@link NotificationService} rather than fetching its own data, so
 * the badge, the dropdown and the notifications page never disagree about the count.
 */
@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [IconComponent, CommonModule, RouterModule],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss',
})
export class NotificationBellComponent {
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly open = signal(false);
  readonly unreadCount = this.notifications.unreadCount;
  readonly items = this.notifications.latest;

  toggle(): void {
    const next = !this.open();
    this.open.set(next);
    if (next) {
      // The dropdown is the one place a stale count is actually visible, so refresh on open
      // rather than showing whatever the last poll left behind.
      this.notifications.refreshSummary();
    }
  }

  /** Clicking anywhere else closes it — the usual expectation for a dropdown of this kind. */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }

  /**
   * Marks the notification read, then follows its link.
   *
   * <p>Navigation does not wait on the read call: the row is already open in front of the user, and
   * making them watch a spinner because a bookkeeping request is slow would be the wrong trade. A
   * failed mark-read simply leaves it unread, which the next click corrects.
   */
  activate(item: AppNotification): void {
    this.open.set(false);

    if (!item.read) {
      this.notifications.markRead(item.id).subscribe({
        next: () => this.notifications.refreshSummary(),
        error: () => undefined,
      });
    }
    if (item.actionUrl) {
      const [path, query] = item.actionUrl.split('?');
      const queryParams = query ? Object.fromEntries(new URLSearchParams(query)) : {};
      void this.router.navigate([path], { queryParams });
    }
  }

  markAllRead(event: MouseEvent): void {
    event.stopPropagation();
    this.notifications.markAllRead().subscribe({
      next: () => this.notifications.refreshSummary(),
      error: () => undefined,
    });
  }

  /**
   * Clears one notification from the dropdown.
   *
   * <p>Dropped from the shared feed signal straight away so the row leaves under the cursor, then
   * reconciled with the server. A failed dismiss simply reappears on the next summary refresh.
   */
  dismiss(item: AppNotification, event: MouseEvent): void {
    event.stopPropagation();
    this.notifications.latest.update(list => list.filter(n => n.id !== item.id));
    this.notifications.dismiss(item.id).subscribe({
      next: () => this.notifications.refreshSummary(),
      error: () => this.notifications.refreshSummary(),
    });
  }

  /** Compact relative time. Long enough ago and the exact minute stops being what anyone wants. */
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
    return new Date(then).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
}

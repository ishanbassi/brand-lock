export type NotificationSeverity = 'INFO' | 'ACTION_REQUIRED' | 'URGENT';

export type NotificationCategory = 'WATCH' | 'DOCKET' | 'AI' | 'PORTFOLIO' | 'DOCUMENT' | 'ACCOUNT' | 'SYSTEM';

export type NotificationChannel = 'IN_APP' | 'EMAIL';

export type NotificationMode = 'INSTANT' | 'DAILY_DIGEST' | 'OFF';

export interface AppNotification {
  id: number;
  category: NotificationCategory;
  type: string;
  severity: NotificationSeverity;
  title: string;
  body?: string;
  /** Portal-relative path. Never an absolute URL — routed with routerLink, not href. */
  actionUrl?: string;
  entityType?: string;
  entityId?: number;
  groupKey?: string;
  read: boolean;
  createdDate: string;
}

export interface NotificationSummary {
  unreadCount: number;
  items: AppNotification[];
}

export interface NotificationPage {
  items: AppNotification[];
  totalElements: number;
  totalPages: number;
  unreadCount: number;
}

/** One row of the preference grid: a category and its mode on each channel. */
export interface NotificationPreferenceRow {
  category: NotificationCategory;
  IN_APP: NotificationMode;
  EMAIL: NotificationMode;
}

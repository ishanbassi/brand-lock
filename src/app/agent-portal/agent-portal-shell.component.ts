import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../models/auth.services';
import { NotificationBellComponent } from './notification-bell/notification-bell.component';
import { NotificationService } from '../shared/services/notification.service';
import { AgentDataService, DeadlineCounts } from '../shared/services/agent-data.service';
import { IconComponent, IconName } from './ui/icon.component';

/** A count a nav row can carry; names a field of {@link DeadlineCounts}. */
type BadgeKey = keyof DeadlineCounts;

/** A badge as drawn: the count, how loud it is, and what it counts for a screen reader. */
interface NavBadge {
  count: number;
  /** Alert is for things already late; neutral is for things coming up. */
  tone: 'alert' | 'neutral';
  srLabel: string;
}

const BADGES: Record<BadgeKey, Omit<NavBadge, 'count'>> = {
  overdueRenewals: { tone: 'alert', srLabel: 'overdue' },
  hearingsThisWeek: { tone: 'neutral', srLabel: 'this week' },
};

/** A single destination. */
interface NavLeaf {
  label: string;
  icon: IconName;
  route: string;
  /**
   * Other routes that highlight this entry. For screens with no nav entry of their own that are
   * reached from this one - Find my marks and Import Excel are buttons on Add Trademark, so while
   * the agent is on them, Add Trademark is where they are.
   */
  alsoMatches?: string[];
  badge?: BadgeKey;
}

/**
 * A nav entry: either a destination of its own, or a group of them.
 *
 * A group deliberately has no route. Making the header both a link and a disclosure gives one
 * control two meanings, and the click that was meant to reveal the children navigates away
 * instead — so the group's own overview is listed as its first child.
 */
interface NavItem {
  label: string;
  icon: IconName;
  /** Present on leaves only. */
  route?: string;
  alsoMatches?: string[];
  badge?: BadgeKey;
  /** Present on groups only; stable key for the expanded/collapsed state. */
  id?: string;
  children?: NavLeaf[];
}

/** A labelled run of related entries. Headings name a kind of work, never a destination. */
interface NavSection {
  heading: string;
  items: NavItem[];
}

@Component({
  selector: 'app-agent-portal-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationBellComponent, IconComponent],
  templateUrl: './agent-portal-shell.component.html',
  styleUrl: './agent-portal-shell.component.scss',
})
export class AgentPortalShellComponent {
  sidebarCollapsed = signal(false);
  activeRoute = signal('');
  expandedGroups = signal<Set<string>>(new Set());

  /**
   * The portal's features, in labelled sections.
   *
   * Sections replaced the old top-level disclosures (My Portfolio, Trademark watch): a heading
   * groups related work without costing a click, so disclosures are kept for the one place a
   * sub-tree genuinely helps - renewals, which split into two worklists. Every feature keeps a nav
   * link; new ones join the section they belong to, and anything that acts on the portfolio goes
   * under Portfolio. Account screens are the exception - notifications and the profile are
   * reached from the topbar icons instead.
   */
  navSections: NavSection[] = [
    {
      heading: 'Overview',
      items: [{ label: 'Dashboard', icon: 'dashboard', route: '/agent-portal/dashboard' }],
    },
    {
      heading: 'Portfolio',
      // Two entries only. Find my marks and Import Excel are alternative ways of adding, so they
      // are buttons at the top of Add Trademark rather than three nav peers for one job.
      items: [
        { label: 'All trademarks', icon: 'portfolio', route: '/agent-portal/portfolio' },
        {
          label: 'Add trademark',
          icon: 'plus',
          route: '/agent-portal/portfolio/add',
          alsoMatches: ['/agent-portal/portfolio/claim', '/agent-portal/portfolio/upload'],
        },
      ],
    },
    {
      // Time-critical: marks advertised in a journal are open to opposition for four months, and
      // that window closes whether or not anyone checked. It belongs in the nav, not buried.
      heading: 'Watch',
      items: [
        { label: 'Journal watch', icon: 'journal', route: '/agent-portal/watch/journal' },
        // Was reachable only from the nightly digest email, so an agent who deleted the mail had
        // no way back to it.
        { label: 'Portfolio conflicts', icon: 'alert', route: '/agent-portal/watch/conflicts' },
        // Follows rival firms, not marks against the agent's portfolio. The route stays under
        // watch/ so existing links keep working.
        { label: 'Competitors', icon: 'building', route: '/agent-portal/watch/competitors' },
      ],
    },
    {
      // Sits under Watch: both answer "what needs me, and when". The calendar is everything at
      // once; the entries below it are worklists cut from the same data, one job each.
      heading: 'Deadlines',
      items: [
        { label: 'Calendar', icon: 'calendar', route: '/agent-portal/deadlines' },
        {
          label: 'Renewals',
          icon: 'refresh',
          id: 'renewals',
          children: [
            { label: 'Upcoming', icon: 'clock', route: '/agent-portal/deadlines/renewals/upcoming' },
            { label: 'Overdue', icon: 'alert', route: '/agent-portal/deadlines/renewals/overdue', badge: 'overdueRenewals' },
          ],
        },
        // No "overdue" twin: a hearing is a listing, not a task, so it is never late.
        { label: 'Upcoming hearings', icon: 'scales', route: '/agent-portal/deadlines/hearings', badge: 'hearingsThisWeek' },
      ],
    },
    {
      heading: 'Workspace',
      items: [
        { label: 'Search report', icon: 'search', route: '/agent-portal/reports/search' },
        { label: 'Documents', icon: 'documents', route: '/agent-portal/documents' },
      ],
    },
    // Notifications and My profile are deliberately absent: both are reached from the topbar
    // icons, and listing them here gave each screen two entry points that had to agree.
  ];

  private readonly navItems: NavItem[] = this.navSections.flatMap(s => s.items);

  /** Every destination in the nav, groups flattened away — the input to active-route matching. */
  private readonly leaves: NavLeaf[] = this.navItems.flatMap(
    i => i.children ?? (i.route ? [{ label: i.label, icon: i.icon, route: i.route, alsoMatches: i.alsoMatches }] : []),
  );

  /**
   * The one route to highlight: the most specific nav destination the URL matches.
   *
   * A plain startsWith lights up All Trademarks as well as Add Trademark whenever the URL is
   * /portfolio/add, because one route is a prefix of the other - and the same holds for Calendar
   * under every /deadlines/... worklist. Specificity is judged on the path that matched, so an
   * alsoMatches route beats its parent the same way a route does.
   */
  private readonly bestMatch = computed(() => {
    const url = this.activeRoute().split(/[?#]/)[0];
    let best: { route: string; length: number } | null = null;
    for (const leaf of this.leaves) {
      for (const path of [leaf.route, ...(leaf.alsoMatches ?? [])]) {
        if ((url === path || url.startsWith(path + '/')) && (!best || path.length > best.length)) {
          best = { route: leaf.route, length: path.length };
        }
      }
    }
    return best?.route ?? null;
  });

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly notifications: NotificationService,
    private readonly agentData: AgentDataService,
  ) {
    // Started here rather than in the bell so the badge is current the moment the portal opens,
    // and so it survives the bell being re-created by a route change.
    this.notifications.startPolling();
    // Fills the sidebar's firm name. Failure is silent: a missing name falls back to the portal's
    // own label, and blocking the shell on it would leave the whole portal behind a spinner.
    this.agentData.getProfile().subscribe({ error: () => {} });
    // Same reasoning for the deadline badges: a hint, fetched once, never a gate.
    this.agentData.refreshDeadlineCounts();
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.activeRoute.set(e.urlAfterRedirects);
      this.revealActiveGroup();
    });
    this.activeRoute.set(this.router.url);
    this.revealActiveGroup();
  }

  isActive(route: string): boolean {
    return this.bestMatch() === route;
  }

  /**
   * Highlights the topbar's profile icon. Matched against the URL directly rather than through
   * bestMatch(), which only knows the routes still listed in the nav.
   */
  readonly onProfile = computed(() => this.activeRoute().startsWith('/agent-portal/profile'));

  /** Whether the screen being shown is one of this group's children. */
  isGroupActive(item: NavItem): boolean {
    const match = this.bestMatch();
    return !!match && !!item.children?.some(c => c.route === match);
  }

  isExpanded(item: NavItem): boolean {
    return !!item.id && this.expandedGroups().has(item.id);
  }

  /** Zero draws nothing: a row of "0" pills is noise, and it would teach agents to ignore the badge. */
  badgeFor(key?: BadgeKey): NavBadge | null {
    const count = key ? this.agentData.deadlineCounts()?.[key] ?? 0 : 0;
    return key && count > 0 ? { count, ...BADGES[key] } : null;
  }

  /**
   * A row's badge. A closed group rolls its children's counts up onto its header, because a
   * collapsed Renewals must not hide that something under it is overdue. Open, the children show
   * their own and the header stays quiet, so no count is drawn twice.
   */
  itemBadge(item: NavItem): NavBadge | null {
    if (!item.children) {
      return this.badgeFor(item.badge);
    }
    if (this.isExpanded(item) && !this.sidebarCollapsed()) {
      return null;
    }
    const badges = item.children.map(c => this.badgeFor(c.badge)).filter((b): b is NavBadge => !!b);
    if (badges.length === 0) {
      return null;
    }
    const alert = badges.filter(b => b.tone === 'alert');
    // Only the loudest tone is summed, so "3" on a red pill always means three late things.
    const shown = alert.length ? alert : badges;
    return { count: shown.reduce((n, b) => n + b.count, 0), tone: shown[0].tone, srLabel: shown[0].srLabel };
  }

  /** The collapsed rail has no room for a number, so only an alert survives - as a dot on the icon. */
  collapsedDot(item: NavItem): NavBadge | null {
    const badge = this.itemBadge(item);
    return badge?.tone === 'alert' ? badge : null;
  }

  toggleGroup(item: NavItem): void {
    if (!item.id) return;
    // Collapsed, there is no room to draw children, so opening a group expands the rail first
    // rather than toggling something the agent cannot see.
    if (this.sidebarCollapsed()) {
      this.sidebarCollapsed.set(false);
      this.expandedGroups.update(set => new Set(set).add(item.id!));
      return;
    }
    this.expandedGroups.update(set => {
      const next = new Set(set);
      if (!next.delete(item.id!)) next.add(item.id!);
      return next;
    });
  }

  /**
   * Opens whichever group owns the current screen.
   *
   * Only ever opens. Closing the others would fight an agent who deliberately opened two groups to
   * compare them, and arriving on a screen whose own nav entry is hidden is disorienting.
   */
  private revealActiveGroup(): void {
    const match = this.bestMatch();
    if (!match) return;
    const owner = this.navItems.find(i => i.children?.some(c => c.route === match));
    if (owner?.id) {
      this.expandedGroups.update(set => new Set(set).add(owner.id!));
    }
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * The firm the agent signed up as, which is how they think of the account — their own name is
   * on the profile screen. Falls back to the portal's label while the profile is still loading,
   * or for an account that gave no company name at onboarding.
   */
  readonly firmName = computed(() => this.agentData.agentProfile()?.companyName?.trim() || 'Agent Portal');

  /** Initials for the sidebar avatar, taken from whichever name the pill is showing. */
  readonly agentInitials = computed(() => {
    const company = this.agentData.agentProfile()?.companyName?.trim();
    const source = company || this.personalName();
    const initials = source
      .split(/\s+/)
      .filter(Boolean)
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return initials || 'AG';
  });

  private personalName(): string {
    const user = this.authService.getUser();
    if (!user) return '';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }
}

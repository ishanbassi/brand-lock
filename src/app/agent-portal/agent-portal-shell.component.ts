import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../models/auth.services';
import { NotificationBellComponent } from './notification-bell/notification-bell.component';
import { NotificationService } from '../shared/services/notification.service';
import { AgentDataService } from '../shared/services/agent-data.service';
import { IconComponent, IconName } from './ui/icon.component';

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
  /** Present on groups only; stable key for the expanded/collapsed state. */
  id?: string;
  children?: NavLeaf[];
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
   * The portal's features, grouped.
   *
   * Everything that acts on the portfolio — finding marks, importing them, adding one — now sits
   * under My Portfolio rather than alongside it. Flat, they read as six peers of Dashboard when
   * five of them are ways into the same collection, and the list grew unreadable as features
   * landed. Every feature keeps a nav link; new ones join the group they belong to, or become a
   * top-level entry of their own when they are not about the portfolio. Account screens are the
   * exception - notifications and the profile are reached from the topbar icons instead.
   */
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/agent-portal/dashboard' },
    {
      label: 'My Portfolio',
      icon: 'portfolio',
      id: 'portfolio',
      // Two entries only. Find my marks and Import Excel are alternative ways of adding, so they
      // are buttons at the top of Add Trademark rather than three nav peers for one job.
      children: [
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
      label: 'Trademark watch',
      icon: 'watch',
      id: 'watch',
      children: [
        { label: 'Journal watch',       icon: 'journal', route: '/agent-portal/watch/journal' },
        // Was reachable only from the nightly digest email, so an agent who deleted the mail had
        // no way back to it.
        { label: 'Portfolio conflicts', icon: 'alert',   route: '/agent-portal/watch/conflicts' },
      ],
    },
    // Its own entry rather than a watch child: it follows rival firms, not marks against the
    // agent's portfolio. The route stays under watch/ so existing links keep working.
    { label: 'Competitors',   icon: 'building',  route: '/agent-portal/watch/competitors' },
    // Deadlines sits close under the watch group: both answer "what needs me, and when".
    { label: 'Deadlines',     icon: 'calendar',  route: '/agent-portal/deadlines' },
    { label: 'Search report', icon: 'search',    route: '/agent-portal/reports/search' },
    { label: 'Documents',     icon: 'documents', route: '/agent-portal/documents' },
    // Notifications and My profile are deliberately absent: both are reached from the topbar
    // icons, and listing them here gave each screen two entry points that had to agree.
  ];

  /** Every destination in the nav, groups flattened away — the input to active-route matching. */
  private readonly leaves: NavLeaf[] = this.navItems.flatMap(i =>
    i.children ?? (i.route ? [{ label: i.label, icon: i.icon, route: i.route }] : []),
  );

  /**
   * The one route to highlight: the most specific nav destination the URL matches.
   *
   * A plain startsWith lights up All Trademarks as well as Add Trademark whenever the URL is
   * /portfolio/add, because one route is a prefix of the other. Specificity is judged on the path
   * that matched, so an alsoMatches route beats its parent the same way a route does.
   */
  private readonly bestMatch = computed(() => {
    const url = this.activeRoute();
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

  /** A group is highlighted when the screen being shown is one of its children. */
  isGroupActive(item: NavItem): boolean {
    const match = this.bestMatch();
    return !!match && !!item.children?.some(c => c.route === match);
  }

  isExpanded(item: NavItem): boolean {
    return !!item.id && this.expandedGroups().has(item.id);
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

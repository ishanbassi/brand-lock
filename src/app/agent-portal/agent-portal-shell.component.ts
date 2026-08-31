import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../models/auth.services';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-agent-portal-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agent-portal-shell.component.html',
  styleUrl: './agent-portal-shell.component.scss',
})
export class AgentPortalShellComponent {
  sidebarCollapsed = signal(false);
  activeRoute = signal('');

  navItems: NavItem[] = [
    { label: 'Dashboard',        icon: '📊', route: '/agent-portal/dashboard' },
    { label: 'My Portfolio',     icon: '📂', route: '/agent-portal/portfolio' },
    // Time-critical: marks advertised in a journal are open to opposition for four months, and
    // that window closes whether or not anyone checked. It belongs in the nav, not buried.
    { label: 'Trademark Watch',  icon: '🛡️', route: '/agent-portal/watch/journal' },
    { label: 'Find My Marks',    icon: '🔎', route: '/agent-portal/portfolio/claim' },
    { label: 'Import Excel',     icon: '📤', route: '/agent-portal/portfolio/upload' },
    { label: 'Add Trademark',    icon: '➕', route: '/agent-portal/portfolio/add' },
    { label: 'My Profile',       icon: '👤', route: '/agent-portal/profile' },
  ];

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.activeRoute.set(e.urlAfterRedirects);
    });
    this.activeRoute.set(this.router.url);
  }

  /**
   * Highlights the most specific matching nav item, not every one that happens to be a prefix.
   *
   * A plain startsWith lights up "My Portfolio" as well as "Import Excel" whenever the URL is
   * /portfolio/upload, because one route is a prefix of the other. With Find My Marks and the
   * upload and add screens all living under /portfolio, that would be three highlighted at once.
   */
  isActive(route: string): boolean {
    const url = this.activeRoute();
    const matches = this.navItems.filter(i => url === i.route || url.startsWith(i.route + '/')).map(i => i.route);
    if (matches.length === 0) return false;
    const longest = matches.reduce((a, b) => (b.length > a.length ? b : a));
    return route === longest;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get agentInitials(): string {
    const user = this.authService.getUser();
    if (!user) return 'A';
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'AG';
  }
}

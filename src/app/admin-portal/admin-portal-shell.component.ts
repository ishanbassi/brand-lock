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

/**
 * Shell for the ROLE_ADMIN admin portal: collapsible sidebar + routed content.
 * Mirrors the agent-portal shell so the two internal apps look and behave alike.
 */
@Component({
  selector: 'app-admin-portal-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-portal-shell.component.html',
  styleUrl: './admin-portal-shell.component.scss',
})
export class AdminPortalShellComponent {
  sidebarCollapsed = signal(false);
  activeRoute = signal('');

  navItems: NavItem[] = [
    { label: 'Dashboard',    icon: '📊', route: '/admin-portal/dashboard' },
    { label: 'Leads',        icon: '🎯', route: '/admin-portal/leads' },
    { label: 'Applications', icon: '™️', route: '/admin-portal/trademarks' },
    { label: 'Documents',    icon: '📄', route: '/admin-portal/documents' },
    { label: 'Payments',     icon: '💳', route: '/admin-portal/payments' },
    { label: 'Agents',       icon: '🧑‍⚖️', route: '/admin-portal/agents' },
    { label: 'Scraped Trademarks', icon: '🔍', route: '/admin-portal/scraped-trademarks' },
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

  isActive(route: string): boolean {
    return this.activeRoute().startsWith(route);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  get adminInitials(): string {
    const user = this.authService.getUser();
    if (!user) return 'A';
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'AD';
  }
}

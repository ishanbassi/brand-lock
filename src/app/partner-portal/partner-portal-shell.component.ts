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
  selector: 'app-partner-portal-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './partner-portal-shell.component.html',
  styleUrl: './partner-portal-shell.component.scss',
})
export class PartnerPortalShellComponent {
  sidebarCollapsed = signal(false);
  activeRoute = signal('');

  navItems: NavItem[] = [{ label: 'Dashboard', icon: '📊', route: '/partner-portal/dashboard' }];

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

  get partnerInitials(): string {
    const user = this.authService.getUser();
    if (!user) return 'P';
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'PA';
  }
}

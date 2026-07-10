import { Component, HostListener, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService } from '../../models/auth.services';
import { IUser } from '../../models/user.model';

interface PortalNavItem {
  label: string;
  route: string;
  exact: boolean;
  /** inline SVG path markup rendered inside a 20x20 viewBox */
  icon: string;
  iconSafe?: SafeHtml;
}

@Component({
  selector: 'app-trademark-portal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './trademark-portal.component.html',
  styleUrl: './trademark-portal.component.scss',
})
export class TrademarkPortalComponent implements OnInit {
  mobileNavOpen = signal(false);
  userMenuOpen = signal(false);
  user?: IUser | null;

  navItems: PortalNavItem[] = [
    {
      label: 'Dashboard',
      route: '/portal/dashboard',
      exact: true,
      icon: '<path d="M3 10.5 10 4l7 6.5M5 9v7h4v-4h2v4h4V9"/>',
    },
    {
      label: 'File new trademark',
      route: '/trademark-registration/brand-details',
      exact: false,
      icon: '<path d="M10 4v12M4 10h12"/>',
    },
  ];

  serviceLinks: PortalNavItem[] = [
    {
      label: 'ISO certification',
      route: '/iso',
      exact: false,
      icon: '<circle cx="10" cy="10" r="6"/><path d="m7.5 10 1.8 1.8L13 8"/>',
    },
    {
      label: 'MSME / Udyam',
      route: '/msme-registration',
      exact: false,
      icon: '<path d="M4 16V8l6-4 6 4v8M8 16v-4h4v4"/>',
    },
    {
      label: 'Trademark renewal',
      route: '/trademark-renewal',
      exact: false,
      icon: '<path d="M15 6a6 6 0 1 0 1 4M15 3v3h-3"/>',
    },
  ];

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    [...this.navItems, ...this.serviceLinks].forEach(item => {
      item.iconSafe = this.sanitizer.bypassSecurityTrustHtml(item.icon);
    });
    // Close transient menus whenever the route changes.
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.mobileNavOpen.set(false);
        this.userMenuOpen.set(false);
      });
  }

  get greetingName(): string {
    return this.user?.firstName?.trim() || 'there';
  }

  get userInitials(): string {
    const name = `${this.user?.firstName || ''} ${this.user?.lastName || ''}`.trim();
    if (!name) return 'U';
    return name
      .split(/\s+/)
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  toggleMobileNav(): void {
    this.mobileNavOpen.update(v => !v);
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.userMenuOpen.update(v => !v);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.mobileNavOpen.set(false);
    this.userMenuOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

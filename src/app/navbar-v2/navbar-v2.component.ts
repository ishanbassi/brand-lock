import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, PLATFORM_ID, Renderer2 } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from "@angular/router";
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../models/auth.services';

@Component({
  selector: 'app-navbar-v2',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar-v2.component.html',
  styleUrl: './navbar-v2.component.scss'
})
export class NavbarV2Component implements AfterViewInit, OnDestroy {

  openDropdowns: Record<string, boolean> = { trademark: false, iso: false, business: false };
  private closeTimers: Record<string, ReturnType<typeof setTimeout> | null> = {};
  private isBrowser = false;
  private unlisteners: Array<() => void> = [];
  private mobileMenuOpen = false;
  private routerSub?: Subscription;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    private readonly authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  get isLoggedIn(): boolean {
    return this.isBrowser && this.authService.hasValidToken();
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.closeAllOnOutsideClick();
    // Close the mobile menu whenever navigation completes (e.g. a link is clicked)
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        if (this.mobileMenuOpen) this.toggleMobileMenu();
      });
  }

  ngOnDestroy(): void {
    this.unlisteners.forEach(fn => fn());
    Object.values(this.closeTimers).forEach(t => { if (t) clearTimeout(t); });
    this.routerSub?.unsubscribe();
  }

  openDropdown(key: string): void {
    if (!this.isBrowser || window.innerWidth <= 768) return;
    if (this.closeTimers[key]) {
      clearTimeout(this.closeTimers[key]!);
      this.closeTimers[key] = null;
    }
    this.openDropdowns[key] = true;
  }

  closeDropdown(key: string): void {
    if (!this.isBrowser || window.innerWidth <= 768) return;
    this.closeTimers[key] = setTimeout(() => {
      this.openDropdowns[key] = false;
      this.closeTimers[key] = null;
    }, 200);
  }

  toggleMobileDropdown(key: string, event: Event): void {
    if (!this.isBrowser || window.innerWidth > 768) return;
    event.preventDefault();
    this.openDropdowns[key] = !this.openDropdowns[key];
  }

  toggleMobileMenu(): void {
    if (!this.isBrowser) return;
    this.mobileMenuOpen = !this.mobileMenuOpen;
    const hamburger = this.el.nativeElement.querySelector('.hamburger');
    const navLinks = this.el.nativeElement.querySelector('.nav-links');
    hamburger?.classList.toggle('active', this.mobileMenuOpen);
    navLinks?.classList.toggle('active', this.mobileMenuOpen);
    if (!this.mobileMenuOpen) {
      Object.keys(this.openDropdowns).forEach(k => this.openDropdowns[k] = false);
    }
  }

  private closeAllOnOutsideClick(): void {
    const unlisten = this.renderer.listen('document', 'click', (event: Event) => {
      const navbar = this.el.nativeElement.querySelector('.navbar');
      if (navbar && !navbar.contains(event.target)) {
        Object.keys(this.openDropdowns).forEach(k => this.openDropdowns[k] = false);
        if (this.mobileMenuOpen) this.toggleMobileMenu();
      }
    });
    this.unlisteners.push(unlisten);
  }
}

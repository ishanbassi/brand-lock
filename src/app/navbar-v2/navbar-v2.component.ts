import { AfterViewInit, Component, ElementRef, Inject, PLATFORM_ID, Renderer2 } from '@angular/core';
import { RouterLink } from "@angular/router";
import { SharedModule } from '../shared/shared.module';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-navbar-v2',
  imports: [RouterLink, SharedModule],
  templateUrl: './navbar-v2.component.html',
  styleUrl: './navbar-v2.component.scss'
})
export class NavbarV2Component implements AfterViewInit{

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
  ){
    this.isBrowser = isPlatformBrowser(platformId);
  }
  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.initMobileNav();

  }
  private unlisteners: Array<() => void> = [];
  private isBrowser = false;



  private initMobileNav() {
    const hamburger = this.el.nativeElement.querySelector('.hamburger');
    const navLinks = this.el.nativeElement.querySelector('.nav-links');

    if (!hamburger || !navLinks) return;

    const unlisten = this.renderer.listen(hamburger, 'click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    this.unlisteners.push(unlisten);
  }

}

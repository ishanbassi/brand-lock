import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, Renderer2 } from '@angular/core';
import { NavbarV2Component } from '../navbar-v2/navbar-v2.component';
import { TopHeaderComponent } from '../top-header/top-header.component';
import { FooterV2Component } from '../footer-v2/footer-v2.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { isPlatformBrowser } from '@angular/common';
import { Blog } from '../../models/blog.model';
import { environment } from '../../environments/environment';
import { BlogService } from '../shared/services/blog-service.service';
import { Meta, Title } from '@angular/platform-browser';
import { LeadFormService } from '../../models/lead-form.service';
import { ToastrService } from 'ngx-toastr';
import dayjs from 'dayjs/esm';
import { SharedModule } from '../shared/shared.module';
import { CountUpDirective } from '../shared/directives/count-up.directive';

@Component({
  selector: 'app-home-v2',
  imports: [TopHeaderComponent,NavbarV2Component,FooterV2Component,RatingReviewComponent,DashboardHeaderComponent, SharedModule,CountUpDirective],
  templateUrl: './home-v2.component.html',
  styleUrl: './home-v2.component.scss'
})
export class HomeV2Component implements AfterViewInit, OnDestroy, OnInit {
  

  private observer!: IntersectionObserver;
  private unlisteners: Array<() => void> = [];
  blogs?: Blog;
  blogBaseUrl = `${environment.BaseBlogUrl}`;
  

  constructor(
    private blogService: BlogService,
    private title:Title,
    private meta:Meta,
    private el: ElementRef,
    private renderer: Renderer2,

    @Inject(PLATFORM_ID) private platformId: Object,

  ) {
      this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    const hamburger = this.el.nativeElement.querySelector('.hamburger');
    this.initSmoothScroll();
    this.initNavbarScroll();
    this.initForms();
    this.initHoverEffects();
    this.initAnimations();
  }
  private isBrowser = false;


ngOnDestroy(): void {
    if (!this.isBrowser) return;
    this.unlisteners.forEach(unlisten => unlisten());
    
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  /* ---------------- Mobile Navigation ---------------- */

  

  /* ---------------- Smooth Scrolling ---------------- */

  private initSmoothScroll() {
    const anchors = this.el.nativeElement.querySelectorAll('a[href^="#"]');

    anchors.forEach((anchor: HTMLElement) => {
      const unlisten = this.renderer.listen(anchor, 'click', (e: Event) => {
        e.preventDefault();

        const targetId = anchor.getAttribute('href');
        const target = this.el.nativeElement.querySelector(targetId);

        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });

      this.unlisteners.push(unlisten);
    });
  }

  /* ---------------- Navbar Scroll Behavior ---------------- */

  private initNavbarScroll() {
    const navbar = this.el.nativeElement.querySelector('.navbar');
    let lastScroll = 0;

    const unlisten = this.renderer.listen(window, 'scroll', () => {
      const currentScroll = window.pageYOffset;

      if (!navbar) return;

      if (currentScroll <= 0) {
        navbar.classList.remove('scroll-up');
        return;
      }

      if (currentScroll > lastScroll) {
        navbar.classList.add('scroll-down');
        navbar.classList.remove('scroll-up');
      } else {
        navbar.classList.add('scroll-up');
        navbar.classList.remove('scroll-down');
      }

      lastScroll = currentScroll;
    });

    this.unlisteners.push(unlisten);
  }


  /* ---------------- Forms ---------------- */

  private initForms() {
    const forms = this.el.nativeElement.querySelectorAll('form');

    forms.forEach((form: HTMLFormElement) => {
      const inputs = form.querySelectorAll('input, textarea');

      inputs.forEach(input => {
        this.unlisteners.push(
          this.renderer.listen(input, 'focus', () =>
            input.parentElement?.classList.add('focused')
          )
        );

        this.unlisteners.push(
          this.renderer.listen(input, 'blur', () => {
            if (!(input  as HTMLInputElement).value) {
              input.parentElement?.classList.remove('focused');
            }
          })
        );
      });
    });
  }

  /* ---------------- Hover Effects ---------------- */

  private initHoverEffects() {
    const cards = this.el.nativeElement.querySelectorAll(
      '.service-card, .solution-card, .case-study-card'
    );

    cards.forEach((card: HTMLElement) => {
      this.unlisteners.push(
        this.renderer.listen(card, 'mouseenter', () => {
          card.style.transform = 'translateY(-10px)';
        })
      );

      this.unlisteners.push(
        this.renderer.listen(card, 'mouseleave', () => {
          card.style.transform = 'translateY(0)';
        })
      );
    });
  }

  /* ---------------- Animations ---------------- */

  private initAnimations() {
    const animated = this.el.nativeElement.querySelectorAll(
      '.hero-content, .hero-image, .about-content, .service-card, .solution-card, .case-study-card, .contact-content'
    );

    animated.forEach((el: HTMLElement) => {
      el.classList.add('animate');
    });
  }

  ngOnInit(): void {
      this.blogService.getLatestBlogs(3).subscribe(res => this.blogs = this.convertDateFromServer(res));
    }
  
    convertDateFromServer(blog: Blog): Blog {
      blog.data = blog.data.map(d => {
        return {
          ...d,
          createdAt: d.createdAt ? dayjs(d.createdAt) : undefined,
          updatedAt:d.updatedAt ? dayjs(d.updatedAt) : undefined,
        }
      })
      return blog
  
    }
  

}


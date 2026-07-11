import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, Renderer2 } from '@angular/core';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Blog } from '../../models/blog.model';
import { environment } from '../../environments/environment';
import { BlogService } from '../shared/services/blog-service.service';
import { Meta, Title } from '@angular/platform-browser';
import dayjs from 'dayjs/esm';
import { SharedModule } from '../shared/shared.module';
import { CountUpDirective } from '../shared/directives/count-up.directive';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { LiveSearchComponent } from '../live-search/live-search.component';
import { FaqComponent } from '../faq/faq.component';
import { MobileBottomNavbarComponent } from '../mobile-bottom-navbar/mobile-bottom-navbar.component';
import { TrademarkPulseComponent } from '../trademark-pulse/trademark-pulse.component';
import { LatestJournalsComponent } from '../latest-journals/latest-journals.component';

@Component({
  selector: 'app-home-v2',
  imports: [RatingReviewComponent, SharedModule, CountUpDirective, LeadFormComponent, LiveSearchComponent, FaqComponent, MobileBottomNavbarComponent, TrademarkPulseComponent, LatestJournalsComponent],
  templateUrl: './home-v2.component.html',
  styleUrl: './home-v2.component.scss'
})
export class HomeV2Component implements AfterViewInit, OnDestroy, OnInit {
  

  private observer!: IntersectionObserver;
  private unlisteners: Array<() => void> = [];
  private schemaScript?: HTMLScriptElement;
  blogs?: Blog;
  blogBaseUrl = `${environment.BaseBlogUrl}`;

  homeFaqs = [
    {
      question: 'How much does trademark registration cost in India?',
      answer: 'Our professional fee is ₹1,499. Government filing fees are additional — ₹4,500 per class for individuals, startups and MSMEs, and ₹9,000 per class for other entities.'
    },
    {
      question: 'Can I use the ™ symbol before registration is complete?',
      answer: 'Yes. You can use the ™ symbol as soon as your application is filed. The ® symbol can be used only after the registry grants registration.'
    },
    {
      question: 'How long does trademark registration take?',
      answer: 'The process usually takes 6–18 months in India depending on objections or oppositions, but your brand gets protection from the date of application. We track and manage the application throughout.'
    },
    {
      question: 'What happens if my application receives an objection?',
      answer: 'Objections are common and manageable. Our team drafts and files the reply to the examination report and follows up with the registry until the process completes.'
    },
    {
      question: 'Do I need to visit your office?',
      answer: 'No. The entire process — search, consultation, document collection and filing — is 100% online. We serve businesses across all of India.'
    }
  ];

  constructor(
    private blogService: BlogService,
    private title: Title,
    private meta: Meta,
    private el: ElementRef,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document,
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
    this.unlisteners.forEach(unlisten => unlisten());
    if (this.observer) this.observer.disconnect();
    this.schemaScript?.remove();
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
    this.title.setTitle('Trademark Registration India — Fast, Simple & Affordable | Trademarx');
    this.meta.updateTag({ name: 'description', content: 'Search 30L+ trademarks instantly. File your application online in 10 minutes. Govt-approved. Used by 500+ businesses across India.' });
    this.meta.updateTag({ name: 'keywords', content: 'trademark registration, iso certification, msme registration, import export code, business registration services, trademark registration india, iso certification india, online business services' });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: 'Trademark Registration India — Fast, Simple & Affordable | Trademarx' });
    this.meta.updateTag({ property: 'og:description', content: 'Search 30L+ trademarks instantly. File your application online in 10 minutes. Govt-approved. Used by 500+ businesses across India.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://trademarx.in/' });
    this.meta.updateTag({ property: 'og:image', content: 'https://trademarx.in/assets/images/trademarx.png' });
    this.injectJsonLd();
  }

  private injectJsonLd(): void {
    if (this.document.querySelector('script[data-schema="homepage"]')) return;
    const schema = [
      {
        '@context': 'https://schema.org',
        '@type': ['LegalService', 'ProfessionalService'],
        '@id': 'https://trademarx.in/#organization',
        'name': 'Trademarx - Bassi & Associates',
        'description': 'Trademark registration, ISO certification, and IP legal services in India. Authorised trademark agents registered with IP India, based in Ludhiana, Punjab.',
        'url': 'https://trademarx.in',
        'telephone': '+916239771006',
        'email': 'support@trademarx.in',
        'priceRange': '₹₹',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': '38 Hambran Road, Near South City',
          'addressLocality': 'Ludhiana',
          'addressRegion': 'Punjab',
          'postalCode': '141001',
          'addressCountry': 'IN'
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': 30.8852,
          'longitude': 75.8310
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '4.9',
          'reviewCount': '77',
          'bestRating': '5',
          'worstRating': '1'
        },
        'areaServed': [
          { '@type': 'State', 'name': 'Punjab' },
          { '@type': 'Country', 'name': 'India' }
        ],
        'openingHoursSpecification': [{
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          'opens': '10:00',
          'closes': '19:00'
        }]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': this.homeFaqs.map(f => ({
          '@type': 'Question',
          'name': f.question,
          'acceptedAnswer': { '@type': 'Answer', 'text': f.answer }
        }))
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'url': 'https://trademarx.in',
        'name': 'Trademarx',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': {
            '@type': 'EntryPoint',
            'urlTemplate': 'https://trademarx.in/search?q={search_term_string}'
          },
          'query-input': 'required name=search_term_string'
        }
      }
    ];
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'homepage');
    script.text = JSON.stringify(schema);
    this.document.head.appendChild(script);
    this.schemaScript = script;
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


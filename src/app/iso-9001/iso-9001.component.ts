import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { Blog, BlogData } from '../../models/blog.model';
import { BlogMarkdownComponent } from '../blog-markdown/blog-markdown.component';
import { IsoCertificationProcessList } from '../enums/IsoCertificationProcessList';
import { isoFaqs } from '../enums/isoFaq';
import { FaqComponent } from '../faq/faq.component';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { CountUpDirective } from '../shared/directives/count-up.directive';
import { BlogService } from '../shared/services/blog-service.service';
import { SharedModule } from '../shared/shared.module';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-iso-9001',
  imports: [ReactiveFormsModule, MatInputModule, SharedModule, MatIcon, MatStepperModule,
    VerticalStepperComponent, MatCardModule, MatToolbarModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, CountUpDirective, FaqComponent, 
    BlogMarkdownComponent, LeadFormComponent, RatingReviewComponent,FirmBannerComponent
  ],
  templateUrl: './iso-9001.component.html',
  styleUrl: './iso-9001.component.scss'
})
export class Iso9001Component implements OnInit, OnDestroy {

  blog?: BlogData;
  blogBaseUrl = `${environment.BaseBlogUrl}`;
  isoCertificationProcessList = IsoCertificationProcessList;
  faqs = isoFaqs;
  blogs?: Blog;
  
  private utmSource:string = '';
  private utmMedium:string = '';
  private utmCampaign: string = '';
  private utmTerm:string = '';
  private utmContent:string = '';

  constructor(
    private blogService: BlogService,
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly route: ActivatedRoute,
    private readonly seo: SeoService,
  ) {}

  ngOnDestroy(): void {
    this.seo.removeJsonLd('iso-page');
    this.seo.removeCanonical();
  }

  ngOnInit() {
    

    this.title.setTitle('ISO 9001:2015 Certification in Ludhiana, Punjab — ₹1,499 | Trademarx');
    this.meta.updateTag({ name: 'description', content: 'ISO 9001:2015 certification for Indian businesses from ₹1,499. Fast processing, government-recognised, valid in tenders. IP India authorised agents in Ludhiana, Punjab.' });
    this.meta.updateTag({ name: 'keywords', content: 'iso 9001 certification, iso certification ludhiana, iso certification punjab, iso 9001:2015 india, quality management system' });
    this.meta.updateTag({ property: 'og:title', content: 'ISO 9001:2015 Certification in Ludhiana, Punjab — ₹1,499 | Trademarx' });
    this.meta.updateTag({ property: 'og:description', content: 'Get ISO 9001:2015 certified from ₹1,499. Valid in government tenders. Fast processing by authorised agents.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://trademarx.in/iso/iso-9001-2015' });
    this.meta.updateTag({ property: 'og:image', content: 'https://trademarx.in/assets/images/trademarx.png' });
    this.seo.setCanonical('https://trademarx.in/iso/iso-9001-2015');
    this.seo.injectJsonLd([
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://trademarx.in/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'ISO Certification', 'item': 'https://trademarx.in/iso/iso-9001-2015' }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'ISO 9001:2015 Certification',
        'description': 'ISO 9001:2015 Quality Management System certification for Indian businesses. Certificate valid in government tenders. Fast processing by authorised agents.',
        'provider': { '@id': 'https://trademarx.in/#organization' },
        'areaServed': [
          { '@type': 'State', 'name': 'Punjab' },
          { '@type': 'Country', 'name': 'India' }
        ],
        'offers': {
          '@type': 'Offer',
          'price': '1499',
          'priceCurrency': 'INR',
          'description': 'Professional fee. All-inclusive, no hidden charges.',
          'url': 'https://trademarx.in/iso/iso-9001-2015'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': isoFaqs.slice(0, 10).map(f => ({
          '@type': 'Question',
          'name': f.question,
          'acceptedAnswer': { '@type': 'Answer', 'text': f.answer }
        }))
      }
    ], 'iso-page');

    this.route.queryParams.subscribe(params => {
      this.utmSource = params['utm_source'];
      this.utmMedium = params['utm_medium'];
      this.utmCampaign = params['utm_campaign'];
      this.utmTerm = params['utm_term'];
      this.utmContent = params['utm_content'];
    })

    this.blogService.getLatestBlogsByCategory(3,"ISO certifications").subscribe(res => this.blogs = res);

    this.blogService.getBlogBySlug("iso-9001-2015-certification-complete-guide-for-businesses-in-india").subscribe(res => {
      this.blog = res?.data[0];
      if (!this.blog) return;
    })
; 
  }

}

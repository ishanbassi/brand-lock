import { Component } from '@angular/core';
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
import { FooterV2Component } from '../footer-v2/footer-v2.component';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { NavbarV2Component } from '../navbar-v2/navbar-v2.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { CountUpDirective } from '../shared/directives/count-up.directive';
import { BlogService } from '../shared/services/blog-service.service';
import { SharedModule } from '../shared/shared.module';
import { TopHeaderComponent } from '../top-header/top-header.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';

@Component({
  selector: 'app-iso-9001',
  imports: [ReactiveFormsModule, MatInputModule, SharedModule, MatIcon, MatStepperModule,
    VerticalStepperComponent, MatCardModule, MatToolbarModule, MatButtonModule, MatIconModule,
    MatProgressSpinnerModule, CountUpDirective, FaqComponent, NavbarV2Component, TopHeaderComponent, FooterV2Component,
    BlogMarkdownComponent, LeadFormComponent, RatingReviewComponent,FirmBannerComponent
  ],
  templateUrl: './iso-9001.component.html',
  styleUrl: './iso-9001.component.scss'
})
export class Iso9001Component {

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
    private readonly title: Title, private readonly meta: Meta,
    private readonly route:ActivatedRoute,
    
  ){}

  ngOnInit() {
    

    this.title.setTitle('ISO 9001:2015 At Lowest Price | ISO 9001:2015 at Just ₹1,499');
    this.meta.updateTag({ name: 'description', content: 'Get ISO Certifications at affordable prices,certifications valid in government tenders' });
    this.meta.updateTag({ name: 'keywords', content: 'iso certifications, iso 9001:2015, quality standards' });

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

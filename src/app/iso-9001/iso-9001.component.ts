import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '../shared/shared.module';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { NgxMaskDirective } from 'ngx-mask';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CountUpDirective } from '../shared/directives/count-up.directive';
import { FaqComponent } from '../faq/faq.component';
import { NavbarV2Component } from '../navbar-v2/navbar-v2.component';
import { TopHeaderComponent } from '../top-header/top-header.component';
import { FooterV2Component } from '../footer-v2/footer-v2.component';
import { BlogMarkdownComponent } from '../blog-markdown/blog-markdown.component';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { BlogService } from '../shared/services/blog-service.service';
import { BlogData } from '../../models/blog.model';
import { environment } from '../../environments/environment';
import { IsoCertificationProcessList } from '../enums/IsoCertificationProcessList';
import { isoFaqs } from '../enums/isoFaq';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-iso-9001',
  imports: [ReactiveFormsModule, MatInputModule, SharedModule, MatIcon, MatStepperModule,
    VerticalStepperComponent, MatCardModule, MatToolbarModule, MatButtonModule, MatIconModule,
    NgxMaskDirective, MatProgressSpinnerModule, CountUpDirective, FaqComponent, NavbarV2Component, TopHeaderComponent, FooterV2Component,
    BlogMarkdownComponent, LeadFormComponent, RatingReviewComponent
  ],
  templateUrl: './iso-9001.component.html',
  styleUrl: './iso-9001.component.scss'
})
export class Iso9001Component {

  blog?: BlogData;
  blogBaseUrl = `${environment.BaseBlogUrl}`;
  isoCertificationProcessList = IsoCertificationProcessList;
  faqs = isoFaqs;
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
    

    this.title.setTitle('ISO 9001:2015 At Lowest Price | ISO 9001:2015 at Just ₹1499');
    this.meta.updateTag({ name: 'description', content: 'Get ISO Certifications at affordable prices,certifications valid in government tenders' });
    this.meta.updateTag({ name: 'keywords', content: 'iso certifications, iso 9001:2015, quality standards' });

    this.route.queryParams.subscribe(params => {
      this.utmSource = params['utm_source'];
      this.utmMedium = params['utm_medium'];
      this.utmCampaign = params['utm_campaign'];
      this.utmTerm = params['utm_term'];
      this.utmContent = params['utm_content'];
    })

    this.blogService.getBlogBySlug("iso-9001-2015-certification-complete-guide-for-businesses-in-india").subscribe(res => {
      this.blog = res?.data[0];
      if (!this.blog) return;
    })
; 
  }

}

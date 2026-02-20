import { animate, state, style, transition, trigger } from '@angular/animations';
import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { ToastrService } from 'ngx-toastr';
import { LeadFormService } from '../../../models/lead-form.service';
import { NewLead } from '../../../models/lead.model';
import { LoadingService } from '../../common/loading.service';
import { RequiredDocumentsList } from '../../enums/RequiredDocumentsList';
import { TestimonialsList } from '../../enums/TestimonialsList';
import { FaqComponent } from '../../faq/faq.component';
import { FooterV2Component } from '../../footer-v2/footer-v2.component';
import { FooterComponent } from '../../footer/footer.component';
import { LimitedOfferDialogComponent } from '../../limited-offer-dialog/limited-offer-dialog.component';
import { NavbarV2Component } from '../../navbar-v2/navbar-v2.component';
import { PricingSectionComponent } from '../../pricing-section/pricing-section.component';
import { RatingReviewComponent } from '../../rating-review/rating-review.component';
import { CountUpDirective } from '../../shared/directives/count-up.directive';
import { BlogService } from '../../shared/services/blog-service.service';
import { LeadService } from '../../shared/services/lead.service';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { SessionStorageService } from '../../shared/services/session-storage.service';
import { SharedModule } from '../../shared/shared.module';
import { TopHeaderComponent } from '../../top-header/top-header.component';
import { TrademarkPlanCardsComponent } from '../../trademark-plan-cards/trademark-plan-cards.component';
import { VerticalStepperComponent } from '../../vertical-stepper/vertical-stepper.component';
import { HomeService } from './home.service';
import { BlogData } from '../../../models/blog.model';
import { BlogMarkdownComponent } from '../../blog-markdown/blog-markdown.component';
import { environment } from '../../../environments/environment';
import { GoogleConversionTrackingService } from '../../shared/services/google-conversion-tracking.service';
import { LeadFormComponent } from '../../lead-form/lead-form.component';
import { RegistrationProcessList } from '../../enums/RegistrationProcessList';
import { Subject } from 'rxjs';
declare let gtag: Function; // Add this at the top of your TypeScript file




@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule, MatInputModule, SharedModule, MatIcon, SlickCarouselModule, MatStepperModule,
    VerticalStepperComponent, MatCardModule, PricingSectionComponent, MatToolbarModule, MatButtonModule, MatIconModule, FooterComponent,
    NgxMaskDirective, MatProgressSpinnerModule, CountUpDirective, FaqComponent, NavbarV2Component, TopHeaderComponent,RatingReviewComponent,TrademarkPlanCardsComponent, FooterV2Component,
    BlogMarkdownComponent,LeadFormComponent
  ],
  standalone: true,
  templateUrl: './trademark-page.component.html',
  styleUrl: './trademark-page.component.scss',
  animations: [
    trigger('fadeInOut', [
      state('visible', style({
        opacity: 1,
      })),
      state('hidden', style({
        opacity: 0.1,
      })),
      transition('hidden => visible', [
        animate('0.5s ease-in-out')
      ])
    ]),
    trigger('toolbarAnimation', [
      state('hidden', style({ transform: 'translateY(-100%)', opacity: 0 })),
      state('visible', style({ transform: 'translateY(0)', opacity: 1 })),
      transition('hidden => visible', animate('300ms ease-out')),
      transition('visible => hidden', animate('300ms ease-in'))
    ])
  ],
  providers: [provideNgxMask()]
})
export class TrademarkPageComponent implements OnInit, AfterViewInit{

  testimonials = TestimonialsList;
  documents = RequiredDocumentsList;
  animationState = 'hidden';
  toolbarState: 'visible' | 'hidden' = 'hidden';
  registrationSteps = RegistrationProcessList;
  private ctaSection: HTMLElement | null = null;
  private isInitialLoad = true;
  private utmSource:string = '';
  private utmMedium:string = '';
  private utmCampaign: string = '';
  private utmTerm:string = '';
  private utmContent:string = '';


  onClickValidation: boolean = false;
  isSubmitting: boolean = false;
  isNavSubmitting: boolean = false;
  
  private isBrowser: boolean;
  blog?: BlogData;
  blogBaseUrl = `${environment.BaseBlogUrl}`;
  planTypeSubject = new Subject();

  constructor(
    private readonly homeService: HomeService,
    private readonly leadFormService: LeadFormService,
    private readonly toastService: ToastrService,
    private readonly title: Title, private readonly meta: Meta,
    private readonly route:ActivatedRoute,
    private readonly router:Router,
    private readonly dialog:MatDialog,
    private readonly loadingService:LoadingService,
    private readonly leadService: LeadService,
    private readonly localStorageService: LocalStorageService,
    private readonly sessionStorageService: SessionStorageService,
    private blogService: BlogService,
    private readonly googleConversionTrackingService:GoogleConversionTrackingService,
    
    
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

  }
  ngAfterViewInit(): void {
    if (!this.isBrowser) return;
    this.ctaSection = document.querySelector('.cta-section') as HTMLElement;
  }

  
  ctaNavForm = new FormGroup({
    fullName: new FormControl('',),
    city: new FormControl('',),
    email: new FormControl(''),
    phoneNumber: new FormControl(''),
    selectedPackage: new FormControl()
  })
  ngOnInit() {
    // Trigger animation after a small delay to ensure DOM is ready
    setTimeout(() => {
      this.animationState = 'visible';
    }, 100);


    // Check initial scroll position
    this.checkScrollPosition();

    this.title.setTitle('Trademark At Lowest Price | Trademark filing at Just ₹6499');
    this.meta.updateTag({ name: 'description', content: 'Register your trademark with ease and protect your brand. Affordable and fast services by experts.' });
    this.meta.updateTag({ name: 'keywords', content: 'trademark, brand registration, registration, India, brand, TM services, trademarx' });

    this.route.queryParams.subscribe(params => {
      this.utmSource = params['utm_source'];
      this.utmMedium = params['utm_medium'];
      this.utmCampaign = params['utm_campaign'];
      this.utmTerm = params['utm_term'];
      this.utmContent = params['utm_content'];
    })

    this.blogService.getBlogBySlug("online-trademark-registration-process-in-india").subscribe(res => {
      this.blog = res?.data[0];
      if (!this.blog) return;
    })
; 
  }
  
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const triggerPoint = 400; // adjust as per your section
    const scrollY = window.scrollY || document.documentElement.scrollTop;

    this.toolbarState = scrollY > triggerPoint ? 'visible' : 'hidden';
  }

  private checkScrollPosition() {
    if (this.ctaSection) {
      const ctaSectionBottom = this.ctaSection.getBoundingClientRect().bottom;
      if (ctaSectionBottom < 0) {
        this.toolbarState = 'visible';
        this.isInitialLoad = false;
      }
    }
  }

  

  navFormsubmit() {
    this.onClickValidation = true;
    this.isNavSubmitting = true;
    this.saveLead(this.ctaNavForm);
    // this.submitNetlifyForm(this.ctaNavForm)
  }

  slideConfig = {
    slidesToShow: 3, // Number of visible slides
    slidesToScroll: 1, // Number of slides to scroll at a time
    autoplay: true, // Enables auto-scrolling
    autoplaySpeed: 4000, // Time interval for auto scroll (2 sec)
    dots: false, // Show navigation dots
    infinite: true, // Infinite loop
    arrows: false, // Hide arrows (optional)
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1
        }
      }
    ]
  };

  saveLead(form: FormGroup) {
    this.addValidationsToFormAndValidate(form);
    if (!form.valid) {
      this.isSubmitting = false;
      this.isNavSubmitting = false;
      return;
    }
    const lead = this.leadFormService.getLead(form) as NewLead;
    this.loadingService.show();
    this.leadService.create(lead).subscribe({
      next: (newLead) => {
          this.isSubmitting = false;
          this.isNavSubmitting = false;
          this.sessionStorageService.setObject('lead', newLead.body);
          this.toastService.success("Thank you for your submission! One of our team members will contact you soon.");
          console.log("Form successfully submitted");
          this.trackConversion();
          // this.router.navigateByUrl("trademark-registration/step-2");
          this.loadingService.hide();
          
        },  
        error: (err) => {
          this.toastService.error("There were some issues while submitting the detils. Please try later.");
          this.isSubmitting = false;
          this.isNavSubmitting = false;
          this.loadingService.hide();
        }
    });
  }

  onPlanTypeChange(planType: any) {
    // this.ctaForm.get('selectedPackage')?.setValue(planType);
    this.ctaNavForm.get('selectedPackage')?.setValue(planType);
    // this.focusOnCtaForm();
    this.planTypeSubject.next(planType);
  }

  submitNetlifyForm(formGroup: FormGroup) {
    this.addValidationsToFormAndValidate(formGroup);
    if (!formGroup.valid) {
      this.isSubmitting = false;
      this.isNavSubmitting = false;
      return;
    }
    const form = formGroup.value;

    const formData = new FormData();
    formData.append('form-name', 'leads');
    formData.append('utmSource', this.utmSource);
    formData.append('utmMedium', this.utmMedium);
    formData.append('utmCampaign', this.utmCampaign);
    formData.append('utmTerm', this.utmTerm);
    formData.append('utmContent', this.utmContent);
    formData.append('purpose', "Trademark Registration")

    Object.keys(form).forEach(key => {
      formData.append(key, form[key]);
    });

    fetch("/", {
      method: "POST",
      body: formData
    })
      .then((res) => {
        if (!res.ok) {
          this.toastService.error("There were some issues while submitting the detils. Please try later.");
          return;
        }
        this.toastService.success("Thank you for your submission! One of our team members will contact you soon.");
        console.log("Form successfully submitted");
        this.trackConversion();

      })
      .catch(error => alert(error))
      .finally(() => {

        formGroup.reset();
        this.resetFormValidations(formGroup);

        this.isSubmitting = false;
        this.isNavSubmitting = false;
      })
      ;
  }
  resetFormValidations(formGroup: FormGroup<any>) {
    Object.keys(formGroup.controls).forEach(controlName => {
      formGroup.get(controlName)?.clearValidators();
      formGroup.get(controlName)?.updateValueAndValidity();
    });
  }
  addValidationsToFormAndValidate(form: FormGroup<any>) {
    form.get('fullName')?.setValidators([Validators.required]);
    form.get('email')?.setValidators([Validators.required, Validators.pattern("[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,4}$")]);
    form.get('city')?.setValidators([Validators.required]);
    form.get('phoneNumber')?.setValidators([Validators.required, Validators.pattern("[0-9]{10}")]);

    // Recalculate validity with new validators
    form.get('fullName')?.updateValueAndValidity();
    form.get('email')?.updateValueAndValidity();
    form.get('city')?.updateValueAndValidity();
    form.get('phoneNumber')?.updateValueAndValidity();
    form.markAllAsTouched();

  }

   trackConversion() {
    this.googleConversionTrackingService.reportSignupConversion();
 
    
  }
  showLimitedOfferDialog() {
    this.dialog.open(LimitedOfferDialogComponent, {hasBackdrop:true})
  }


}

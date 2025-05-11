import { Component, OnInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { TestimonialsList } from '../../enums/TestimonialsList';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import {MatStepperModule} from '@angular/material/stepper';
import { VerticalStepperComponent } from '../../vertical-stepper/vertical-stepper.component';
import {MatCardModule} from '@angular/material/card';
import { RequiredDocumentsList } from '../../enums/RequiredDocumentsList';
import { PricingSectionComponent } from '../../pricing-section/pricing-section.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavbarComponent } from '../../navbar/navbar.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { HomeService } from './home.service';
import { LeadFormService } from '../../lead/lead-form.service';
import { NewLead } from '../../lead/lead.model';
import { LoadingService } from '../../shared/loading.service';
import { FooterComponent } from '../../footer/footer.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CountUpDirective } from '../../shared/directives/count-up.directive';

@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule,  MatInputModule,SharedModule, MatIcon, SlickCarouselModule, MatStepperModule,
    VerticalStepperComponent,MatCardModule,PricingSectionComponent,MatToolbarModule, MatButtonModule, MatIconModule, NavbarComponent,FooterComponent,
    NgxMaskDirective, NgxMaskPipe, MatProgressSpinnerModule, CountUpDirective
  ],
  standalone:true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
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
export class HomeComponent implements OnInit{

  testimonials = TestimonialsList;
  documents = RequiredDocumentsList;
  animationState = 'hidden';
  toolbarState: 'visible' | 'hidden' = 'hidden';
  private ctaSection: HTMLElement | null = null;
  private isInitialLoad = true;

  onClickValidation: boolean = false;
  isSubmitting: boolean = false;
  isNavSubmitting: boolean = false;
  @ViewChild('ctaFormElement') ctaFormElement!: ElementRef;

  constructor(
    private readonly homeService:HomeService,
    private readonly leadFormService:LeadFormService,
    private readonly loadingService:LoadingService
  ){
  }

  ctaForm = new FormGroup({
    fullName: new FormControl('', ),
    city: new FormControl('', ),
    email: new FormControl('',),
    phoneNumber: new FormControl(''),
    selectedPackage: new FormControl()
  })
  ctaNavForm = new FormGroup({
    fullName: new FormControl('', ),
    city: new FormControl('', ),
    email: new FormControl(''),
    phoneNumber: new FormControl(''),
    selectedPackage: new FormControl()
  })
  ngOnInit() {
    // Trigger animation after a small delay to ensure DOM is ready
    setTimeout(() => {
      this.animationState = 'visible';
    }, 100);
    
    // Get the cta-section element
    this.ctaSection = document.querySelector('.cta-section');
    
    // Check initial scroll position
    this.checkScrollPosition();
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

  submit() {
    this.onClickValidation = true;
    this.isSubmitting = true;
    this.saveLead(this.ctaForm);
  }

  navFormsubmit() {
    this.onClickValidation = true;
    this.isNavSubmitting = true;
    this.saveLead(this.ctaNavForm);
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
  
  saveLead(form: FormGroup){
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

    if(!form.valid){
      this.isSubmitting = false;
      this.isNavSubmitting = false;
      return;
    }
    this.loadingService.show();
    const lead = this.leadFormService.getLead(form) as NewLead;
    this.homeService.saveLead(lead)
    .subscribe({
      next:() => {
        this.isSubmitting = false;
        this.isNavSubmitting = false;
      },
      error:() => {
        // this.isSubmitting = false;
        // this.isNavSubmitting = false;
      }
    })
  }
  onPlanTypeChange(planType: string) {
    this.ctaForm.get('selectedPackage')?.setValue(planType);
    this.ctaNavForm.get('selectedPackage')?.setValue(planType);
    this.focusOnCtaForm();
  }

  focusOnCtaForm() {
    if (this.ctaFormElement) {
      const firstInput = this.ctaFormElement.nativeElement.querySelector('input');
      if (firstInput) {
        firstInput.focus();
      }
    }
  }
}

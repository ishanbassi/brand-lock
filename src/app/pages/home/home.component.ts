import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, HostListener } from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { TestimonialsList } from '../../enums/TestimonialsList';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import {MatTabsModule} from '@angular/material/tabs';
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


@Component({
  selector: 'app-home',
  imports: [ReactiveFormsModule,  MatInputModule,SharedModule,MatButtonModule, MatIcon, SlickCarouselModule,MatTabsModule, MatStepperModule,
    VerticalStepperComponent,MatCardModule,PricingSectionComponent,MatToolbarModule, MatButtonModule, MatIconModule, NavbarComponent],
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
})
export class HomeComponent implements OnInit{

  testimonials = TestimonialsList;
  documents = RequiredDocumentsList;
  animationState = 'hidden';
  toolbarState: 'visible' | 'hidden' = 'hidden';
  private ctaSection: HTMLElement | null = null;
  private isInitialLoad = true;

  onClickValidation: boolean  = false;
  constructor(
    private readonly homeService:HomeService,
    private readonly leadFormService:LeadFormService,
    private readonly loadingService:LoadingService
  ){
  }




  ctaForm = new FormGroup({
    fullName: new FormControl('', ),
    city: new FormControl('', ),
    email: new FormControl('', { nonNullable: true, validators: [Validators.pattern("[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,4}$")] }),
    phoneNumber: new FormControl('', { validators: [Validators.pattern("[0-9]{10}")] }),
    selectedPackage: new FormControl()

  })
  ctaNavForm = new FormGroup({
    fullName: new FormControl('', ),
    city: new FormControl('', ),
    email: new FormControl('', { nonNullable: true, validators: [Validators.pattern("[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,4}$")] }),
    phoneNumber: new FormControl('', { validators: [Validators.pattern("[0-9]{10}")] }),
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
    this.saveLead(this.ctaForm);

    // Now apply required validators after submit
   
  }
  navFormsubmit() {
    this.onClickValidation = true;
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
    form.get('email')?.setValidators([Validators.required]);
    form.get('city')?.setValidators([Validators.required]);
    form.get('phoneNumber')?.setValidators([Validators.required]);

    // Recalculate validity with new validators
    form.get('fullName')?.updateValueAndValidity();
    form.get('email')?.updateValueAndValidity();
    form.get('city')?.updateValueAndValidity();
    form.get('phoneNumber')?.updateValueAndValidity();

    form.markAllAsTouched();


    if(!form.valid){
      return;
    }
    this.loadingService.show();
    const lead = this.leadFormService.getLead(form) as NewLead;
    this.homeService.saveLead(lead)
    .subscribe({
      next:() => {
        this.loadingService.hide();
      },
      error:() => {
        this.loadingService.hide();

      }
    })


   
  }
  onPlanTypeChange(planType: string) {
    this.ctaForm.get('selectedPackage')?.setValue(planType);
    this.ctaNavForm.get('selectedPackage')?.setValue(planType);
    

    }

}

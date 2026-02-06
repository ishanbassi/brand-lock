import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ReCaptchaV3Service } from 'ng-recaptcha-2';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { NgxMaskDirective } from 'ngx-mask';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { Account } from '../../models/account.model';
import { Login } from '../../models/login';
import { CommonRegisterLoginMobileSectionComponent } from '../common-register-login-mobile-section/common-register-login-mobile-section.component';
import { LoadingService } from '../common/loading.service';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { RequiredDocumentsList } from '../enums/RequiredDocumentsList';
import { TestimonialsList } from '../enums/TestimonialsList';
import { FaqComponent } from '../faq/faq.component';
import { FeaturesComponent } from '../features/features.component';
import { FooterComponent } from '../footer/footer.component';
import { PhoneInputComponent } from '../phone-input/phone-input.component';
import { PricingSectionComponent } from '../pricing-section/pricing-section.component';
import { CountUpDirective } from '../shared/directives/count-up.directive';
import { DataService } from '../shared/services/data.service';
import { GoogleConversionTrackingService } from '../shared/services/google-conversion-tracking.service';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { SharedModule } from '../shared/shared.module';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { NavbarV2Component } from '../navbar-v2/navbar-v2.component';
import { TopHeaderComponent } from '../top-header/top-header.component';
import { FooterV2Component } from '../footer-v2/footer-v2.component';

@Component({
  selector: 'app-create-account',
  imports: [FormsModule, MatFormField, SharedModule, FeaturesComponent, MatInputModule, MatIcon, MatIconModule, MatButtonModule, DashboardHeaderComponent,CommonRegisterLoginMobileSectionComponent,NgxIntlTelInputModule,NgxMaskDirective, PhoneInputComponent,
    ReactiveFormsModule, MatInputModule, SharedModule, MatIcon, SlickCarouselModule, MatStepperModule,
        VerticalStepperComponent, MatCardModule, PricingSectionComponent, MatToolbarModule, MatButtonModule, MatIconModule, FooterComponent,
        NgxMaskDirective, MatProgressSpinnerModule, CountUpDirective, FaqComponent, NavbarV2Component, TopHeaderComponent, FooterV2Component

  ],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss',
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
  ]
})

export class CreateAccountComponent  implements OnInit{
  animationState = 'hidden';
  loginForm: any;
fullNamePattern = `^[A-Za-z0-9_,.&()/\\'" ]*$`;
testimonials = TestimonialsList;
  documents = RequiredDocumentsList;
  
  onClickValidation: boolean = false;
  passwordFieldType: string = "password";
  confirmPasswordFieldType: string = "password";
  termAndConditionPageOpend: boolean = false;
  privacyPolicyPageOpend: boolean = false;

  data: Account = new Account();
  loggedIn: any;

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

  constructor(private readonly toastService: ToastrService,
    private readonly router: Router, private readonly localStorageService: LocalStorageService,
    private readonly loadingService: LoadingService,
    private  readonly recaptchaV3Service: ReCaptchaV3Service,
    private readonly dataService: DataService,
    private readonly sessionStorageService:SessionStorageService,
    private readonly googleConversionTrackingService:GoogleConversionTrackingService,
    private meta: Meta,
    private title: Title

  ) { }
  ngOnInit() {
  this.title.setTitle(
    'Trademark Registration in India @ ₹6399 | Trademarx'
  );

  this.meta.updateTag({
    name: 'description',
    content: 'Low-cost trademark registration in India. Govt fees included. Affordable and fast services by experts.'
  });

  this.meta.updateTag({
    name: 'robots',
    content: 'index, follow'
  });
  this.meta.updateTag({ name: 'keywords', content: 'trademark, registration, India, brand, TM services, trademarx' });
}


  executeRecaptchaAndRegister(form: FormGroup<any>) {
    this.recaptchaV3Service.execute('submit')
      .subscribe((token: string) => {
        this.data.captchaResponse = token;
        this.onClickValidation = !form.valid;
        if (!form.valid) {
          return;
        }


        if (!this.data.captchaResponse || this.data.captchaResponse === "") {
          this.toastService.error("Please complete captcha verification");
          return;
        }
        const nameParts = this.data.firstName?.trim().split(" ") || [];
        this.data.firstName = nameParts[0];
        this.data.lastName = nameParts.slice(1).join(" ") || " ";
        this.data.login = this.data.email;
        this.data.password = "Ish@n@070720"
        this.loadingService.show();
        this.dataService.register(this.data.forRequest())
          .subscribe({
            next: (response) => {
              this.localStorageService.setObject('user', response.body?.user);
              this.processLogin();
            }, error: (error: any) => {
              this.loadingService.hide();
              console.log(error)
              this.toastService.error(error?.detail);
            }
          }
          
        );
      })

  }
  processLogin() {
    const input = new Login();
    input.username = this.data.email;
    input.password = this.data.password;
    this.dataService.login(input.forRequest())
    .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (response) => {
          this.localStorageService.storeAuthenticationToken(response.body!.id_token);
          this.sessionStorageService.set("initial-onboarding", true);
          this.googleConversionTrackingService.reportSignupConversion("trademark-registration/step-2");
          // this.router.navigateByUrl("trademark-registration/step-2");
          

        }, error: (error: any) =>   {
          this.toastService.error("Failed to sign in! Please check your credentials and try again.");
        }
      });
  }

  eyePassword() {
    if (this.passwordFieldType === "password") {
      this.passwordFieldType = "text";
    } else {
      this.passwordFieldType = "password";

    }
  }


trackCallToActionEvent(){
  this.googleConversionTrackingService.reportClickToCall();
}

}



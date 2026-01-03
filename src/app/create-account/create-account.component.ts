import { CommonModule } from '@angular/common';
import { Component, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { SharedModule } from '../shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { LoadingService } from '../common/loading.service';
import { FeaturesComponent } from '../features/features.component';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Account } from '../../models/account.model';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { ReCaptchaV3Service } from 'ng-recaptcha-2';
import { DataService } from '../shared/services/data.service';
import { Login } from '../../models/login';
import { JwtToken } from '../../models/jwt.token';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CommonRegisterLoginMobileSectionComponent } from '../common-register-login-mobile-section/common-register-login-mobile-section.component';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { NgxMaskDirective } from 'ngx-mask';
import { GoogleConversionTrackingService } from '../shared/services/google-conversion-tracking.service';

@Component({
  selector: 'app-create-account',
  imports: [FormsModule, MatFormField, SharedModule, FeaturesComponent, MatInputModule, MatIcon, MatIconModule, MatButtonModule, DashboardHeaderComponent,CommonRegisterLoginMobileSectionComponent,NgxIntlTelInputModule,NgxMaskDirective],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss'
})

export class CreateAccountComponent {


  loginForm: any;
fullNamePattern = `^[A-Za-z0-9_,.&()/\\'" ]*$`;
  
  onClickValidation: boolean = false;
  passwordFieldType: string = "password";
  confirmPasswordFieldType: string = "password";
  termAndConditionPageOpend: boolean = false;
  privacyPolicyPageOpend: boolean = false;

  data: Account = new Account();
  loggedIn: any;


  constructor(private readonly toastService: ToastrService,
    private readonly router: Router, private readonly localStorageService: LocalStorageService,
    private readonly loadingService: LoadingService,
    private  readonly recaptchaV3Service: ReCaptchaV3Service,
    private readonly dataService: DataService,
    private readonly sessionStorageService:SessionStorageService,
    private readonly googleConversionTrackingService:GoogleConversionTrackingService

  ) { }

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




}



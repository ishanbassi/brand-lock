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

@Component({
  selector: 'app-create-account',
  imports: [FormsModule, MatFormField, SharedModule, FeaturesComponent, MatInputModule, MatIcon, MatIconModule, MatButtonModule, DashboardHeaderComponent],
  templateUrl: './create-account.component.html',
  styleUrl: './create-account.component.scss'
})

export class CreateAccountComponent {


  loginForm: any;
fullNamePattern = `^[A-Za-z0-9_,.&()/\\'" ]*$`;
  eyePassword() {
    throw new Error('Method not implemented.');
  }
  onClickValidation: boolean = false;
  passwordFieldType: string = "password";
  confirmPasswordFieldType: string = "password";
  termAndConditionPageOpend: boolean = false;
  privacyPolicyPageOpend: boolean = false;

  data: Account = new Account();
  loggedIn: any;


  constructor(private toastService: ToastrService,
    private router: Router, private localStorageService: LocalStorageService,
    private loadingService: LoadingService, private route: ActivatedRoute,
    private _renderer2: Renderer2,
    private recaptchaV3Service: ReCaptchaV3Service,
    private dataService: DataService

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
            next: (response: any) => {
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
        next: (response: JwtToken) => {
          this.localStorageService.storeAuthenticationToken(response.id_token);
          // this.router.navigateByUrl("/portal/trademark-registration/type");

        }, error: (error: any) =>   {
          this.toastService.error("Failed to sign in! Please check your credentials and try again.");
        }
      });
  }




}



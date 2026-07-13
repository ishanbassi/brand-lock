import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../shared/services/data.service';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { LoadingService } from '../common/loading.service';
import { AuthService } from '../../models/auth.services';
import { JwtToken } from '../../models/jwt.token';
import { Login } from '../../models/login';
import { FormsModule } from '@angular/forms';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { ValidationMessageComponent } from '../shared/validation-message/validation-message.component';
import { CommonRegisterLoginMobileSectionComponent } from '../common-register-login-mobile-section/common-register-login-mobile-section.component';


@Component({
  selector: 'app-login-v2',
  templateUrl: './login-v2.component.html',
  styleUrl: './login-v2.component.scss',
  imports: [FormsModule, RouterLink, AuthLayoutComponent, ValidationMessageComponent, CommonRegisterLoginMobileSectionComponent]
})
export class LoginV2Component implements OnInit{
 onClickValidation: boolean = false;
  data: Login = new Login();
  passwordFieldType: string = "password";
  returnUrl: string = '/portal/dashboard';
  oAuthToken?: string;
  constructor(private readonly toastService: ToastrService, private readonly dataService: DataService,
    private  readonly router: Router, private  readonly localStorageService: LocalStorageService,
    private readonly loadingService: LoadingService, private readonly  authService:AuthService, 
    private readonly route: ActivatedRoute,private meta: Meta,
    private title: Title) {
  }

  ngOnInit(): void {
    this.data = new Login();
    const urlFromQuery = this.route.snapshot.queryParams['returnUrl'];
  if (urlFromQuery) {
    this.returnUrl = urlFromQuery;
  }
  this.title.setTitle(
    'Trademark Registration in India @ ₹1,499 | Trademarx'
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

  login(form: any): void {
    this.onClickValidation = !form.valid;
    if (!form.valid || !this.data.isValidLoginRequest(form)) {
      return;
    }
    this.loadingService.show();
    this.dataService.login(this.data.forRequest())
      .subscribe({
        next: (response) => {
          const idToken = response.body!.id_token;
          this.localStorageService.storeAuthenticationToken(idToken);
          const { id, authorities } = this.authService.decodeToken(idToken);
          this.localStorageService.setObject('user', { id, authorities });

          // ROLE_ADMIN/ROLE_AGENT accounts have no UserProfile row, so they can't
          // go through fetchUserDetail() (which 500s on the missing profile).
          // Role is already known from the token, so route them straight in.
          if (this.authService.hasRole(['ROLE_ADMIN'])) {
            this.loadingService.hide();
            this.navigateTo('/admin-portal/dashboard');
            return;
          }
          if (this.authService.hasRole(['ROLE_AGENT'])) {
            // TODO: agent gets a dedicated login page in a later phase.
            this.loadingService.hide();
            this.navigateTo('/agent-portal/dashboard');
            return;
          }

          this.fetchUserDetail(authorities);
        }, error: (error: any) => {
          this.loadingService.hide();
          if (!error.detail?.includes('Bad Credentials')) {
            this.toastService.error(error.detail);
            return;
          }
          this.toastService.error("Failed to sign in! Please check your credentials and try again.");
        }
      });
  }

  private fetchUserDetail(authorities: { name: string }[]) {
    this.dataService.getCurrentUser()
      .subscribe({
        next: (response) => {
          this.loadingService.hide();
          this.localStorageService.setObject('user', { ...response.body, authorities });
          this.navigateTo(this.returnUrl || '/portal/dashboard');
        }, error: (error: any) => {
          this.loadingService.hide();
          this.toastService.error("Failed to sign in! Please check your credentials and try again.");
        }
      });
  }

  private navigateTo(destination: string) {
    setTimeout(() => {
      this.router.navigate([destination]);
    }, 200);
  }

  eyePassword() {
    if (this.passwordFieldType === "password") {
      this.passwordFieldType = "text";
    } else {
      this.passwordFieldType = "password";
    }
  }

  clearEmail() {
    this.data.username = undefined;
  }


}

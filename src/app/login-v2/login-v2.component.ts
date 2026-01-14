import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../shared/services/data.service';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { LoadingService } from '../common/loading.service';
import { AuthService } from '../../models/auth.services';
import { JwtToken } from '../../models/jwt.token';
import { Login } from '../../models/login';
import { FeaturesComponent } from '../features/features.component';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { MatIcon } from '@angular/material/icon';
import { CommonRegisterLoginMobileSectionComponent } from '../common-register-login-mobile-section/common-register-login-mobile-section.component';


@Component({
  selector: 'app-login-v2',
  templateUrl: './login-v2.component.html',
  styleUrl: './login-v2.component.scss',
  imports: [FeaturesComponent, MatFormField, SharedModule, FormsModule,DashboardHeaderComponent,MatInputModule,MatIcon,CommonRegisterLoginMobileSectionComponent]
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
    'Trademark Registration in India @ ₹6500 | Trademarx'
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
          this.loadingService.hide();
          this.localStorageService.storeAuthenticationToken(response.body!.id_token);
          this.fetchUserDetail();
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

  fetchUserDetail() {
    this.dataService.getCurrentUser()
      .subscribe({
        next: (response) => {
          this.loadingService.hide();
          this.localStorageService.setObject('user', response.body?.user);
          
          setTimeout(() => {
          this.router.navigate(['/portal/dashboard']);
          }, 200);
        }, error: (error: any) => {
          this.loadingService.hide();
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

  clearEmail() {
    this.data.username = undefined;
  }


}

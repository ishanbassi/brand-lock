import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Login } from '../../models/login';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../shared/services/data.service';
import { LoadingService } from '../common/loading.service';
import { FeaturesComponent } from '../features/features.component';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  imports: [FeaturesComponent, MatFormField, SharedModule, FormsModule,DashboardHeaderComponent,MatInputModule,MatIcon]

})
export class ForgotPasswordComponent implements OnInit {

  onClickValidation: boolean = false;
  data: Login = new Login();

  constructor(private readonly toastService: ToastrService,
    private readonly dataService: DataService,
    private readonly router: Router,
    private readonly loadingService: LoadingService,
    private readonly titleService: Title,
  ) {
  }

  ngOnInit() {
    this.loadingService.hide();
    this.onClickValidation = false;
    this.data = new Login();
  }

  contiune(form: any): void {
    this.onClickValidation = !form.valid;
    if (!form.valid) {
      return;
    }
    this.loadingService.show();
    const input = this.data.forRequest();
    this.dataService.forgotPassword(input.username)
      .subscribe({
        next: (response: any) => {
          this.loadingService.hide();
          this.toastService.success("To reset your password, check your email for instructions.");
          this.router.navigate(['/login']);
        }, error: (error: any) => {
          this.loadingService.hide();
          error?.detail && this.toastService.error(error.detail);
        }
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  clearEmail() {
    this.data.username = undefined;
  }
}

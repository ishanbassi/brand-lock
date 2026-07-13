import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DataService } from '../shared/services/data.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../common/loading.service';
import { ResetPassword } from '../shared/services/reset.password';
import { FormsModule } from '@angular/forms';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { ValidationMessageComponent } from '../shared/validation-message/validation-message.component';

@Component({
  selector: 'app-create-new-password',
  templateUrl: './create-new-password.component.html',
  styleUrls: ['./create-new-password.component.scss'],
  imports: [FormsModule, RouterLink, AuthLayoutComponent, ValidationMessageComponent]

})
export class CreateNewPassword implements OnInit {
  passwordFieldType: string = "password";
  confirmPasswordFieldType: string = "password"
  comparableField: any;


  data: ResetPassword = new ResetPassword();
  onClickValidation: boolean = false;
  isCreateAccountPage: boolean = false;
  constructor(private dataService: DataService, private router: Router, private toastService: ToastrService,
    private loadingService: LoadingService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params: any) => {
      this.data.key = encodeURIComponent(params['key']);
      if (!this.data.key || this.data.key === '') {
        this.router.navigate(['not-found']);
      }
    });
  }

  contiune(form: any) {
    this.onClickValidation = !form.valid;
    if (!form.valid || !this.data.isValidRequest(form)) {
      this.onClickValidation = true;
      return;
    }
    this.loadingService.show();
    this.dataService.resetPassword(this.data.forRequest())
      .subscribe({
        next: (response: any) => {
          this.loadingService.hide();
          this.toastService.success("Password reset successful. You can now log in with your new password.");
          this.router.navigate(['/login']);
        }, error: (error: any) => {
          this.loadingService.hide();
          this.toastService.error(error.detail);
        }
      });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  eyePassword() {
    if (this.passwordFieldType === "password") {
      this.passwordFieldType = "text";
    } else {
      this.passwordFieldType = "password";

    }
  }
  eyeConfirmPassword(event: any) {
    if (this.confirmPasswordFieldType === "password") {
      this.confirmPasswordFieldType = "text";
    } else {
      this.confirmPasswordFieldType = "password";

    }
  }
}

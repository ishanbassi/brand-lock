import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { PartnerDataService } from '../shared/services/partner-data.service';
import { PartnerRegistration } from '../../models/partner.model';
import { DataService } from '../shared/services/data.service';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { LoadingService } from '../common/loading.service';
import { Login } from '../../models/login';
import { AuthService } from '../../models/auth.services';

@Component({
  selector: 'app-create-partner-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-partner-account.component.html',
  styleUrl: './create-partner-account.component.scss',
})
export class CreatePartnerAccountComponent implements OnInit {
  step = signal(1);
  totalSteps = 3;

  formData: PartnerRegistration = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    companyName: '',
    website: '',
  };

  passwordVisible = false;
  confirmPassword = '';
  confirmPasswordVisible = false;
  onClickValidation = false;
  submitting = false;
  partnerCode?: string;

  benefits = [
    { icon: '💰', text: 'Earn 10% commission on every sale you refer' },
    { icon: '🔗', text: 'A simple tracked link — no code or integration work' },
    { icon: '📊', text: 'Real-time dashboard of clicks, sales & payouts' },
    { icon: '🎨', text: 'Ready-made banner & badge, no design needed' },
  ];

  constructor(
    private readonly partnerDataService: PartnerDataService,
    private readonly dataService: DataService,
    private readonly localStorageService: LocalStorageService,
    private readonly loadingService: LoadingService,
    private readonly toastr: ToastrService,
    private readonly router: Router,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {}

  get progressPercent(): number {
    return Math.round(((this.step() - 1) / (this.totalSteps - 1)) * 100);
  }

  nextStep(): void {
    this.onClickValidation = true;
    if (this.step() === 1) {
      if (!this.formData.firstName || !this.formData.email || !this.formData.password) return;
      if (this.formData.password.length < 6) {
        this.toastr.error('Password must be at least 6 characters');
        return;
      }
      if (this.formData.password !== this.confirmPassword) {
        this.toastr.error('Passwords do not match');
        return;
      }
    }
    this.onClickValidation = false;
    this.step.update(s => s + 1);
  }

  prevStep(): void {
    this.step.update(s => s - 1);
  }

  submit(): void {
    this.submitting = true;
    this.loadingService.show();
    this.partnerDataService
      .registerPartner(this.formData)
      .pipe(finalize(() => this.loadingService.hide()))
      .subscribe({
        next: (res) => {
          this.partnerCode = res.body?.partnerCode;
          this.doLogin();
        },
        error: (err: any) => {
          this.submitting = false;
          this.toastr.error(err?.error?.detail || 'Registration failed. Please try again.');
        },
      });
  }

  private doLogin(): void {
    const input = new Login();
    input.username = this.formData.email;
    input.password = this.formData.password;
    this.dataService.login(input.forRequest()).subscribe({
      next: (response) => {
        const idToken = response.body!.id_token;
        this.localStorageService.storeAuthenticationToken(idToken);
        const { id, authorities } = this.authService.decodeToken(idToken);
        this.localStorageService.setObject('user', { id, authorities });
        this.step.set(3);
      },
      error: () => this.step.set(3),
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/partner-portal/dashboard']);
  }
}

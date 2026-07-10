import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { ReCaptchaV3Service } from 'ng-recaptcha-2';
import { AgentDataService } from '../shared/services/agent-data.service';
import { AgentRegistration } from '../../models/agent.model';
import { DataService } from '../shared/services/data.service';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { LoadingService } from '../common/loading.service';
import { Login } from '../../models/login';
import { AuthService } from '../../models/auth.services';

@Component({
  selector: 'app-create-agent-account',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-agent-account.component.html',
  styleUrl: './create-agent-account.component.scss',
})
export class CreateAgentAccountComponent implements OnInit {
  step = signal(1);
  totalSteps = 3;

  formData: AgentRegistration = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    companyName: '',
    address: '',
    barRegNo: '',
    website: '',
    captchaResponse: '',
  };

  passwordVisible = false;
  confirmPassword = '';
  confirmPasswordVisible = false;
  onClickValidation = false;
  submitting = false;

  benefits = [
    { icon: '📂', text: 'Manage 100s of trademark portfolios' },
    { icon: '🔔', text: 'Conflict alerts with AI scoring' },
    { icon: '📊', text: 'Excel bulk import in seconds' },
    { icon: '👁', text: 'Real-time Trademark Watch service' },
    { icon: '📅', text: 'Renewal deadline tracking' },
  ];

  constructor(
    private readonly agentDataService: AgentDataService,
    private readonly dataService: DataService,
    private readonly localStorageService: LocalStorageService,
    private readonly loadingService: LoadingService,
    private readonly toastr: ToastrService,
    private readonly router: Router,
    private readonly recaptchaV3Service: ReCaptchaV3Service,
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
    this.recaptchaV3Service.execute('agent_register').subscribe({
      next: (token: string) => {
        this.formData.captchaResponse = token;
        this.agentDataService.registerAgent(this.formData)
          .pipe(finalize(() => this.loadingService.hide()))
          .subscribe({
            next: () => this.doLogin(),
            error: (err: any) => {
              this.submitting = false;
              this.toastr.error(err?.error?.detail || 'Registration failed. Please try again.');
            },
          });
      },
      error: () => {
        this.submitting = false;
        this.loadingService.hide();
        this.toastr.error('CAPTCHA verification failed. Please try again.');
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
        // Agent accounts have no UserProfile row, so decode the role/id
        // straight from the token instead of hitting /api/current-user.
        const { id, authorities } = this.authService.decodeToken(idToken);
        this.localStorageService.setObject('user', { id, authorities });
        this.step.set(3);
      },
      error: () => this.step.set(3),
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/agent-portal/dashboard']);
  }
}

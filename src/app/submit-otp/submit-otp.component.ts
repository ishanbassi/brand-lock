import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../shared/services/data.service';
type Status = 'idle' | 'loading' | 'success' | 'error';


@Component({
  selector: 'app-submit-otp',
  imports: [CommonModule, FormsModule],
  templateUrl: './submit-otp.component.html',
  styleUrl: './submit-otp.component.scss'
})
export class SubmitOtpComponent {
  phoneNumber = signal('6239771006');
  otp = signal('');
  status = signal<Status>('idle');
  message = signal('');
 
 
  constructor(private dataService:DataService) {}
 
  get canSubmit(): boolean {
    return this.phoneNumber().length >= 10 && this.otp().length >= 4;
  }
 
  onOtpInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Only allow digits
    input.value = input.value.replace(/\D/g, '').slice(0, 6);
    this.otp.set(input.value);
  }
 
  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '').slice(0, 10);
    this.phoneNumber.set(input.value);
  }
 
  submit(): void {
    if (!this.canSubmit) return;
 
    this.status.set('loading');
    this.message.set('');

    this.dataService.submitOtp({
      phoneNumber: this.phoneNumber(),
      otp: this.otp()
    }).subscribe({
      next: (res) => {
        this.status.set('success');
        this.message.set(res?.message ?? 'OTP submitted successfully.');
        this.otp.set('');
      },
      error: (err) => {
        this.status.set('error');
        this.message.set(err?.error?.message ?? 'Failed to submit OTP. Try again.');
      }
    })
 
    
  }
 
  reset(): void {
    this.status.set('idle');
    this.message.set('');
  }

}

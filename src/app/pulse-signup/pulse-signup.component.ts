import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { TRADEMARK_CLASSES } from '../pages/trademark-classes/trademark-classes.component';
import { PulseService } from '../shared/services/pulse.service';

/**
 * Free weekly "Trademark Pulse" email digest opt-in, scoped to one NICE class — placed
 * on the /trademark-pulse live-stats page since visitors there are already interested in
 * filing activity. Separate from the per-application status-watch signup: broader,
 * lower-intent, but still a real lead once confirmed.
 */
@Component({
  selector: 'app-pulse-signup',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pulse-signup.component.html',
  styleUrl: './pulse-signup.component.scss',
})
export class PulseSignupComponent {
  readonly classes = TRADEMARK_CLASSES;

  submitted = false;
  isSubmitting = false;
  errorMessage: string | null = null;

  form = new FormGroup({
    tmClass: new FormControl<number | null>(null, [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  constructor(private readonly pulseService: PulseService) {}

  submit(): void {
    if (this.isSubmitting) {
      return;
    }
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = null;
    this.pulseService
      .subscribe(this.form.value.tmClass!, this.form.value.email!)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => (this.submitted = true),
        error: () => (this.errorMessage = 'Something went wrong. Please try again in a moment.'),
      });
  }
}

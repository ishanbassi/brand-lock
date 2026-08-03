import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ITrademark } from '../../models/trademark.model';
import { StatusWatchService } from '../shared/services/status-watch.service';

/**
 * Free, email-only "notify me when this application's status changes" strip on the
 * trademark detail page. Deliberately lightweight — a single email field, no phone —
 * so visitors who aren't ready for a callback still leave an address we can build a
 * real relationship on. Separate from the paid /trademark-watch service (which watches
 * for new conflicting filings across a whole brand) - this only tracks this one
 * application's status.
 */
@Component({
  selector: 'app-status-watch-signup',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './status-watch-signup.component.html',
  styleUrl: './status-watch-signup.component.scss',
})
export class StatusWatchSignupComponent implements OnChanges {
  @Input() trademark?: ITrademark | null;

  submitted = false;
  isSubmitting = false;
  errorMessage: string | null = null;

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  constructor(private readonly statusWatchService: StatusWatchService) {}

  ngOnChanges(_: SimpleChanges): void {
    this.submitted = false;
    this.errorMessage = null;
    this.form.reset();
  }

  submit(): void {
    if (!this.trademark?.id || this.isSubmitting) {
      return;
    }
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = null;
    this.statusWatchService
      .subscribe(this.trademark.id, this.form.value.email!)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => (this.submitted = true),
        error: () => (this.errorMessage = 'Something went wrong. Please try again in a moment.'),
      });
  }
}

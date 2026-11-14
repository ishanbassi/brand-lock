import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AdminPublicProfileSuppressionService,
  IPublicProfileSuppression,
  NewPublicProfileSuppression,
} from '../services/admin-public-profile-suppression.service';

type RemovalForm = {
  url: string;
  reason: string;
  caseReference: string;
};

function emptyForm(): RemovalForm {
  return { url: '', reason: '', caseReference: '' };
}

/**
 * A narrow operational control for honouring a public-profile removal request.
 * The registry row remains intact; only the address-scoped public portfolio is suppressed.
 */
@Component({
  selector: 'app-admin-profile-removals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-profile-removals.component.html',
  styleUrl: './admin-profile-removals.component.scss',
})
export class AdminProfileRemovalsComponent implements OnInit {
  private readonly suppressionService = inject(AdminPublicProfileSuppressionService);

  suppressions = signal<IPublicProfileSuppression[]>([]);
  loading = signal(true);
  saving = signal(false);
  restoringId = signal<number | null>(null);
  error = signal('');
  success = signal('');
  form: RemovalForm = emptyForm();

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.suppressionService.list().subscribe({
      next: items => {
        this.suppressions.set(items ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load public-profile removals.');
        this.loading.set(false);
      },
    });
  }

  suppress(): void {
    if (!this.form.url.trim()) {
      this.error.set('Enter the exact Trademarx proprietor-profile URL to remove.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    const request: NewPublicProfileSuppression = {
      url: this.form.url.trim(),
      reason: this.form.reason.trim() || null,
      caseReference: this.form.caseReference.trim() || null,
    };
    this.suppressionService.suppress(request).subscribe({
      next: suppression => {
        this.suppressions.update(items => [suppression, ...items.filter(item => item.id !== suppression.id)]);
        this.form = emptyForm();
        this.saving.set(false);
        this.success.set('The public profile now returns 410 Gone and is excluded from the sitemap.');
      },
      error: response => {
        this.error.set(response?.error?.detail || response?.error?.message || 'Could not remove that public profile.');
        this.saving.set(false);
      },
    });
  }

  restore(suppression: IPublicProfileSuppression): void {
    this.restoringId.set(suppression.id);
    this.error.set('');
    this.suppressionService.restore(suppression.id).subscribe({
      next: () => {
        this.suppressions.update(items => items.filter(item => item.id !== suppression.id));
        this.restoringId.set(null);
        this.success.set('The public profile has been restored and may be included in future sitemap output.');
      },
      error: () => {
        this.error.set('Could not restore that public profile.');
        this.restoringId.set(null);
      },
    });
  }
}

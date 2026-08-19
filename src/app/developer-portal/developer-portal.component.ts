import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import {
  ApiConsumerRegistration,
  ApiConsumerRegistrationResult,
  DeveloperPortalDataService,
} from '../shared/services/developer-portal-data.service';

@Component({
  selector: 'app-developer-portal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './developer-portal.component.html',
  styleUrl: './developer-portal.component.scss',
})
export class DeveloperPortalComponent {
  formData: ApiConsumerRegistration = {
    name: '',
    email: '',
    companyName: '',
    registeredDomain: '',
    useCase: '',
  };

  submitting = false;
  result = signal<ApiConsumerRegistrationResult | null>(null);
  keyCopied = signal(false);
  snippetCopied = signal(false);

  // Absolute, not bare paths: the API answers on admin.trademarx.in, so a reader who copies a
  // path off this page and appends it to the domain they are reading it on gets a 404.
  endpoints = [
    {
      method: 'GET',
      path: 'https://admin.trademarx.in/api/public/v1/trademarks/search?name=nike&class=25',
      description: 'Keyword search across the public register — filter by mark name and/or NICE class.',
    },
    {
      method: 'GET',
      path: 'https://admin.trademarx.in/api/public/v1/trademarks/journal?journalNo=2145',
      description: 'A journal’s published filings, or the latest filings if journalNo is omitted.',
    },
    {
      method: 'GET',
      path: 'https://admin.trademarx.in/api/public/v1/trademarks/5348291/status',
      description: 'Current status of a single trademark by application number.',
    },
  ];

  constructor(
    private readonly developerPortalDataService: DeveloperPortalDataService,
    private readonly toastr: ToastrService,
  ) {}

  submit(): void {
    if (!this.formData.name || !this.formData.email || !this.formData.registeredDomain) {
      this.toastr.error('Name, email and the domain you’ll add the attribution link to are required.');
      return;
    }
    this.submitting = true;
    this.developerPortalDataService
      .register(this.formData)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: res => this.result.set(res),
        error: err => this.toastr.error(err?.error?.message || err?.error?.detail || 'Registration failed. Please try again.'),
      });
  }

  copyKey(): void {
    const key = this.result()?.apiKey;
    if (!key) return;
    navigator.clipboard.writeText(key).then(() => {
      this.keyCopied.set(true);
      setTimeout(() => this.keyCopied.set(false), 2000);
    });
  }

  copySnippet(): void {
    const snippet = this.result()?.attributionSnippetHtml;
    if (!snippet) return;
    navigator.clipboard.writeText(snippet).then(() => {
      this.snippetCopied.set(true);
      setTimeout(() => this.snippetCopied.set(false), 2000);
    });
  }
}

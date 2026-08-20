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
  ];

  specUrl = 'https://admin.trademarx.in/v3/api-docs/public-api';

  responseFields = [
    {
      field: 'name',
      notes: 'The mark as filed. Frequently null — device/figurative marks are often filed without a word element.',
    },
    { field: 'applicationNo', notes: 'The registry application number. Always present; this is the stable identifier to key on.' },
    { field: 'tmClass', notes: 'NICE class, 1–45.' },
    { field: 'details', notes: 'The goods/services specification text as published.' },
    {
      field: 'trademarkStatus',
      notes:
        'Free text as shown by the registry ("Registered", "Abandoned", "Formalities Chk Pass"…). There is no fixed vocabulary — match loosely. Null for the majority of the register, where the registry has not published a status — read null as "not published", not as "no status exists".',
    },
    { field: 'proprietorName', notes: 'Applicant/owner name as filed.' },
    { field: 'applicationDate', notes: 'Filing date, YYYY-MM-DD.' },
    { field: 'imgUrl', notes: 'Absolute URL to the mark image, or null for word marks.' },
    { field: 'type', notes: 'TRADEMARK, IMAGEMARK, or null where not classified.' },
    { field: 'url', notes: "Canonical trademarx.in page for the record — handy if you're linking out for the attribution requirement." },
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
        error: err => this.toastr.error(this.readableError(err)),
      });
  }

  /**
   * Server errors arrive in three shapes and only two of them are fit to show a person:
   * bean-validation failures carry a `fieldErrors` array, business rejections carry a `detail`
   * sentence, and `message` is the machine-readable i18n key ("error.emailexists"). Reading
   * `message` first — as this used to — put that raw key in front of the user.
   */
  private readableError(err: any): string {
    const fieldErrors = err?.error?.fieldErrors;
    if (Array.isArray(fieldErrors) && fieldErrors.length) {
      return fieldErrors.map((f: any) => `${f.field}: ${f.message}`).join('. ');
    }
    const detail = err?.error?.detail;
    if (typeof detail === 'string' && detail.trim() && !detail.startsWith('4') && !detail.includes('ProblemDetail')) {
      return detail;
    }
    return 'Registration failed. Please try again.';
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

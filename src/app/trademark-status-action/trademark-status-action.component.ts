import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import dayjs from 'dayjs/esm';
import { finalize } from 'rxjs';
import { ITrademark } from '../../models/trademark.model';
import { NewLead } from '../../models/lead.model';
import { LeadService } from '../shared/services/lead.service';
import { GoogleConversionTrackingService } from '../shared/services/google-conversion-tracking.service';

type ActionKey = 'OBJECTION' | 'OPPOSITION' | 'HEARING' | 'RENEWAL' | 'REFILE' | 'PENDING' | 'REGISTERED';

interface StatusAction {
  key: ActionKey;
  badge: string;
  urgency: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  deadline?: string;
  serviceLabel: string;
  serviceLink: string;
  serviceQueryParams?: Record<string, string>;
  formHeading: string;
}

/**
 * Status-aware action card for the trademark detail page. Visitors landing on a
 * detail page are usually checking their own (or a competitor's) application, so
 * the offer is matched to what the registry status actually calls for — objection
 * reply, opposition defence, renewal, or a fresh filing.
 */
@Component({
  selector: 'app-trademark-status-action',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './trademark-status-action.component.html',
  styleUrl: './trademark-status-action.component.scss'
})
export class TrademarkStatusActionComponent implements OnChanges {
  @Input() trademark?: ITrademark | null;

  action: StatusAction | null = null;
  submitted = false;
  isSubmitting = false;
  whatsappNumber = '916239771006';

  leadForm = new FormGroup({
    fullName: new FormControl(''),
    phoneNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{10}')]),
  });

  constructor(
    private readonly leadService: LeadService,
    private readonly toastService: ToastrService,
    private readonly googleConversionTrackingService: GoogleConversionTrackingService,
  ) {}

  ngOnChanges(_: SimpleChanges): void {
    this.action = this.resolveAction();
  }

  private resolveAction(): StatusAction | null {
    if (!this.trademark) {
      return null;
    }
    const status = (this.trademark.trademarkStatus || '').toLowerCase();
    const name = this.trademark.name || `application #${this.trademark.applicationNo}`;

    if (status.includes('object')) {
      return {
        key: 'OBJECTION',
        badge: 'Action Required',
        urgency: 'high',
        title: 'This trademark has been objected by the Registry',
        description: `An examination objection means the Registrar has raised concerns against "${name}" — usually under Section 9 or Section 11 of the Trade Marks Act. A well-drafted reply from an experienced attorney resolves most objections.`,
        deadline: 'A reply must be filed within 30 days of receiving the examination report, or the application may be treated as abandoned.',
        serviceLabel: 'See Objection Reply Service',
        serviceLink: '/trademark-objection-reply',
        formHeading: 'Get a free objection assessment',
      };
    }
    if (status.includes('oppos')) {
      return {
        key: 'OPPOSITION',
        badge: 'Time-Sensitive',
        urgency: 'high',
        title: 'This trademark is facing opposition',
        description: `A third party has opposed the registration of "${name}". A counter-statement must be filed to keep the application alive — missing it means the application is deemed abandoned.`,
        deadline: 'The counter-statement is due within 2 months of receiving the notice of opposition.',
        serviceLabel: 'See Opposition Defence Service',
        serviceLink: '/trademark-opposition',
        formHeading: 'Talk to an opposition specialist',
      };
    }
    if (status.includes('hearing')) {
      return {
        key: 'HEARING',
        badge: 'Hearing Scheduled',
        urgency: 'high',
        title: 'A show-cause hearing is involved for this trademark',
        description: `The Registrar has listed "${name}" for a hearing. Being properly represented — with written submissions and case-law support — makes the difference between acceptance and refusal.`,
        deadline: 'Missing the hearing date usually leads to the application being abandoned or refused.',
        serviceLabel: 'See Hearing Support Service',
        serviceLink: '/trademark-hearing',
        formHeading: 'Get representation for the hearing',
      };
    }
    if (status.includes('registered') || status.includes('renew')) {
      const renewalDue = this.renewalDueDate();
      const dueSoon = renewalDue != null && renewalDue.isBefore(dayjs().add(12, 'month'));
      return {
        key: 'RENEWAL',
        badge: dueSoon ? 'Renewal Due' : 'Registered',
        urgency: dueSoon ? 'high' : 'low',
        title: dueSoon
          ? 'This trademark registration is due for renewal'
          : 'This trademark is registered — keep it protected',
        description: `A trademark registration is valid for 10 years and must be renewed to stay in force.${renewalDue ? ` For "${name}", renewal falls due around ${renewalDue.format('DD MMM YYYY')}.` : ''} A lapsed mark can be picked up by competitors.`,
        deadline: dueSoon
          ? 'File renewal before the due date to avoid restoration costs and the risk of removal from the register.'
          : undefined,
        serviceLabel: 'See Renewal Service',
        serviceLink: '/trademark-renewal',
        formHeading: dueSoon ? 'Get renewal handled by experts' : 'Set up a renewal reminder',
      };
    }
    if (
      status.includes('abandon') ||
      status.includes('refus') ||
      status.includes('reject') ||
      status.includes('withdraw') ||
      status.includes('removed')
    ) {
      return {
        key: 'REFILE',
        badge: 'Can Be Re-Filed',
        urgency: 'medium',
        title: 'This application did not go through — it can be filed again',
        description: `The application for "${name}" is no longer active. In most cases a fresh, properly drafted application (right class, right description, prior-use evidence) succeeds where the earlier one failed.`,
        serviceLabel: 'Re-File This Trademark',
        serviceLink: '/trademark-registration/your-info',
        serviceQueryParams: this.trademark.name ? { trademark: this.trademark.name } : undefined,
        formHeading: 'Get a free re-filing consultation',
      };
    }
    // Everything else — formalities check, marked for exam, advertised, Vienna
    // codification, unknown — is an application still working through the pipeline.
    return {
      key: 'PENDING',
      badge: 'In Progress',
      urgency: 'low',
      title: 'Is this your trademark application?',
      description: `"${name}" is still moving through the registration pipeline. Most applications hit at least one hurdle — objection, opposition or a hearing — and deadlines at each stage are short. Get notified the moment the status changes.`,
      serviceLabel: 'See Trademark Watch Service',
      serviceLink: '/trademark-watch',
      formHeading: 'Get free status guidance',
    };
  }

  /** Registration runs 10 years from the application date. */
  private renewalDueDate(): dayjs.Dayjs | null {
    if (this.trademark?.renewalDate) {
      return this.trademark.renewalDate;
    }
    if (this.trademark?.applicationDate) {
      return this.trademark.applicationDate.add(10, 'year');
    }
    return null;
  }

  get whatsappLink(): string {
    const message = encodeURIComponent(
      `Hi! I need help regarding trademark "${this.trademark?.name || ''}" (Application No: ${this.trademark?.applicationNo}), current status: ${this.trademark?.trademarkStatus || 'Unknown'}.`
    );
    return `https://wa.me/${this.whatsappNumber}?text=${message}`;
  }

  submit(): void {
    if (!this.action || this.isSubmitting) {
      return;
    }
    this.leadForm.markAllAsTouched();
    if (!this.leadForm.valid) {
      return;
    }
    const now = dayjs();
    const lead: NewLead = {
      id: null,
      fullName: this.leadForm.value.fullName || null,
      phoneNumber: this.leadForm.value.phoneNumber,
      brandName: this.trademark?.name ?? null,
      tmClass: this.trademark?.tmClass ?? null,
      comments: `${this.action.formHeading} — "${this.trademark?.name || ''}" App #${this.trademark?.applicationNo}, status: ${this.trademark?.trademarkStatus || 'Unknown'} [${this.action.key}]`,
      leadSource: 'TM_DETAIL_STATUS_CTA',
      contactMethod: 'CALL',
      status: 'NEW',
      createdDate: now,
      modifiedDate: now,
      deleted: false,
    };
    this.isSubmitting = true;
    this.leadService
      .create(lead)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.submitted = true;
          this.googleConversionTrackingService.reportLeadFormSubmit();
        },
        error: () => {
          this.toastService.error('There were some issues while submitting. Please try later.');
        },
      });
  }
}

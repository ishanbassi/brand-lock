import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdminEfilingService } from '../services/admin-efiling.service';
import {
  EFILING_STATUS_OPTIONS,
  EfilingChecklist,
  EfilingStatus,
  EfilingUpdate,
  SIGNER_ID_STATUS_OPTIONS,
  efilingBadgeClass,
  efilingStatusLabel,
  signerIdBadgeClass,
  signerIdStatusLabel,
} from '../shared/efiling.model';
import { SignerIdStatus } from '../../../models/dashboard-stats.model';

/**
 * The filing workbench: one application's data laid out in the order IP India's own
 * forms ask for it, with copy buttons, so an admin can work this screen beside
 * ipindiaonline.gov.in without hunting through the rest of the admin portal.
 *
 * This records what the admin did. It never touches the government portal itself —
 * the proprietor-code match is a judgement call, and the eSign OTP can only come from
 * the applicant.
 */
@Component({
  selector: 'app-admin-efiling-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-efiling-detail.component.html',
  styleUrl: './admin-efiling-detail.component.scss',
})
export class AdminEfilingDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly efilingService = inject(AdminEfilingService);
  private readonly toast = inject(ToastrService);

  checklist = signal<EfilingChecklist | null>(null);
  loading = signal(true);
  saving = signal(false);
  error = signal('');

  /** Which copy button was last pressed, so it can flash "Copied". */
  copiedKey = signal('');

  // Editable models
  efilingStatusModel: EfilingStatus = 'NOT_STARTED';
  signerIdStatusModel: SignerIdStatus = 'NOT_STARTED';
  esignSignerIdModel = '';
  proprietorCodeModel = '';
  efilingUserIdModel = '';
  applicationNoModel: number | null = null;
  notesModel = '';

  readonly statusOptions = EFILING_STATUS_OPTIONS;
  readonly signerStatusOptions = SIGNER_ID_STATUS_OPTIONS;
  readonly badgeClass = efilingBadgeClass;
  readonly statusLabel = efilingStatusLabel;
  readonly signerBadgeClass = signerIdBadgeClass;
  readonly signerLabel = signerIdStatusLabel;

  readonly ipIndiaRegistrationUrl = 'https://ipindiaonline.gov.in/trademarkefiling/user/frmNewRegistration.aspx';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.efilingService.checklist(id).subscribe({
      next: res => {
        this.apply(res.body);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load this application.');
        this.loading.set(false);
      },
    });
  }

  private apply(data: EfilingChecklist | null): void {
    this.checklist.set(data);
    if (!data) return;
    this.efilingStatusModel = data.efilingStatus ?? 'NOT_STARTED';
    this.signerIdStatusModel = data.signerIdStatus ?? 'NOT_STARTED';
    this.esignSignerIdModel = data.esignSignerId ?? '';
    this.proprietorCodeModel = data.proprietorCode ?? '';
    this.efilingUserIdModel = data.efilingUserId ?? '';
    this.applicationNoModel = data.applicationNo ?? null;
    this.notesModel = data.efilingNotes ?? '';
  }

  save(): void {
    const current = this.checklist();
    if (!current) return;

    // Send only what changed — the backend leaves nulls untouched, so an untouched
    // Proprietor Code can never be blanked by saving an unrelated field.
    const update: EfilingUpdate = {};
    if (this.efilingStatusModel !== current.efilingStatus) update.efilingStatus = this.efilingStatusModel;
    if (this.signerIdStatusModel !== current.signerIdStatus) update.signerIdStatus = this.signerIdStatusModel;
    if (this.esignSignerIdModel !== (current.esignSignerId ?? '')) update.esignSignerId = this.esignSignerIdModel;
    if (this.proprietorCodeModel !== (current.proprietorCode ?? '')) update.proprietorCode = this.proprietorCodeModel;
    if (this.efilingUserIdModel !== (current.efilingUserId ?? '')) update.efilingUserId = this.efilingUserIdModel;
    if (this.notesModel !== (current.efilingNotes ?? '')) update.efilingNotes = this.notesModel;
    if (this.applicationNoModel != null && this.applicationNoModel !== current.applicationNo) {
      update.applicationNo = this.applicationNoModel;
    }

    if (Object.keys(update).length === 0) {
      this.toast.info('Nothing to save');
      return;
    }

    this.saving.set(true);
    this.efilingService.update(current.trademarkId, update).subscribe({
      next: res => {
        this.apply(res.body);
        this.saving.set(false);
        this.toast.success('Filing progress saved');
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Failed to save filing progress');
      },
    });
  }

  /** Copy a value into the clipboard so it can be pasted into the IP India form. */
  copy(key: string, value?: string | number | null): void {
    if (value === null || value === undefined || value === '') return;
    void navigator.clipboard.writeText(String(value)).then(
      () => {
        this.copiedKey.set(key);
        setTimeout(() => {
          if (this.copiedKey() === key) this.copiedKey.set('');
        }, 1500);
      },
      () => this.toast.error('Could not copy to clipboard'),
    );
  }

  get isReady(): boolean {
    return (this.checklist()?.blockers?.length ?? 1) === 0;
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TrademarkService } from '../shared/services/trademark.service';

interface CompletedCertificateSnapshot {
  applicationNo: number;
  requestId?: string | null;
  name?: string | null;
  tmClass?: number | null;
  trademarkStatus?: string | null;
  proprietorName?: string | null;
  applicationDate?: string | null;
  completedAt: number;
}

const COMPLETED_CERTIFICATE_STORAGE_KEY = 'trademarx.certificate-complete';
const COMPLETED_CERTIFICATE_RETENTION_MS = 30 * 60_000;

@Component({
  selector: 'app-trademark-certificate-download-complete',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './trademark-certificate-download-complete.component.html',
  styleUrl: './trademark-certificate-download-complete.component.scss',
})
export class TrademarkCertificateDownloadCompleteComponent implements OnInit {
  certificate: CompletedCertificateSnapshot | null = null;
  phoneNumber = '';
  isDownloading = false;
  downloadMessage = '';
  manualDeliveryMessage = '';
  manualDeliveryError = '';
  isManualDeliverySubmitting = false;

  constructor(private readonly trademarkService: TrademarkService) {}

  ngOnInit(): void {
    this.certificate = this.readCertificate();
  }

  displayName(): string {
    return this.certificate?.name?.trim() || 'Trademark registration';
  }

  initials(): string {
    return this.displayName()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  }

  downloadAgain(): void {
    if (!this.certificate || this.isDownloading) return;

    this.isDownloading = true;
    this.downloadMessage = 'Preparing your certificate download.';
    this.trademarkService
      .downloadRegistrationCertificate(this.certificate.applicationNo, this.certificate.requestId ?? undefined)
      .subscribe({
        next: response => {
          const url = URL.createObjectURL(response.body!);
          const link = document.createElement('a');
          link.href = url;
          link.download = `trademark-registration-certificate-${this.certificate?.applicationNo}.pdf`;
          link.click();
          URL.revokeObjectURL(url);
          this.isDownloading = false;
          this.downloadMessage = 'Your certificate download has started.';
        },
        error: () => {
          this.isDownloading = false;
          this.downloadMessage =
            'The certificate is no longer available. Please request it again.';
        },
      });
  }

  requestManualCopy(): void {
    if (!this.certificate) return;
    const phoneNumber = this.phoneNumber.trim();
    if (!/^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(phoneNumber.replace(/[\s-]/g, ''))) {
      this.manualDeliveryError = 'Enter a valid 10-digit Indian mobile number.';
      return;
    }

    this.manualDeliveryError = '';
    this.manualDeliveryMessage = '';
    this.isManualDeliverySubmitting = true;
    this.trademarkService
      .requestCertificateManualDelivery(this.certificate.applicationNo, phoneNumber, this.certificate.requestId ?? undefined)
      .subscribe({
        next: response => {
          if (this.certificate) this.certificate.requestId = response.requestId;
          this.isManualDeliverySubmitting = false;
          this.manualDeliveryMessage = 'Your manual-delivery request has been saved. Our team will contact you.';
        },
        error: () => {
          this.isManualDeliverySubmitting = false;
          this.manualDeliveryError = 'We could not save your request. Please try again.';
        },
      });
  }

  private readCertificate(): CompletedCertificateSnapshot | null {
    try {
      const raw = localStorage.getItem(COMPLETED_CERTIFICATE_STORAGE_KEY);
      if (!raw) return null;
      const certificate = JSON.parse(raw) as CompletedCertificateSnapshot;
      if (
        !Number.isSafeInteger(certificate.applicationNo) ||
        !Number.isFinite(certificate.completedAt) ||
        Date.now() - certificate.completedAt > COMPLETED_CERTIFICATE_RETENTION_MS
      ) {
        localStorage.removeItem(COMPLETED_CERTIFICATE_STORAGE_KEY);
        return null;
      }
      return certificate;
    } catch {
      return null;
    }
  }
}

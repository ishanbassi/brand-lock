import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TrademarkService } from '../shared/services/trademark.service';

interface CompletedCertificateSnapshot {
  applicationNo: number;
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
  email = '';
  isDownloading = false;
  downloadMessage = '';

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
      .downloadRegistrationCertificate(this.certificate.applicationNo)
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

  requestEmailCopy(): void {
    if (!this.certificate) return;

    const subject = encodeURIComponent(
      `Certificate copy request — Application No. ${this.certificate.applicationNo}`,
    );
    const recipient = this.email.trim() || 'the email address entered on this page';
    const body = encodeURIComponent(
      `Please send a copy of the trademark registration certificate for application number ${this.certificate.applicationNo} to ${recipient}.`,
    );
    window.location.href = `mailto:support@trademarx.in?subject=${subject}&body=${body}`;
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

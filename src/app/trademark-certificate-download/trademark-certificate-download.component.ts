import { CommonModule } from '@angular/common';
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

import { CreateOrderResponse } from '../../models/create-order-response.model';
import { RazorPayOrderResponse } from '../../models/razorpay-order-response.model';
import { ITrademark } from '../../models/trademark.model';
import { environment } from '../../environments/environment';
import { ScriptLoaderService } from '../shared/services/script-loader.service';
import { SeoService } from '../shared/services/seo.service';
import { ServicePaymentService } from '../shared/services/service-payment.service';
import {
  ICertificateDownloadStatus,
  TrademarkService,
} from '../shared/services/trademark.service';
import { WindowRefService } from '../shared/services/window-ref.service';

type SearchMode = 'application' | 'name';

interface CertificateRequestSnapshot {
  applicationNo: number;
  name?: string | null;
  tmClass?: number | null;
  trademarkStatus?: string | null;
  savedAt: number;
}

interface CompletedCertificateSnapshot extends CertificateRequestSnapshot {
  proprietorName?: string | null;
  applicationDate?: string | null;
  completedAt: number;
}

const PAGE_URL = 'https://trademarx.in/trademark-certificate-download';
const PAGE_TITLE =
  'How to Download Trademark Registration Certificate Online | Trademarx';
const PAGE_DESCRIPTION =
  'Learn how to download a trademark certificate online in India. Search by application number or trademark name, confirm registration status, and continue to the official IP India registry.';
const CERTIFICATE_DOWNLOAD_SERVICE = 'TRADEMARK_CERTIFICATE_DOWNLOAD';
const CERTIFICATE_DOWNLOAD_AMOUNT = 50;
const CERTIFICATE_DOWNLOAD_TIMEOUT_MS = 60_000;
const CERTIFICATE_REQUEST_STORAGE_KEY = 'trademarx.certificate-request';
const CERTIFICATE_REQUEST_RETENTION_MS = 30 * 60_000;
const COMPLETED_CERTIFICATE_STORAGE_KEY = 'trademarx.certificate-complete';
const CERTIFICATE_PAYMENT_REQUIRED = false;

@Component({
  selector: 'app-trademark-certificate-download',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './trademark-certificate-download.component.html',
  styleUrl: './trademark-certificate-download.component.scss',
})
export class TrademarkCertificateDownloadComponent
  implements OnInit, OnDestroy
{
  readonly officialRegistryUrl =
    'https://ipindiaonline.gov.in/tmrpublicsearch/frmmain.aspx';

  mode: SearchMode = 'application';
  query = '';
  selectedClass: number | null = null;
  readonly trademarkClasses = Array.from({ length: 45 }, (_, index) => index + 1);
  private readonly missingTrademarkImages = new Set<string>();
  results: ITrademark[] = [];
  selectedTrademark: ITrademark | null = null;
  isLoading = false;
  hasSearched = false;
  errorMessage = '';
  isCertificateUnlockOpen = false;
  isCertificatePaymentStarting = false;
  isCertificatePaymentVerifying = false;
  isCertificateLoading = false;
  isCertificateReady = false;
  isCertificateErrorOpen = false;
  certificateMessage = '';
  certificateErrorMessage = '';
  certificateProgress = 0;
  certificateStep = 0;
  private certificatePollTimer?: number;
  private certificateProgressTimer?: number;
  private certificateTimeoutTimer?: number;
  private certificateReadyApplicationNo?: number;

  readonly faqs = [
    {
      question:
        'How do I download a trademark registration certificate online?',
      answer:
        'First find your trademark using its application number or trademark name. Confirm that its registry status is Registered, then use the official IP India registry search with the application number to download the certificate issued for that mark.',
    },
    {
      question: 'Can I download a trademark certificate with a trademark name?',
      answer:
        'Yes. Search the trademark name to locate the matching record and application number. The application number is the most reliable reference to use when continuing to the official certificate search.',
    },
    {
      question: 'Why can’t I download my trademark certificate?',
      answer:
        'A registration certificate is available only after the Trade Marks Registry records the application as Registered. Marks that are pending, objected, opposed, refused, or abandoned do not yet have a registration certificate to download.',
    },
  ];

  constructor(
    private readonly trademarkService: TrademarkService,
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
    private readonly servicePaymentService: ServicePaymentService,
    private readonly scriptLoaderService: ScriptLoaderService,
    private readonly windowRef: WindowRefService,
    private readonly toastService: ToastrService,
    private readonly ngZone: NgZone,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.title.setTitle(PAGE_TITLE);
    this.meta.updateTag({ name: 'description', content: PAGE_DESCRIPTION });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: PAGE_TITLE });
    this.meta.updateTag({
      property: 'og:description',
      content: PAGE_DESCRIPTION,
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: PAGE_URL });
    this.seo.setCanonical(PAGE_URL);
    this.seo.injectJsonLd(
      [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://trademarx.in/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Trademark Certificate Download',
              item: PAGE_URL,
            },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: PAGE_TITLE,
          description: PAGE_DESCRIPTION,
          url: PAGE_URL,
          isPartOf: {
            '@type': 'WebSite',
            name: 'Trademarx',
            url: 'https://trademarx.in',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: this.faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        },
      ],
      'trademark-certificate-download',
    );
    this.restoreCertificateRequest();
  }

  ngOnDestroy(): void {
    this.clearCertificateRequest();
    this.seo.removeJsonLd('trademark-certificate-download');
  }

  setMode(mode: SearchMode): void {
    if (this.mode === mode) return;
    this.mode = mode;
    this.query = '';
    this.selectedClass = null;
    this.resetResults();
  }

  onApplicationNumberChange(value: string): void {
    this.query = value.replace(/\D/g, '').slice(0, 10);
  }

  search(): void {
    const query = this.query.trim();
    if (!query || this.isLoading) return;

    this.isLoading = true;
    this.hasSearched = true;
    this.errorMessage = '';
    this.results = [];
    this.selectedTrademark = null;
    this.clearCertificateRequest();
    this.clearPersistedCertificateRequest();
    this.certificateMessage = '';

    const request =
      this.mode === 'application'
        ? this.trademarkService.searchByApplicationNumber(query)
        : this.trademarkService.liveSearch(query, this.selectedClass);

    request.pipe(finalize(() => (this.isLoading = false))).subscribe({
      next: (response) => {
        const responseResults = response.body ?? [];
        // A filing can be represented by multiple class rows. On this certificate page an
        // application-number lookup always presents the canonical first row as one record.
        this.results =
          this.mode === 'application'
            ? responseResults.slice(0, 1)
            : responseResults;
        if (this.results.length > 0) this.selectTrademark(this.results[0]);
      },
      error: () => {
        this.errorMessage =
          'We could not reach the trademark register. Please try again in a moment.';
      },
    });
  }

  selectTrademark(trademark: ITrademark): void {
    this.clearCertificateRequest();
    this.clearPersistedCertificateRequest();
    this.certificateMessage = '';
    this.selectedTrademark = trademark;
    window.setTimeout(() =>
      document
        .getElementById('certificate-result')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  }

  hasTrademarkImage(trademark: ITrademark): boolean {
    return !!trademark.imgUrl && !this.missingTrademarkImages.has(trademark.imgUrl);
  }

  trademarkImageUrl(trademark: ITrademark): string {
    return `${environment.BaseApiUrl}files/${trademark.imgUrl}`;
  }

  markImageUnavailable(trademark: ITrademark): void {
    if (trademark.imgUrl) this.missingTrademarkImages.add(trademark.imgUrl);
  }

  trademarkInitials(trademark: ITrademark): string {
    return this.displayName(trademark)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  }

  isRegistered(trademark: ITrademark | null): boolean {
    return (
      !!trademark?.trademarkStatus &&
      trademark.trademarkStatus.toLowerCase().includes('registered')
    );
  }

  openOfficialRegistry(): void {
    window.open(this.officialRegistryUrl, '_blank', 'noopener,noreferrer');
  }

  openCertificateUnlockModal(): void {
    const applicationNo = this.selectedTrademark?.applicationNo;
    if (
      !applicationNo ||
      !this.isRegistered(this.selectedTrademark) ||
      this.isCertificateLoading
    )
      return;

    if (!CERTIFICATE_PAYMENT_REQUIRED) {
      this.beginCertificateDownload();
      return;
    }

    this.isCertificateUnlockOpen = true;
  }

  closeCertificateUnlockModal(): void {
    if (this.isCertificatePaymentStarting) return;
    this.isCertificateUnlockOpen = false;
  }

  startCertificatePayment(): void {
    if (
      !this.selectedTrademark ||
      !this.isRegistered(this.selectedTrademark) ||
      this.isCertificatePaymentStarting
    )
      return;

    this.isCertificatePaymentStarting = true;
    this.scriptLoaderService
      .load('https://checkout.razorpay.com/v1/checkout.js')
      .then(() => {
        this.servicePaymentService
          .createServiceOrder({
            serviceType: CERTIFICATE_DOWNLOAD_SERVICE,
            amount: CERTIFICATE_DOWNLOAD_AMOUNT,
            description: 'Official trademark registration certificate download',
          })
          .subscribe({
            next: (response) => this.openCertificateRazorpay(response.body!),
            error: () =>
              this.handleCertificatePaymentFailure(
                'Could not start the payment. Please try again.',
              ),
          });
      })
      .catch(() =>
        this.handleCertificatePaymentFailure(
          'Could not load the payment service. Please try again.',
        ),
      );
  }

  private openCertificateRazorpay(orderResponse: CreateOrderResponse): void {
    const Razorpay = this.windowRef.nativeWindow.Razorpay;
    if (!Razorpay) {
      this.handleCertificatePaymentFailure(
        'Could not open the payment window. Please try again.',
      );
      return;
    }

    const options: any = {
      key: orderResponse.keyId,
      amount: orderResponse.amount,
      currency: orderResponse.currency,
      name: 'Trademarx',
      description: 'Official trademark registration certificate download',
      image: '/assets/images/trademarx.svg',
      order_id: orderResponse.orderId,
      theme: { color: '#001F4D' },
      modal: {
        ondismiss: () => {
          this.ngZone.run(() => {
            if (this.isCertificatePaymentVerifying) return;
            this.isCertificatePaymentStarting = false;
            this.toastService.warning('Transaction was cancelled.');
          });
        },
      },
    };

    options.handler = (response: RazorPayOrderResponse) => {
      this.ngZone.run(() => {
        this.isCertificatePaymentStarting = false;
        this.isCertificatePaymentVerifying = true;
        this.isCertificateUnlockOpen = false;
        this.servicePaymentService
          .verifyServiceSignature({
            ...response,
            serviceType: CERTIFICATE_DOWNLOAD_SERVICE,
          })
          .subscribe({
            next: () =>
              this.ngZone.run(() => {
                this.isCertificatePaymentVerifying = false;
                this.beginCertificateDownload();
              }),
            error: () =>
              this.ngZone.run(() => {
                this.isCertificateUnlockOpen = true;
                this.handleCertificatePaymentFailure(
                  'Payment verification failed. Please contact support.',
                );
              }),
          });
      });
    };

    new Razorpay(options).open();
  }

  private handleCertificatePaymentFailure(message: string): void {
    this.isCertificatePaymentStarting = false;
    this.isCertificatePaymentVerifying = false;
    this.certificateMessage = message;
    this.toastService.error(message);
  }

  private beginCertificateDownload(): void {
    const applicationNo = this.selectedTrademark?.applicationNo;
    if (
      !applicationNo ||
      !this.isRegistered(this.selectedTrademark) ||
      this.isCertificateLoading
    )
      return;

    this.clearCertificateRequest();
    this.persistCertificateRequest(applicationNo);
    this.isCertificateErrorOpen = false;
    this.certificateErrorMessage = '';
    this.isCertificateLoading = true;
    this.startCertificateProgress();
    this.startCertificateTimeout();
    this.certificateMessage =
      'Preparing your official certificate from the registry.';
    this.trademarkService
      .requestRegistrationCertificate(applicationNo)
      .subscribe({
        next: (status) => this.handleCertificateStatus(applicationNo, status),
        error: () =>
          this.finishCertificateRequest(
            'We could not start the certificate download. Please try again in a moment.',
          ),
      });
  }

  displayName(trademark: ITrademark): string {
    return (
      trademark.name?.trim() ||
      `Application No. ${trademark.applicationNo ?? '—'}`
    );
  }

  statusTone(status?: string | null): string {
    const value = status?.toLowerCase() ?? '';
    if (value.includes('registered')) return 'registered';
    if (
      value.includes('object') ||
      value.includes('oppos') ||
      value.includes('refus') ||
      value.includes('abandon')
    )
      return 'attention';
    return 'pending';
  }

  private resetResults(): void {
    this.clearCertificateRequest();
    this.clearPersistedCertificateRequest();
    this.certificateMessage = '';
    this.results = [];
    this.selectedTrademark = null;
    this.hasSearched = false;
    this.errorMessage = '';
  }

  private handleCertificateStatus(
    applicationNo: number,
    status: ICertificateDownloadStatus,
  ): void {
    this.certificateMessage = status.message ?? '';
    if (status.state === 'READY') {
      this.completeCertificateProgress(applicationNo);
      return;
    }
    if (status.state === 'QUEUED' || status.state === 'FETCHING') {
      this.certificatePollTimer = window.setTimeout(
        () => this.pollCertificateStatus(applicationNo),
        1500,
      );
      return;
    }
    this.finishCertificateRequest(
      status.message ??
        'The official certificate is not available for this application.',
    );
  }

  private pollCertificateStatus(applicationNo: number): void {
    this.trademarkService
      .getRegistrationCertificateStatus(applicationNo)
      .subscribe({
        next: (status) => this.handleCertificateStatus(applicationNo, status),
        error: () =>
          this.finishCertificateRequest(
            'We could not check the certificate status. Please try again.',
          ),
      });
  }

  private downloadCertificateFile(applicationNo: number): void {
    this.certificateMessage = 'Downloading your official certificate.';
    this.trademarkService
      .downloadRegistrationCertificate(applicationNo)
      .subscribe({
        next: (response) => {
          const url = URL.createObjectURL(response.body!);
          const link = document.createElement('a');
          link.href = url;
          link.download = `trademark-registration-certificate-${applicationNo}.pdf`;
          link.click();
          URL.revokeObjectURL(url);
          this.clearCertificateRequest();
          this.clearPersistedCertificateRequest();
          this.certificateMessage = 'Your official certificate has downloaded.';
          this.persistCompletedCertificate(applicationNo);
          void this.router.navigate(['/trademark-certificate-download/complete']);
        },
        error: () =>
          this.finishCertificateRequest(
            'The certificate is no longer ready. Please request it again.',
          ),
      });
  }

  downloadReadyCertificate(): void {
    if (!this.isCertificateReady || !this.certificateReadyApplicationNo) return;

    this.isCertificateReady = false;
    this.isCertificateLoading = true;
    this.downloadCertificateFile(this.certificateReadyApplicationNo);
  }

  private finishCertificateRequest(message: string): void {
    this.clearCertificateRequest();
    this.clearPersistedCertificateRequest();
    this.certificateMessage = message;
    this.certificateErrorMessage = message;
    this.isCertificateErrorOpen = true;
  }

  closeCertificateErrorModal(): void {
    this.isCertificateErrorOpen = false;
  }

  retryCertificateDownload(): void {
    this.isCertificateErrorOpen = false;
    this.beginCertificateDownload();
  }

  emailCertificateSupport(): void {
    const applicationNo = this.selectedTrademark?.applicationNo ?? '';
    const subject = encodeURIComponent(
      `Certificate download assistance — Application No. ${applicationNo}`,
    );
    const body = encodeURIComponent(
      `Please help me obtain the trademark registration certificate for application number ${applicationNo}.`,
    );
    window.location.href = `mailto:support@trademarx.in?subject=${subject}&body=${body}`;
  }

  private clearCertificateRequest(): void {
    if (this.certificatePollTimer !== undefined) {
      window.clearTimeout(this.certificatePollTimer);
      this.certificatePollTimer = undefined;
    }
    if (this.certificateProgressTimer !== undefined) {
      window.clearTimeout(this.certificateProgressTimer);
      this.certificateProgressTimer = undefined;
    }
    if (this.certificateTimeoutTimer !== undefined) {
      window.clearTimeout(this.certificateTimeoutTimer);
      this.certificateTimeoutTimer = undefined;
    }
    this.isCertificateLoading = false;
    this.isCertificateReady = false;
    this.certificateReadyApplicationNo = undefined;
    this.certificateProgress = 0;
    this.certificateStep = 0;
  }

  private restoreCertificateRequest(): void {
    const snapshot = this.readCertificateRequestSnapshot();
    if (!snapshot) return;

    const trademark: ITrademark = {
      id: 0,
      applicationNo: snapshot.applicationNo,
      name: snapshot.name,
      tmClass: snapshot.tmClass,
      trademarkStatus: snapshot.trademarkStatus ?? 'Registered',
    };
    this.query = String(snapshot.applicationNo);
    this.results = [trademark];
    this.selectedTrademark = trademark;
    this.isCertificateLoading = true;
    this.certificateMessage = 'Restoring your certificate request.';
    this.startCertificateProgress();
    this.startCertificateTimeout();

    this.trademarkService
      .getRegistrationCertificateStatus(snapshot.applicationNo)
      .subscribe({
        next: status => {
          if (status.state === 'NONE') {
            this.clearCertificateRequest();
            this.beginCertificateDownload();
            return;
          }
          this.handleCertificateStatus(snapshot.applicationNo, status);
        },
        error: () =>
          this.finishCertificateRequest(
            'We could not restore the certificate request. Please try again.',
          ),
      });
  }

  private startCertificateTimeout(): void {
    this.certificateTimeoutTimer = window.setTimeout(
      () => {
        if (!this.isCertificateLoading) return;
        this.finishCertificateRequest(
          'The registry is taking longer than expected to prepare this certificate. Please try again.',
        );
      },
      CERTIFICATE_DOWNLOAD_TIMEOUT_MS,
    );
  }

  private persistCertificateRequest(applicationNo: number): void {
    const trademark = this.selectedTrademark;
    if (!trademark) return;
    const snapshot: CertificateRequestSnapshot = {
      applicationNo,
      name: trademark.name,
      tmClass: trademark.tmClass,
      trademarkStatus: trademark.trademarkStatus,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(CERTIFICATE_REQUEST_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Storage can be unavailable in private browsing; the live request still proceeds.
    }
  }

  private readCertificateRequestSnapshot(): CertificateRequestSnapshot | null {
    try {
      const raw = localStorage.getItem(CERTIFICATE_REQUEST_STORAGE_KEY);
      if (!raw) return null;
      const snapshot = JSON.parse(raw) as CertificateRequestSnapshot;
      if (
        !Number.isSafeInteger(snapshot.applicationNo) ||
        !Number.isFinite(snapshot.savedAt) ||
        Date.now() - snapshot.savedAt > CERTIFICATE_REQUEST_RETENTION_MS
      ) {
        this.clearPersistedCertificateRequest();
        return null;
      }
      return snapshot;
    } catch {
      this.clearPersistedCertificateRequest();
      return null;
    }
  }

  private clearPersistedCertificateRequest(): void {
    try {
      localStorage.removeItem(CERTIFICATE_REQUEST_STORAGE_KEY);
    } catch {
      // Nothing to clear when browser storage is unavailable.
    }
  }

  private persistCompletedCertificate(applicationNo: number): void {
    const trademark = this.selectedTrademark;
    if (!trademark) return;
    const snapshot: CompletedCertificateSnapshot = {
      applicationNo,
      name: trademark.name,
      tmClass: trademark.tmClass,
      trademarkStatus: trademark.trademarkStatus,
      proprietorName: trademark.proprietorName,
      applicationDate: trademark.applicationDate?.format('D MMM YYYY') ?? null,
      savedAt: Date.now(),
      completedAt: Date.now(),
    };
    try {
      localStorage.setItem(
        COMPLETED_CERTIFICATE_STORAGE_KEY,
        JSON.stringify(snapshot),
      );
    } catch {
      // The PDF still downloads if browser storage is unavailable.
    }
  }

  private startCertificateProgress(): void {
    this.certificateProgress = 4;
    this.certificateStep = 0;
    const advance = (): void => {
      if (!this.isCertificateLoading) return;
      if (this.certificateProgress < 70) {
        // Establish progress promptly without making the opening state feel instantaneous.
        this.certificateProgress = Math.min(70, this.certificateProgress + 8);
      } else if (this.certificateProgress < 94) {
        this.certificateProgress = Math.min(94, this.certificateProgress + 0.6);
      } else {
        this.certificateProgress = Math.min(
          96,
          this.certificateProgress + 0.2,
        );
      }
      this.certificateStep =
        this.certificateProgress < 24
          ? 0
          : this.certificateProgress < 56
            ? 1
            : this.certificateProgress < 90
              ? 2
              : 3;
      this.certificateProgressTimer = window.setTimeout(
        advance,
        this.certificateProgress < 70
          ? 180
          : this.certificateProgress < 94
            ? 900
            : 1100,
      );
    };
    this.certificateProgressTimer = window.setTimeout(advance, 160);
  }

  private completeCertificateProgress(applicationNo: number): void {
    if (this.certificateProgressTimer !== undefined) {
      window.clearTimeout(this.certificateProgressTimer);
    }
    if (this.certificateTimeoutTimer !== undefined) {
      window.clearTimeout(this.certificateTimeoutTimer);
      this.certificateTimeoutTimer = undefined;
    }
    const finish = (): void => {
      this.certificateProgress = Math.min(100, this.certificateProgress + 7);
      this.certificateStep = 3;
      if (this.certificateProgress < 100) {
        this.certificateProgressTimer = window.setTimeout(finish, 55);
        return;
      }
      this.certificateMessage = 'Starting your official certificate download.';
      this.downloadCertificateFile(applicationNo);
    };
    finish();
  }
}

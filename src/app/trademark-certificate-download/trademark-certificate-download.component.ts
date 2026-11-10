import { CommonModule } from '@angular/common';
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import dayjs from 'dayjs/esm';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

import { CreateOrderResponse } from '../../models/create-order-response.model';
import { RazorPayOrderResponse } from '../../models/razorpay-order-response.model';
import { ITrademark } from '../../models/trademark.model';
import { ScriptLoaderService } from '../shared/services/script-loader.service';
import { SeoService } from '../shared/services/seo.service';
import { ServicePaymentService } from '../shared/services/service-payment.service';
import {
  ICertificateDownloadStatus,
  TrademarkService,
} from '../shared/services/trademark.service';
import { WindowRefService } from '../shared/services/window-ref.service';

type SearchMode = 'application' | 'name';

const PAGE_URL = 'https://trademarx.in/trademark-certificate-download';
const PAGE_TITLE =
  'How to Download Trademark Registration Certificate Online | Trademarx';
const PAGE_DESCRIPTION =
  'Learn how to download a trademark certificate online in India. Search by application number or trademark name, confirm registration status, and continue to the official IP India registry.';
const CERTIFICATE_DOWNLOAD_SERVICE = 'TRADEMARK_CERTIFICATE_DOWNLOAD';
const CERTIFICATE_DOWNLOAD_AMOUNT = 50;

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
  certificateMessage = '';
  certificateProgress = 0;
  certificateStep = 0;
  private certificatePollTimer?: number;
  private certificateProgressTimer?: number;
  private certificateReadyApplicationNo?: number;

  /** A populated, real registry record makes the first visit useful before a search. */
  readonly defaultSampleTrademark: ITrademark = {
    id: 9570220,
    applicationNo: 2690553,
    applicationDate: dayjs('2014-03-03'),
    name: 'BASSI & ASSOCIATES',
    trademarkStatus: 'Registered',
    tmClass: 45,
    type: 'TRADEMARK',
    proprietorName: 'MR. ANIL BASSI',
    proprietorAddress:
      '4, First Floor, Syncicate Complex, Bindraban Road, Civil Lines, Ludhiana (Punjab)',
    headOffice: 'DELHI',
    renewalDate: dayjs('2034-03-03'),
    details:
      'Legal services; security services for the protection of property and individuals; personal and social services rendered by others to meet the needs of individuals.',
  };

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
    this.loadDefaultSample();
  }

  ngOnDestroy(): void {
    this.clearCertificateRequest();
    this.seo.removeJsonLd('trademark-certificate-download');
  }

  setMode(mode: SearchMode): void {
    if (this.mode === mode) return;
    this.mode = mode;
    this.query = '';
    this.resetResults();
  }

  onApplicationNumberChange(value: string): void {
    this.query = value.replace(/\D/g, '').slice(0, 10);
  }

  searchSample(applicationNo: string): void {
    this.setMode('application');
    this.query = applicationNo;
    this.search();
  }

  private loadDefaultSample(): void {
    this.query = String(this.defaultSampleTrademark.applicationNo);
    this.results = [this.defaultSampleTrademark];
    this.selectedTrademark = this.defaultSampleTrademark;
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
    this.certificateMessage = '';

    const request =
      this.mode === 'application'
        ? this.trademarkService.searchByApplicationNumber(query)
        : this.trademarkService.quickSearch(query);

    request.pipe(finalize(() => (this.isLoading = false))).subscribe({
      next: (response) => {
        const responseResults = response.body ?? [];
        // A filing can be represented by multiple class rows. On this certificate page an
        // application-number lookup always presents the canonical first row as one record.
        this.results =
          this.mode === 'application'
            ? responseResults.slice(0, 1)
            : responseResults;
        if (this.results.length === 1) this.selectTrademark(this.results[0]);
      },
      error: () => {
        this.errorMessage =
          'We could not reach the trademark register. Please try again in a moment.';
      },
    });
  }

  selectTrademark(trademark: ITrademark): void {
    this.clearCertificateRequest();
    this.certificateMessage = '';
    this.selectedTrademark = trademark;
    window.setTimeout(() =>
      document
        .getElementById('certificate-result')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
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
    this.isCertificateLoading = true;
    this.startCertificateProgress();
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
          this.finishCertificateRequest(
            'Your official certificate has downloaded.',
          );
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
    this.certificateMessage = message;
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
    this.isCertificateLoading = false;
    this.isCertificateReady = false;
    this.certificateReadyApplicationNo = undefined;
    this.certificateProgress = 0;
    this.certificateStep = 0;
  }

  private startCertificateProgress(): void {
    this.certificateProgress = 4;
    this.certificateStep = 0;
    const advance = (): void => {
      if (!this.isCertificateLoading) return;
      if (this.certificateProgress < 62) {
        this.certificateProgress = Math.min(62, this.certificateProgress + 8);
      } else if (this.certificateProgress < 88) {
        this.certificateProgress = Math.min(88, this.certificateProgress + 2);
      } else {
        this.certificateProgress = Math.min(
          93,
          this.certificateProgress + 0.35,
        );
      }
      this.certificateStep =
        this.certificateProgress < 24
          ? 0
          : this.certificateProgress < 52
            ? 1
            : this.certificateProgress < 88
              ? 2
              : 3;
      this.certificateProgressTimer = window.setTimeout(
        advance,
        this.certificateProgress < 62
          ? 180
          : this.certificateProgress < 88
            ? 520
            : 900,
      );
    };
    this.certificateProgressTimer = window.setTimeout(advance, 160);
  }

  private completeCertificateProgress(applicationNo: number): void {
    if (this.certificateProgressTimer !== undefined) {
      window.clearTimeout(this.certificateProgressTimer);
    }
    const finish = (): void => {
      this.certificateProgress = Math.min(100, this.certificateProgress + 7);
      this.certificateStep = 3;
      if (this.certificateProgress < 100) {
        this.certificateProgressTimer = window.setTimeout(finish, 55);
        return;
      }
      this.isCertificateLoading = false;
      this.isCertificateReady = true;
      this.certificateReadyApplicationNo = applicationNo;
      this.certificateMessage =
        'Your official certificate is ready to download.';
    };
    finish();
  }
}

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { finalize } from 'rxjs';
import { SharedModule } from '../shared/shared.module';
import { TrademarkService } from '../shared/services/trademark.service';
import { SeoService } from '../shared/services/seo.service';
import { ITrademark } from '../../models/trademark.model';
import { environment } from '../../environments/environment';
import { MobileBottomNavbarComponent } from '../mobile-bottom-navbar/mobile-bottom-navbar.component';

interface StatusMeaning {
  status: string;
  tone: 'neutral' | 'good' | 'warn' | 'bad';
  description: string;
  serviceLabel?: string;
  serviceLink?: string;
}

interface Faq {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-trademark-application-search',
  imports: [SharedModule, FormsModule, MobileBottomNavbarComponent],
  templateUrl: './trademark-application-search.component.html',
  styleUrl: './trademark-application-search.component.scss',
})
export class TrademarkApplicationSearchComponent implements OnInit, OnDestroy {
  @ViewChild('applicationNoInput') applicationNoInput?: ElementRef<HTMLInputElement>;

  applicationNo = '';
  results: ITrademark[] | null = null;
  isLoading = false;
  hasSearched = false;
  baseUrl = environment.BaseApiUrl;
  openFaqIndex: number | null = 0;

  readonly statusMeanings: StatusMeaning[] = [
    {
      status: 'Filed / Pending',
      tone: 'neutral',
      description: 'Submitted and awaiting examination by the Registry. No action needed yet, but keep watching — this can change to Objected or Advertised at any time.',
    },
    {
      status: 'Objected',
      tone: 'warn',
      description: 'The Examiner has raised concerns, usually under Section 9 or 11 of the Trade Marks Act. A reply is due within 30 days or the application risks being treated as abandoned.',
      serviceLabel: 'See Objection Reply Service',
      serviceLink: '/trademark-objection-reply',
    },
    {
      status: 'Advertised',
      tone: 'good',
      description: 'Passed examination and published in the Trademark Journal for a 4-month public opposition window. No response required unless someone opposes it.',
    },
    {
      status: 'Opposed',
      tone: 'bad',
      description: 'A third party has formally challenged the mark. A counter-statement is due within 2 months of the notice, or the application is deemed abandoned.',
      serviceLabel: 'See Opposition Defence Service',
      serviceLink: '/trademark-opposition',
    },
    {
      status: 'Registered',
      tone: 'good',
      description: 'Fully protected — the owner has exclusive rights. Registration is valid for 10 years and must be renewed to stay in force.',
      serviceLabel: 'See Renewal Service',
      serviceLink: '/trademark-renewal',
    },
    {
      status: 'Abandoned / Refused',
      tone: 'bad',
      description: 'The application did not go through, usually from a missed deadline or an unresolved objection. In most cases a fresh, properly drafted application succeeds where the earlier one failed.',
      serviceLabel: 'Re-File This Trademark',
      serviceLink: '/trademark-registration/your-info',
    },
  ];

  readonly faqs: Faq[] = [
    {
      question: 'How do I find my trademark application number?',
      answer:
        'Your application number is issued instantly the moment Form TM-A is filed with IP India. You\'ll find it on the filing acknowledgement receipt, in the confirmation email from your agent or attorney, or on the TM-R receipt if you filed it yourself. Lost it? Search by your brand name instead using our trademark name search.',
    },
    {
      question: 'How often is the status information updated?',
      answer:
        'Our records are sourced directly from the official IP India Trade Marks Registry and refreshed regularly, so the status you see here reflects what the Registry shows. For a mark you\'re actively tracking, we recommend checking back every few weeks, especially around the objection and opposition windows.',
    },
    {
      question: 'What should I do if my application shows "Objected"?',
      answer:
        'Act quickly — you have 30 days from the examination report to file a reply, or the application can be treated as abandoned. A well-drafted response addressing the specific Section 9 or Section 11 grounds resolves most objections. Our objection reply service handles this end-to-end.',
    },
    {
      question: 'What happens if my application status is "Opposed"?',
      answer:
        'A third party has filed a formal challenge against your application. You must file a counter-statement within 2 months of receiving the notice of opposition to keep the application alive — missing this deadline means it\'s deemed abandoned. Our opposition defence service prepares and files this for you.',
    },
    {
      question: 'My status shows "Abandoned" or "Refused" — can I still get the trademark?',
      answer:
        'Often, yes. A fresh application with the right class, a tighter description, and any available prior-use evidence frequently succeeds where the earlier filing failed. Our team can review what went wrong and re-file correctly.',
    },
    {
      question: 'I don\'t have my application number — can I still check status?',
      answer:
        'Yes. Use our trademark name search to look up any mark by brand name and view its current status, class, and applicant without needing the application number.',
    },
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly trademarkService: TrademarkService,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.setSeoTags();

    const queryAppNo = this.route.snapshot.queryParamMap.get('applicationNo');
    if (queryAppNo) {
      this.applicationNo = queryAppNo;
      this.search();
    }
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd('trademark-application-search');
  }

  search(): void {
    const value = this.applicationNo.trim();
    if (!value) {
      return;
    }

    this.router.navigate([], { relativeTo: this.route, queryParams: { applicationNo: value } });

    this.isLoading = true;
    this.hasSearched = true;
    this.trademarkService
      .searchByApplicationNumber(value)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: res => {
          this.results = res.body ?? [];
        },
        error: () => {
          this.results = [];
        },
      });
  }

  imgSrc(trademark: ITrademark): string {
    return trademark.imgUrl ? this.baseUrl + 'files/' + trademark.imgUrl : '/assets/images/trademark.png';
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'Active':
        return 'status-active';
      case 'Pending':
        return 'status-pending';
      case 'Expired':
        return 'status-expired';
      default:
        return '';
    }
  }

  trackById(_: number, item: ITrademark) {
    return item.applicationNo;
  }

  toggleFaq(index: number): void {
    this.openFaqIndex = this.openFaqIndex === index ? null : index;
  }

  focusSearchInput(): void {
    this.applicationNoInput?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    this.applicationNoInput?.nativeElement.focus();
  }

  private setSeoTags(): void {
    const title = 'Trademark Search by Application Number | Status Check | Trademarx';
    const description =
      'Check the live status of any Indian trademark application by its application number — objection, opposition, registered, or pending. Free instant lookup.';
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://trademarx.in/trademark-status-check' });
    this.meta.updateTag({ property: 'og:image', content: 'https://trademarx.in/assets/images/trademarx.png' });
    this.seo.setCanonical('https://trademarx.in/trademark-status-check');
    this.seo.injectJsonLd(
      [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://trademarx.in/' },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Trademark Status Check',
              item: 'https://trademarx.in/trademark-status-check',
            },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: title,
          description,
          url: 'https://trademarx.in/trademark-status-check',
          isPartOf: { '@type': 'WebSite', name: 'Trademarx', url: 'https://trademarx.in' },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: this.faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        },
      ],
      'trademark-application-search',
    );
  }
}

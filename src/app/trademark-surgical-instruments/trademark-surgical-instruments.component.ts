import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkSurgicalInstrumentsFaqs } from '../enums/trademarkSurgicalInstrumentsFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-surgical-instruments',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-surgical-instruments.component.html',
  styleUrl: './trademark-surgical-instruments.component.scss',
})
export class TrademarkSurgicalInstrumentsComponent implements OnInit, OnDestroy {

  faqs = trademarkSurgicalInstrumentsFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-surgical-instruments';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-surgical-instruments';

  classes = [
    {
      num: 10,
      name: 'Surgical, Medical, Dental & Veterinary Instruments',
      why: 'The primary class for surgical instrument manufacturers — covers surgical scissors, forceps, scalpels, retractors, needle holders, dental instruments, veterinary instruments, orthopaedic instruments, and disposable surgical items.'
    },
    {
      num: 8,
      name: 'Hand Tools & Cutlery',
      why: 'Relevant if you also manufacture manicure, pedicure, barber, or beauty grooming instruments under the same brand — these fall under hand-operated cutlery instruments rather than medical devices and need separate protection.'
    },
    {
      num: 35,
      name: 'Wholesale, Retail & Export Trading',
      why: 'Covers wholesale and retail trading, distribution, and export of surgical and beauty instruments — essential for Jalandhar manufacturers who export through agents to Europe, the US, the Middle East, and South Asia.'
    },
    {
      num: 44,
      name: 'Instrument Reprocessing & Calibration Services',
      why: 'Covers sterilisation, reprocessing, repair, and calibration services for surgical and dental instruments — relevant if your business offers these services to hospitals and clinics alongside manufacturing.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Surgical Instruments Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for surgical, dental, veterinary and beauty instrument manufacturers in Jalandhar, Punjab and Northern India. Protect your export brand — Class 10 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for surgical instruments manufacturers jalandhar, surgical instrument trademark punjab, dental instrument brand registration india, veterinary instrument trademark northern india, trademark class 10 surgical instruments, brand protection surgical instrument exporters jalandhar, beauty grooming instrument trademark registration punjab, manicure pedicure instrument trademark india, IP india trademark class 10 medical instruments, trademark for surgical instrument exporters punjab india';

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ name: 'keywords', content: keywords });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: this.pageUrl });
    this.meta.updateTag({ property: 'og:image', content: 'https://trademarx.in/assets/images/trademarx.png' });

    this.seo.setCanonical(this.pageUrl);
    this.seo.injectJsonLd([
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://trademarx.in/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Trademark Registration', 'item': 'https://trademarx.in/trademark-registration' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Surgical Instruments Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Surgical Instruments Manufacturers',
        'description': desc,
        'provider': { '@id': 'https://trademarx.in/#organization' },
        'areaServed': [
          { '@type': 'City', 'name': 'Jalandhar' },
          { '@type': 'State', 'name': 'Punjab' },
          { '@type': 'Country', 'name': 'India' }
        ],
        'offers': {
          '@type': 'Offer',
          'price': '1499',
          'priceCurrency': 'INR',
          'description': 'Professional fee. Govt. fees additional, no hidden charges.',
          'url': this.pageUrl
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': this.faqs.map(f => ({
          '@type': 'Question',
          'name': f.question,
          'acceptedAnswer': { '@type': 'Answer', 'text': f.answer },
        })),
      },
    ], this.schemaId);
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd(this.schemaId);
    this.seo.removeCanonical();
  }
}

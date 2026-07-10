import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkLockManufacturersFaqs } from '../enums/trademarkLockManufacturersFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-lock-manufacturers',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-lock-manufacturers.component.html',
  styleUrl: './trademark-lock-manufacturers.component.scss',
})
export class TrademarkLockManufacturersComponent implements OnInit, OnDestroy {

  faqs = trademarkLockManufacturersFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-lock-manufacturers';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-lock-manufacturers';

  classes = [
    {
      num: 6,
      name: 'Locks of Metal & Common Metal Goods',
      why: 'The primary class for lock manufacturers — covers padlocks, mortise locks, door locks, cabinet locks, hasps, staples, and other non-electric metal locks and hardware fittings.'
    },
    {
      num: 9,
      name: 'Electronic & Smart Security Devices',
      why: 'Covers electronic locks, digital door locks, smart locks, and security alarm systems — relevant for Aligarh units that have expanded into electronic and app-controlled locking solutions.'
    },
    {
      num: 35,
      name: 'Wholesale, Retail & Export Trading',
      why: 'Covers wholesale and retail trading, dealership, and export of locks and hardware — essential for Aligarh manufacturers who supply through dealer networks across India and abroad.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Lock & Padlock Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for lock, padlock, and hardware fitting manufacturers in Aligarh, Uttar Pradesh and Northern India. Protect your brand — Class 6 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for lock manufacturers aligarh, padlock trademark uttar pradesh, lock brand registration india, door lock trademark northern india, trademark class 6 locks, brand protection lock manufacturing units aligarh, hardware fittings trademark registration up, cabinet lock trademark india, IP india trademark class 6 metal locks, trademark for lock exporters aligarh india';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Lock & Padlock Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Lock & Padlock Manufacturers',
        'description': desc,
        'provider': { '@id': 'https://trademarx.in/#organization' },
        'areaServed': [
          { '@type': 'City', 'name': 'Aligarh' },
          { '@type': 'State', 'name': 'Uttar Pradesh' },
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

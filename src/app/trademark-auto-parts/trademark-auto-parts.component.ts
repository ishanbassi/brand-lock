import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkAutoPartsFaqs } from '../enums/trademarkAutoPartsFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-auto-parts',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-auto-parts.component.html',
  styleUrl: './trademark-auto-parts.component.scss',
})
export class TrademarkAutoPartsComponent implements OnInit, OnDestroy {

  faqs = trademarkAutoPartsFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-auto-parts';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-auto-parts';

  classes = [
    {
      num: 12,
      name: 'Vehicles & Vehicle Parts',
      why: 'The primary class for auto parts, spare parts, and vehicle accessories — covers components like brakes, clutches, suspension parts, body panels, and bicycle/two-wheeler parts.'
    },
    {
      num: 7,
      name: 'Machines & Machine Parts',
      why: 'Covers engines, engine parts, machine tools, and industrial components — relevant for manufacturers of CNC parts, forgings, castings, and engine/transmission components.'
    },
    {
      num: 6,
      name: 'Metal Hardware & Fasteners',
      why: 'Covers nuts, bolts, fasteners, and common metal hardware — important for hardware, fastener, and forging units supplying the auto ancillary sector.'
    },
    {
      num: 35,
      name: 'Wholesale & Retail of Auto Parts',
      why: 'Covers trading, distribution, and retail/wholesale of auto components and accessories — essential if you sell through dealer networks, distributors, or online marketplaces.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Auto Parts Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for auto parts, spare parts and components manufacturers in Ludhiana, Punjab and across Northern India. Protect your brand from counterfeit parts — Class 7 & 12 filing from ₹1,499. IP India authorised agents, 100% online.';
    const keywords = 'trademark registration for auto parts manufacturers, auto parts brand registration ludhiana, spare parts company trademark punjab, trademark for automotive components business, brand protection auto ancillary units india, trademark class 12 auto parts, trademark for forging and casting units, counterfeit auto parts trademark india';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Auto Parts Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Auto Parts Manufacturers',
        'description': desc,
        'provider': { '@id': 'https://trademarx.in/#organization' },
        'areaServed': [
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

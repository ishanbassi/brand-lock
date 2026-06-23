import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkBicyclePartsFaqs } from '../enums/trademarkBicyclePartsFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-bicycle-parts',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-bicycle-parts.component.html',
  styleUrl: './trademark-bicycle-parts.component.scss',
})
export class TrademarkBicyclePartsComponent implements OnInit, OnDestroy {

  faqs = trademarkBicyclePartsFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-bicycle-parts';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-bicycle-parts';

  classes = [
    {
      num: 12,
      name: 'Vehicles & Cycle Parts',
      why: 'The primary class for bicycle parts — covers bicycles, bicycle frames, wheels, rims, tyres, tubes, chains, pedals, sprockets, handlebars, saddles, brakes, mudguards, and all cycle accessories and components.'
    },
    {
      num: 6,
      name: 'Metal Parts & Hardware',
      why: 'Covers common metals and their alloys, metal hardware, fasteners, nuts, bolts, spokes, and fabricated metal components — essential for manufacturers supplying metal bicycle parts and structural cycle components.'
    },
    {
      num: 7,
      name: 'Machinery for Bicycle Manufacturing',
      why: 'Covers machines and industrial equipment used in bicycle part production — relevant for units that also manufacture or supply pressing machines, welding equipment, or cycle assembly machinery.'
    },
    {
      num: 35,
      name: 'Wholesale & Retail of Bicycle Parts',
      why: 'Covers trading, wholesale, and distribution of bicycle parts and accessories — essential if you sell through dealers, distributors, e-commerce platforms, or export directly to overseas buyers.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Bicycle Parts Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for bicycle parts and cycle components manufacturers in Ludhiana, Punjab and Northern India. Protect your brand from copycats — Class 12 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for bicycle parts manufacturers, bicycle parts brand registration ludhiana, cycle components trademark punjab, trademark for cycle parts business india, bicycle manufacturer trademark northern india, trademark class 12 bicycle parts, brand protection cycle parts ludhiana, trademark registration bicycle accessories manufacturers punjab, cycle industry trademark ludhiana, IP india trademark bicycle parts';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Bicycle Parts Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Bicycle Parts Manufacturers',
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

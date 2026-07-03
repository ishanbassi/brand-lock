import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkDieselEngineFaqs } from '../enums/trademarkDieselEngineFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-diesel-engine-manufacturers',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-diesel-engine-manufacturers.component.html',
  styleUrl: './trademark-diesel-engine-manufacturers.component.scss',
})
export class TrademarkDieselEngineManufacturersComponent implements OnInit, OnDestroy {

  faqs = trademarkDieselEngineFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-diesel-engine-manufacturers';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-diesel-engine-manufacturers';

  classes = [
    {
      num: 7,
      name: 'Engines, Gensets & Pump Sets',
      why: 'The primary class for diesel engine and genset manufacturers — covers stationary diesel engines, agricultural diesel engines, diesel generator sets, engine-driven pump sets, alternators, and engine parts such as pistons, cylinder liners, crankshafts, and fuel injection components sold as machine parts.'
    },
    {
      num: 12,
      name: 'Engines for Land Vehicles',
      why: 'Relevant if you manufacture or supply engines fitted in tractors, three-wheelers, or other land vehicles — Class 7 covers only engines other than for land vehicles, so vehicle-engine manufacturers often need Class 12 alongside it.'
    },
    {
      num: 35,
      name: 'Wholesale, Retail & Export Trading',
      why: 'Covers wholesale and retail trading, distribution, and export of diesel engines, generator sets, and spare parts — essential for manufacturers who sell through dealer networks, stockists, or export to Africa, the Middle East, and South Asia.'
    },
    {
      num: 37,
      name: 'Engine Repair & Servicing',
      why: 'Covers installation, repair, overhauling, and maintenance services for engines and generator sets — relevant if your business offers after-sales servicing, annual maintenance contracts, or genset installation alongside manufacturing.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Diesel Engine & Genset Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for diesel engine, generator set, and engine pump set manufacturers in Ludhiana, Punjab and Northern India. Protect your engine brand — Class 7 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for diesel engine manufacturers ludhiana, diesel engine trademark punjab, generator set brand registration india, genset manufacturer trademark northern india, trademark class 7 diesel engines, brand protection diesel engine manufacturers ludhiana, engine pump set trademark registration punjab, diesel engine spare parts trademark india, IP india trademark class 7 engines gensets, trademark for diesel engine exporters punjab india';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Diesel Engine & Genset Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Diesel Engine & Generator Set Manufacturers',
        'description': desc,
        'provider': { '@id': 'https://trademarx.in/#organization' },
        'areaServed': [
          { '@type': 'City', 'name': 'Ludhiana' },
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

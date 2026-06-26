import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkPumpManufacturersFaqs } from '../enums/trademarkPumpManufacturersFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-pump-manufacturers',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-pump-manufacturers.component.html',
  styleUrl: './trademark-pump-manufacturers.component.scss',
})
export class TrademarkPumpManufacturersComponent implements OnInit, OnDestroy {

  faqs = trademarkPumpManufacturersFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-pump-manufacturers';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-pump-manufacturers';

  classes = [
    {
      num: 7,
      name: 'Pumps & Pump Machinery',
      why: 'The primary class for pump manufacturers — covers centrifugal pumps, submersible pumps, monoblock pump sets, agricultural pump sets, booster pumps, pump parts, compressors, and all mechanical pump-related machinery and equipment.'
    },
    {
      num: 11,
      name: 'Water & Fluid Handling Apparatus',
      why: 'Relevant for manufacturers of water treatment equipment, pressure vessels, water filtering apparatus, and fluid distribution systems that are sold alongside or integrated with pump products.'
    },
    {
      num: 35,
      name: 'Wholesale, Retail & Export Trading',
      why: 'Covers wholesale and retail trading, distribution, and export of pumps and pump accessories — essential for pump manufacturers who sell through stockists, dealers, distributors, or directly to overseas irrigation and industrial buyers.'
    },
    {
      num: 37,
      name: 'Pump Repair & Maintenance Services',
      why: 'Covers installation, repair, and maintenance services for pumps and pump sets — relevant if your business offers after-sales servicing, annual maintenance contracts, or pump installation services alongside manufacturing.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Pump Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for pump and pump parts manufacturers in Ludhiana, Punjab and Northern India. Protect your submersible pump, centrifugal pump, or agricultural pump set brand — Class 7 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for pump manufacturers ludhiana, submersible pump trademark punjab, centrifugal pump brand registration india, trademark for agricultural pump set manufacturers northern india, trademark class 7 pumps machinery, brand protection pump manufacturers ludhiana, monoblock pump trademark registration punjab, pump parts manufacturer trademark india, IP india trademark class 7 pump, trademark for pump exporters punjab india';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Pump Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Pump Manufacturers',
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

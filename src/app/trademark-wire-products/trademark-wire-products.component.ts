import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkWireProductsFaqs } from '../enums/trademarkWireProductsFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-wire-products',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-wire-products.component.html',
  styleUrl: './trademark-wire-products.component.scss',
})
export class TrademarkWireProductsComponent implements OnInit, OnDestroy {

  faqs = trademarkWireProductsFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-wire-products';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-wire-products';

  classes = [
    {
      num: 6,
      name: 'Common Metals & Goods of Common Metal',
      why: 'The primary class for wire drawing and wire products manufacturers — covers steel wire, binding wire, GI wire, wire mesh, wire netting, wire nails, and wire ropes.'
    },
    {
      num: 35,
      name: 'Wholesale, Retail & Export Trading',
      why: 'Covers wholesale and retail trading, dealership, and export of wire and wire products — essential for Ludhiana manufacturers who supply through hardware dealer networks across India and abroad.'
    },
    {
      num: 40,
      name: 'Treatment of Materials',
      why: 'Covers wire drawing, galvanizing, coating, and custom fabrication services performed on metal — relevant if you offer job-work or contract wire processing under your own brand.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Wire Drawing & Wire Mesh Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for wire drawing units, binding wire, GI wire and wire mesh manufacturers in Ludhiana, Punjab and Northern India. Protect your brand — Class 6 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for wire manufacturers ludhiana, binding wire trademark punjab, GI wire brand registration india, wire mesh trademark northern india, trademark class 6 wire products, brand protection wire drawing units ludhiana, wire nails trademark registration punjab, wire netting trademark india, IP india trademark class 6 metal goods, trademark for wire exporters punjab india';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Wire Drawing & Wire Mesh Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Wire Drawing & Wire Mesh Manufacturers',
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

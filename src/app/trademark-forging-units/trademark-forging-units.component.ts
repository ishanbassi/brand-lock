import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkForgingUnitsFaqs } from '../enums/trademarkForgingUnitsFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-forging-units',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-forging-units.component.html',
  styleUrl: './trademark-forging-units.component.scss',
})
export class TrademarkForgingUnitsComponent implements OnInit, OnDestroy {

  faqs = trademarkForgingUnitsFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-forging-units';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-forging-units';

  classes = [
    {
      num: 6,
      name: 'Forged Metal Products & Components',
      why: 'The primary class for forging manufacturers — covers drop forgings, closed-die forgings, crankshafts, connecting rods, flanges, forged rings, axles, gear blanks, metal fastener blanks, and all forged or semi-finished metal parts supplied to automotive, agricultural, railway, and construction industries.'
    },
    {
      num: 7,
      name: 'Forging Machinery & Equipment',
      why: 'Relevant for units that also manufacture or market forging presses, drop hammers, forging dies, trimming presses, or induction heating equipment. Covers machines used in the metal forging and heat treatment process.'
    },
    {
      num: 35,
      name: 'Wholesale, Retail & Export Trading',
      why: 'Covers wholesale and retail trading, distribution, and export of forged metal products and components — essential for forging units that sell through dealers, stockists, or directly to overseas OEMs and Tier-1 suppliers.'
    },
    {
      num: 40,
      name: 'Metal Treatment & Forging Services',
      why: 'Covers treatment of materials including metal forging-as-a-service, heat treatment, surface treatment, and job-work forging contracts — relevant if your unit offers forging on a contract basis or provides heat treatment and finishing services.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Forging Units — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for forging units and forged components manufacturers in Ludhiana, Punjab and Northern India. Protect your drop forging, closed-die forging, crankshaft, flange, or forged ring brand — Class 6 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for forging units ludhiana, forging manufacturer trademark punjab, drop forging brand registration india, trademark for forged components manufacturers northern india, trademark class 6 forged metal products, brand protection forging units ludhiana, closed-die forging trademark registration punjab, crankshaft manufacturer trademark india, flange manufacturer trademark punjab, trademark for forging exporters india';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Forging Units', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Forging Units',
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

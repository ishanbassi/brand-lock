import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkHandToolsFaqs } from '../enums/trademarkHandToolsFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-hand-tools',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-hand-tools.component.html',
  styleUrl: './trademark-hand-tools.component.scss',
})
export class TrademarkHandToolsComponent implements OnInit, OnDestroy {

  faqs = trademarkHandToolsFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-hand-tools';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-hand-tools';

  classes = [
    {
      num: 8,
      name: 'Hand Tools & Hand-Operated Implements',
      why: 'The primary class for hand tools manufacturers — covers wrenches, spanners, pliers, screwdrivers, hammers, files, chisels, cutting tools, and all hand-operated implements.'
    },
    {
      num: 7,
      name: 'Power Tools & Tool-Making Machinery',
      why: 'Covers power-operated tools and the machinery used to forge, press, and finish hand tools — relevant for units that also manufacture power tools or supply tool-production equipment.'
    },
    {
      num: 6,
      name: 'Metal Components & Hardware',
      why: 'Covers common metals and their alloys, tool blanks, and metal hardware components — essential for forging and tool-finishing units supplying raw or semi-finished metal parts.'
    },
    {
      num: 35,
      name: 'Wholesale, Retail & Export Trading',
      why: 'Covers trading, wholesale, distribution, and export of hand tools and hardware — essential if you sell through dealers, distributors, or directly to overseas buyers.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Hand Tools Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for hand tools, wrenches, pliers, spanner and screwdriver manufacturers in Jalandhar, Punjab and Northern India. Protect your brand from copycats — Class 8 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for hand tools manufacturers, hand tools brand registration jalandhar, wrenches and spanners trademark punjab, trademark for pliers manufacturers india, hand tools exporter trademark northern india, trademark class 8 hand tools, brand protection hand tools jalandhar, trademark registration tool forging units punjab, hardware tools trademark jalandhar, IP india trademark hand tools';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Hand Tools Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Hand Tools Manufacturers',
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

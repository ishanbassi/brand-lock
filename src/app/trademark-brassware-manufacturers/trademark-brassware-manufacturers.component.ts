import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkBrasswareManufacturersFaqs } from '../enums/trademarkBrasswareManufacturersFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-brassware-manufacturers',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-brassware-manufacturers.component.html',
  styleUrl: './trademark-brassware-manufacturers.component.scss',
})
export class TrademarkBrasswareManufacturersComponent implements OnInit, OnDestroy {

  faqs = trademarkBrasswareManufacturersFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-brassware-manufacturers';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-brassware-manufacturers';

  classes = [
    {
      num: 6,
      name: 'Metal Handicrafts, Statues & Decorative Ware',
      why: 'The primary class for brass manufacturers — covers brass statues, idols, decorative ornaments, metal artware, and hardware fittings made of common metal.'
    },
    {
      num: 21,
      name: 'Household & Kitchen Brassware',
      why: 'Covers brass tableware, kitchen utensils, urlis, candle stands, and household brassware not made of precious metal — essential for Moradabad units producing both décor and utility items.'
    },
    {
      num: 35,
      name: 'Wholesale, Retail & Export Trading',
      why: 'Covers wholesale and retail trading, dealership, and export of brassware — essential for Moradabad manufacturers who supply through export houses and B2B platforms worldwide.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Brassware & Brass Handicrafts Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for brassware, brass handicrafts, and metal artware manufacturers in Moradabad, Uttar Pradesh and Northern India. Protect your brand — Class 6 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for brassware manufacturers moradabad, brass handicrafts trademark uttar pradesh, brass artware brand registration india, peetal nagri trademark, trademark class 6 brass statues, brand protection brass export houses moradabad, brass tableware trademark registration up, EPCH exporter trademark, IP india trademark class 6 metal handicrafts, trademark for brassware exporters moradabad india';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Brassware & Brass Handicrafts Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Brassware & Brass Handicrafts Manufacturers',
        'description': desc,
        'provider': { '@id': 'https://trademarx.in/#organization' },
        'areaServed': [
          { '@type': 'City', 'name': 'Moradabad' },
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

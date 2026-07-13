import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkScientificInstrumentsFaqs } from '../enums/trademarkScientificInstrumentsFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-scientific-instruments',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-scientific-instruments.component.html',
  styleUrl: './trademark-scientific-instruments.component.scss',
})
export class TrademarkScientificInstrumentsComponent implements OnInit, OnDestroy {

  faqs = trademarkScientificInstrumentsFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-scientific-instruments';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-scientific-instruments';

  classes = [
    {
      num: 9,
      name: 'Scientific & Laboratory Apparatus',
      why: 'The primary class for scientific instrument manufacturers — covers laboratory glassware, physics, chemistry and biology apparatus, measuring and testing instruments, optical goods, and lab equipment. Class 9 is the correct filing class for any instrument brand supplied to schools, colleges, research labs, or export markets.'
    },
    {
      num: 16,
      name: 'Educational Charts & Teaching Models',
      why: 'Relevant for manufacturers who also produce printed anatomical charts, wall charts, or educational teaching stationery — common among Ambala units that bundle charts and models alongside lab instruments. Class 16 covers paper goods and printed matter not included in other classes.'
    },
    {
      num: 35,
      name: 'Wholesale, Retail & Export Trading',
      why: 'Covers wholesale and retail trading, distribution, and export of scientific and laboratory instruments — essential for manufacturers and traders selling through dealer networks, direct institutional supply to schools and labs, or overseas buyers.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Scientific & Laboratory Instruments Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for scientific and laboratory instrument manufacturers in Ambala, Haryana and Northern India. Protect your lab equipment or instrument brand — Class 9 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for scientific instruments manufacturers ambala, laboratory instrument manufacturer trademark haryana, scientific equipment brand registration india, lab glassware trademark registration ambala, trademark class 9 scientific instruments, brand protection scientific instruments manufacturers northern india, physics chemistry biology apparatus trademark ambala, educational charts trademark registration india, scientific instrument exporters trademark ambala, lab equipment brand registration haryana, trademark for teaching models manufacturers ambala, measuring instruments manufacturer trademark';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Scientific Instruments Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Scientific & Laboratory Instruments Manufacturers',
        'description': desc,
        'provider': { '@id': 'https://trademarx.in/#organization' },
        'areaServed': [
          { '@type': 'City', 'name': 'Ambala' },
          { '@type': 'State', 'name': 'Haryana' },
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

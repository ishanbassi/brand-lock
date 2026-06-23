import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkFastenersFaqs } from '../enums/trademarkFastenersFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-fasteners',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-fasteners.component.html',
  styleUrl: './trademark-fasteners.component.scss',
})
export class TrademarkFastenersComponent implements OnInit, OnDestroy {

  faqs = trademarkFastenersFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-fasteners';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-fasteners';

  classes = [
    {
      num: 6,
      name: 'Metal Fasteners & Hardware',
      why: 'The primary class for fastener manufacturers — covers common metals and their alloys, nuts, bolts, screws, washers, rivets, nails, clips, and all metal hardware and fastening components.'
    },
    {
      num: 7,
      name: 'Fastener Manufacturing Machinery',
      why: 'Covers cold forging presses, header machines, thread rolling machines, and other industrial equipment — relevant for units that also manufacture or supply fastener production machinery.'
    },
    {
      num: 17,
      name: 'Non-Metallic & Rubber Fasteners',
      why: 'Covers rubber, nylon, and plastic fasteners, grommets, washers, and insulating fittings — essential for manufacturers supplying non-metallic fastening components alongside metal parts.'
    },
    {
      num: 35,
      name: 'Wholesale & Retail of Fasteners',
      why: 'Covers trading, wholesale, and distribution of fasteners and hardware — essential if you sell through dealers, distributors, e-commerce platforms, or export directly to overseas buyers.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Fasteners, Nuts & Bolts Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for fasteners, nuts, bolts, screws and cold forging manufacturers in Ludhiana, Punjab and Northern India. Protect your brand from copycats — Class 6 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for fasteners manufacturers, nuts and bolts brand registration ludhiana, fastener trademark punjab, trademark for screws manufacturers india, cold forging unit trademark northern india, trademark class 6 fasteners, brand protection nuts bolts ludhiana, trademark registration fastener exporters punjab, hardware industry trademark ludhiana, IP india trademark fasteners';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Fasteners Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Fasteners, Nuts & Bolts Manufacturers',
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

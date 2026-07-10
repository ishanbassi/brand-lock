import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkTextileMachineryFaqs } from '../enums/trademarkTextileMachineryFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-textile-machinery',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-textile-machinery.component.html',
  styleUrl: './trademark-textile-machinery.component.scss',
})
export class TrademarkTextileMachineryComponent implements OnInit, OnDestroy {

  faqs = trademarkTextileMachineryFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-textile-machinery';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-textile-machinery';

  classes = [
    {
      num: 7,
      name: 'Machines & Machine Tools',
      why: 'The primary class for textile and hosiery machinery manufacturers — covers circular knitting machines, flat knitting machines, sock knitting machines, warping and winding machines, and textile machinery spare parts.'
    },
    {
      num: 35,
      name: 'Wholesale, Retail & Export Trading',
      why: 'Covers wholesale and retail trading, dealership, and export of textile machinery and spares — essential for Ludhiana manufacturers who supply through dealer networks in India, Bangladesh, Africa and the Middle East.'
    },
    {
      num: 37,
      name: 'Installation, Repair & Maintenance Services',
      why: 'Covers on-site machine installation, after-sales repair, retrofitting, and annual maintenance contracts — relevant if you provide servicing alongside machine sales under the same brand.'
    },
    {
      num: 42,
      name: 'Machine Design & Engineering Services',
      why: 'Covers custom machine design, technical consultancy, and R&D services — relevant for units that design or retrofit knitting and textile machinery to customer specifications.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Textile & Hosiery Machinery Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for circular knitting, flat knitting and hosiery machinery manufacturers in Ludhiana, Punjab and Northern India. Protect your machine brand — Class 7 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for textile machinery manufacturers ludhiana, hosiery machinery trademark punjab, circular knitting machine brand registration india, flat knitting machine trademark northern india, trademark class 7 textile machinery, brand protection textile machinery exporters ludhiana, knitting machine spare parts trademark registration punjab, sock knitting machine trademark india, IP india trademark class 7 machinery, trademark for textile machinery exporters punjab india';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Textile & Hosiery Machinery Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Textile & Hosiery Machinery Manufacturers',
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

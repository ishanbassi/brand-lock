import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkMachineToolsFaqs } from '../enums/trademarkMachineToolsFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-machine-tools',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-machine-tools.component.html',
  styleUrl: './trademark-machine-tools.component.scss',
})
export class TrademarkMachineToolsComponent implements OnInit, OnDestroy {

  faqs = trademarkMachineToolsFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-machine-tools';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-machine-tools';

  classes = [
    {
      num: 7,
      name: 'Machines & Machine Tools',
      why: 'The primary class for machine tools — covers lathes, milling machines, drilling machines, grinders, CNC machining centres, pressing machines, and all industrial machine tools and their parts.'
    },
    {
      num: 8,
      name: 'Hand Tools & Cutting Tools',
      why: 'Covers hand-operated tools, cutting tools, drill bits, milling cutters, and tool accessories — relevant for manufacturers of tooling and cutting inserts alongside machine tools.'
    },
    {
      num: 6,
      name: 'Metal Parts & Castings',
      why: 'Covers common metals and alloys, metal castings, forgings, and fabricated metal components — important for machine tool manufacturers who also supply metal parts and job-worked components.'
    },
    {
      num: 35,
      name: 'Wholesale & Retail of Machine Tools',
      why: 'Covers trading, wholesale, and distribution of industrial machinery and machine tools — essential if you sell through dealers, distributors, or online B2B marketplaces.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Machine Tools Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for machine tools, lathe, milling and CNC machining manufacturers in Ludhiana, Punjab and Northern India. Protect your industrial brand from copycats — Class 7 & 8 filing from ₹1,499. IP India authorised agents, 100% online.';
    const keywords = 'trademark registration for machine tools manufacturers, machine tools brand registration ludhiana, lathe machine company trademark punjab, trademark for CNC machining businesses india, industrial machinery trademark northern india, trademark class 7 machine tools, brand protection machine tools ludhiana, trademark registration for engineering goods manufacturers punjab';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Machine Tools Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Machine Tools Manufacturers',
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

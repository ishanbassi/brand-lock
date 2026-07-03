import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkPowerToolsFaqs } from '../enums/trademarkPowerToolsFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-power-tools',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-power-tools.component.html',
  styleUrl: './trademark-power-tools.component.scss',
})
export class TrademarkPowerToolsComponent implements OnInit, OnDestroy {

  faqs = trademarkPowerToolsFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-power-tools';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-power-tools';

  classes = [
    {
      num: 7,
      name: 'Power Tools & Machines',
      why: 'The primary class for power tools manufacturers — covers electric hand-held power tools including angle grinders, electric drills, rotary hammers, bench grinders, circular saws, jigsaws, power sanders, die grinders, electric screwdrivers, impact wrenches, rotary tools, power tool accessories, and allied machine tools. Class 7 is the correct filing class for any electrically or pneumatically driven tool or machine used in fabrication, construction, automotive workshops, or industrial settings.'
    },
    {
      num: 8,
      name: 'Hand Tools (Non-Electric)',
      why: 'Relevant for power tools manufacturers who also produce or market manual hand tools — spanners, wrenches, screwdrivers, pliers, chisels, hammers, files, punches, and non-electric cutting tools. Class 8 covers all non-electric hand-held tools and implements. Units that supply a combined power tools + hand tools range should consider dual-class registration under Class 7 and Class 8.'
    },
    {
      num: 9,
      name: 'Safety & Measurement Equipment',
      why: 'Relevant for power tools manufacturers who also produce or brand safety accessories (protective goggles, face shields, safety guards), measuring or testing instruments, or electronic control equipment supplied alongside power tools. Class 9 covers electrical and scientific apparatus, instruments for measuring, and safety equipment for industrial use.'
    },
    {
      num: 35,
      name: 'Wholesale, Retail & Export Trading',
      why: 'Covers wholesale and retail trading, distribution, and export of power tools, hand tools, and allied hardware — essential for manufacturers and traders that sell through dealer networks, hardware retailers, e-commerce platforms, or directly to overseas buyers, construction companies, and automotive workshop chains.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Power Tools Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for power tools manufacturers in Ludhiana, Punjab and Northern India. Protect your angle grinder, electric drill, bench grinder, or circular saw brand — Class 7 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for power tools manufacturers ludhiana, power tools manufacturer trademark punjab, angle grinder brand registration india, electric drill trademark registration punjab, trademark class 7 power tools, brand protection power tools manufacturers northern india, bench grinder manufacturer trademark punjab, rotary hammer trademark registration india, circular saw manufacturer trademark, trademark for power tools exporters india, power tools brand registration ludhiana, trademark for machine tools manufacturers punjab';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Power Tools Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Power Tools Manufacturers',
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

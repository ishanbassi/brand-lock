import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkPlasticPvcFaqs } from '../enums/trademarkPlasticPvcFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-plastic-pvc-manufacturers',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-plastic-pvc-manufacturers.component.html',
  styleUrl: './trademark-plastic-pvc-manufacturers.component.scss',
})
export class TrademarkPlasticPvcManufacturersComponent implements OnInit, OnDestroy {

  faqs = trademarkPlasticPvcFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-plastic-pvc-manufacturers';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-plastic-pvc-manufacturers';

  classes = [
    {
      num: 17,
      name: 'Plastics & Plastic Pipe Products',
      why: 'The primary class for plastic and PVC product manufacturers — covers PVC pipes, CPVC pipes, HDPE pipes, SWR pipes, plastic pipe fittings, plastic hoses, plastic tubes, plastic sheets, plastic films, plastic extrusions, plastic semi-finished goods, and injection-moulded plastic components used in construction, plumbing, agriculture, and industrial applications.'
    },
    {
      num: 20,
      name: 'Plastic Containers & Storage',
      why: 'Covers plastic articles for storage and transport — plastic containers, plastic bottles, jerry cans, plastic crates, plastic tanks, plastic boxes, and plastic packaging used in agricultural, chemical, and industrial supply chains. Relevant for units manufacturing plastic storage and packaging products alongside pipes and fittings.'
    },
    {
      num: 19,
      name: 'Construction & Building Materials',
      why: 'Relevant for manufacturers whose PVC or HDPE pipes are marketed and sold as construction or building materials — including drainage pipes, sewage pipes, conduit pipes, water supply pipes, and plastic building components. Class 19 covers non-metallic building materials not elsewhere classified.'
    },
    {
      num: 35,
      name: 'Wholesale, Retail & Export Trading',
      why: 'Covers wholesale and retail trading, distribution, and export of plastic products, PVC pipes, and plastic components — essential for plastic goods manufacturers and traders that sell through dealer networks, stockists, or directly to overseas buyers, contractors, and OEMs.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Plastic & PVC Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for plastic and PVC product manufacturers in Ludhiana, Punjab and Northern India. Protect your PVC pipes, CPVC pipes, HDPE pipes, plastic fittings, or injection-moulded plastic components brand — Class 17 & 20 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for plastic manufacturers ludhiana, PVC pipe manufacturer trademark punjab, CPVC pipe brand registration india, trademark for plastic products manufacturers northern india, trademark class 17 plastic pipes, brand protection plastic manufacturers ludhiana, HDPE pipe manufacturer trademark registration punjab, injection moulded plastic components trademark india, plastic fittings manufacturer trademark punjab, trademark for plastic exporters india, PVC fittings manufacturer trademark registration, plastic moulding unit trademark india';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Plastic & PVC Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Plastic & PVC Products Manufacturers',
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

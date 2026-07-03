import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkRubberProductsFaqs } from '../enums/trademarkRubberProductsFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-rubber-products',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-rubber-products.component.html',
  styleUrl: './trademark-rubber-products.component.scss',
})
export class TrademarkRubberProductsComponent implements OnInit, OnDestroy {

  faqs = trademarkRubberProductsFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-rubber-products';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-rubber-products';

  classes = [
    {
      num: 17,
      name: 'Rubber & Rubber Goods',
      why: 'The primary class for rubber product manufacturers — covers rubber seals, O-rings, gaskets, rubber hoses, rubber sheets, rubber extrusions, rubber moulded parts, rubber belts, rubber bushes, rubber buffers, anti-vibration mounts, rubber couplings, rubber diaphragms, rubber grommets, and industrial rubber goods of all kinds supplied to automotive, agricultural, pump, and engineering industries.'
    },
    {
      num: 12,
      name: 'Automotive Rubber Components',
      why: 'Relevant for units that supply rubber components directly for vehicles — including automotive rubber seals, door seals, windshield wiper blades, rubber boots, rubber bellows, CV joint boots, and vehicle-specific rubber moulded parts. Covers rubber parts whose primary use is in cars, trucks, tractors, or two-wheelers.'
    },
    {
      num: 35,
      name: 'Wholesale, Retail & Export Trading',
      why: 'Covers wholesale and retail trading, distribution, and export of rubber products and components — essential for rubber goods manufacturers and traders that sell through dealers, stockists, or directly to overseas buyers and OEMs.'
    },
    {
      num: 40,
      name: 'Rubber Processing & Manufacturing Services',
      why: 'Covers rubber moulding-as-a-service, rubber compounding, rubber vulcanisation, custom rubber extrusion on a job-work basis, and material treatment services — relevant if your unit offers contract rubber processing, custom moulding, or post-processing services for other manufacturers.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Rubber Products Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for rubber products manufacturers in Ludhiana, Punjab and Northern India. Protect your rubber seals, O-rings, gaskets, rubber hoses, rubber belts, or industrial rubber goods brand — Class 17 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for rubber products ludhiana, rubber seal manufacturer trademark punjab, O-ring gasket brand registration india, trademark for rubber goods manufacturers northern india, trademark class 17 rubber products, brand protection rubber manufacturers ludhiana, industrial rubber goods trademark registration punjab, rubber moulding unit trademark india, rubber extrusion manufacturer trademark punjab, trademark for rubber exporters india, rubber belt manufacturer trademark registration, automotive rubber components trademark india';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Rubber Products Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Rubber Products Manufacturers',
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

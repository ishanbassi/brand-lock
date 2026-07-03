import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkSewingMachineFaqs } from '../enums/trademarkSewingMachineFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-sewing-machine-manufacturers',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-sewing-machine-manufacturers.component.html',
  styleUrl: './trademark-sewing-machine-manufacturers.component.scss',
})
export class TrademarkSewingMachineManufacturersComponent implements OnInit, OnDestroy {

  faqs = trademarkSewingMachineFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-sewing-machine-manufacturers';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-sewing-machine-manufacturers';

  classes = [
    {
      num: 7,
      name: 'Sewing Machines & Machine Tools',
      why: 'The primary class for sewing machine manufacturers — covers domestic sewing machines, industrial sewing machines, overlock machines, embroidery machines, sewing machine motors, mechanical attachments, and all sewing machine parts and accessories that are integral to the machine.'
    },
    {
      num: 26,
      name: 'Haberdashery & Sewing Accessories',
      why: 'Relevant for manufacturers or traders who also sell sewing accessories separately — including sewing needles, bobbins, sewing thread bobbins (non-electric), hooks, pins, zippers, and other haberdashery items marketed under the same brand.'
    },
    {
      num: 35,
      name: 'Wholesale, Retail & Export Trading',
      why: 'Covers wholesale and retail trading, distribution, and export of sewing machines and accessories — essential for manufacturers who sell through dealer networks, stockists, or export to overseas garment and textile industries.'
    },
    {
      num: 37,
      name: 'Sewing Machine Repair & Servicing',
      why: 'Covers installation, repair, and maintenance services for sewing machines — relevant if your business offers after-sales servicing, annual maintenance contracts, or sewing machine servicing alongside manufacturing.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Sewing Machine Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for sewing machine and sewing machine parts manufacturers in Ludhiana, Punjab and Northern India. Protect your domestic or industrial sewing machine brand — Class 7 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for sewing machine manufacturers ludhiana, sewing machine trademark punjab, industrial sewing machine brand registration india, trademark for sewing machine parts manufacturers northern india, trademark class 7 sewing machines, brand protection sewing machine manufacturers ludhiana, domestic sewing machine trademark registration punjab, sewing machine parts manufacturer trademark india, IP india trademark class 7 sewing machines, trademark for sewing machine exporters punjab india';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Sewing Machine Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Sewing Machine Manufacturers',
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

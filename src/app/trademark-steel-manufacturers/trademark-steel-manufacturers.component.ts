import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkSteelManufacturersFaqs } from '../enums/trademarkSteelManufacturersFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-steel-manufacturers',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-steel-manufacturers.component.html',
  styleUrl: './trademark-steel-manufacturers.component.scss',
})
export class TrademarkSteelManufacturersComponent implements OnInit, OnDestroy {

  faqs = trademarkSteelManufacturersFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-steel-manufacturers';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-steel-manufacturers';

  classes = [
    {
      num: 6,
      name: 'Steel & Metal Products',
      why: 'The primary class for steel re-rolling mills and metal product manufacturers — covers TMT bars, rods, angles, channels, MS sheets, HR/CR coils, structural steel, wire rods, steel pipes, and all common metal alloy products.'
    },
    {
      num: 7,
      name: 'Industrial Machinery & Equipment',
      why: 'Covers machinery used in steel production, rolling, forging, and processing — relevant for units that manufacture or supply industrial plant and machinery alongside their steel products.'
    },
    {
      num: 35,
      name: 'Wholesale, Retail & Export Trading',
      why: 'Covers trading, wholesale distribution, and export of steel products — essential if you sell through stockists, dealers, distributors, or directly to overseas infrastructure and construction buyers.'
    },
    {
      num: 37,
      name: 'Construction & Steel Fabrication Services',
      why: 'Covers construction services, steel fabrication, erection, and installation services — relevant for steel units that also offer structural fabrication, erection, or turnkey construction services.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Steel Manufacturers & Re-rolling Mills — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for steel re-rolling mills, TMT bar manufacturers, and steel product units in Mandi Gobindgarh, Punjab and Northern India. Protect your brand — Class 6 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for steel manufacturers mandi gobindgarh, steel re-rolling mill trademark punjab, TMT bar brand registration india, trademark for steel products manufacturers northern india, trademark class 6 steel products, brand protection steel mills punjab, mandi gobindgarh trademark registration, MS structural steel trademark india, steel exporter brand registration punjab, IP india trademark steel manufacturer';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Steel Manufacturers & Re-rolling Mills', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Steel Manufacturers & Re-rolling Mills',
        'description': desc,
        'provider': { '@id': 'https://trademarx.in/#organization' },
        'areaServed': [
          { '@type': 'City', 'name': 'Mandi Gobindgarh' },
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

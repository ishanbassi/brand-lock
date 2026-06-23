import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkHosieryKnitwearFaqs } from '../enums/trademarkHosieryKnitwearFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-hosiery-knitwear',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-hosiery-knitwear.component.html',
  styleUrl: './trademark-hosiery-knitwear.component.scss',
})
export class TrademarkHosieryKnitwearComponent implements OnInit, OnDestroy {

  faqs = trademarkHosieryKnitwearFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-hosiery-knitwear';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-hosiery-knitwear';

  classes = [
    {
      num: 25,
      name: 'Clothing, Hosiery & Knitwear',
      why: 'The primary class for hosiery and knitwear manufacturers — covers socks, stockings, sweaters, cardigans, shawls, thermal wear, sports knitwear, inner garments, and all finished textile apparel. This is the essential filing for any Ludhiana hosiery brand.'
    },
    {
      num: 23,
      name: 'Yarns & Threads for Textile Use',
      why: 'Covers knitting yarn, acrylic yarn, wool, and threads used in textile production. Relevant for units that spin or sell yarn alongside finished garments, or exclusively supply yarn to other manufacturers.'
    },
    {
      num: 26,
      name: 'Lace, Embroidery & Textile Accessories',
      why: 'Covers lace trimmings, embroidery, ribbons, and textile accessories. Relevant for knitwear units that produce embellished or decorative knit products, trimmings, and fabric accessories.'
    },
    {
      num: 35,
      name: 'Wholesale, Retail & Export Trading',
      why: 'Covers trading, wholesale, distribution, and export of hosiery and knitwear. Essential if you sell through distributors, retail chains, or directly to overseas buyers under your own brand name.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Hosiery & Knitwear Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for hosiery, knitwear, woollen sweater, socks and thermal wear manufacturers in Ludhiana, Punjab and Northern India. Protect your garment brand from copycats — Class 25 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for hosiery manufacturers ludhiana, knitwear brand registration punjab, woollen sweater trademark ludhiana, socks manufacturer trademark india, hosiery exporter brand protection northern india, trademark class 25 knitwear, brand registration thermal wear ludhiana, trademark registration garment manufacturers punjab, hosiery brand trademark IP india, knitwear trademark registration ludhiana';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Hosiery & Knitwear Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Hosiery & Knitwear Manufacturers',
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

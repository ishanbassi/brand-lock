import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkSportsGoodsFaqs } from '../enums/trademarkSportsGoodsFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-sports-goods',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-sports-goods.component.html',
  styleUrl: './trademark-sports-goods.component.scss',
})
export class TrademarkSportsGoodsComponent implements OnInit, OnDestroy {

  faqs = trademarkSportsGoodsFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-sports-goods';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-sports-goods';

  classes = [
    {
      num: 28,
      name: 'Sporting Goods & Games',
      why: 'The primary class for sports goods manufacturers — covers cricket bats, balls, hockey sticks, footballs, boxing gloves, badminton rackets, gym equipment, gymnastics apparatus, fishing tackle, and all sporting accessories. Essential for every Jalandhar sports goods brand.'
    },
    {
      num: 25,
      name: 'Clothing & Sportswear',
      why: 'Covers sports jerseys, athletic footwear, tracksuits, boxing shorts, cricket whites, and all garment-based sporting accessories. Mandatory for manufacturers who also produce branded apparel, uniforms, or athletic wear alongside their equipment.'
    },
    {
      num: 18,
      name: 'Leather Goods & Sports Bags',
      why: 'Covers leather goods including sports bags, kitbags, cricket kit bags, gym bags, and travel accessories made from leather or leather substitutes. Relevant for manufacturers producing leather-stitched balls (footballs, cricket balls) and sports carrying bags.'
    },
    {
      num: 35,
      name: 'Wholesale, Retail & Export Trading',
      why: 'Covers wholesale distribution, retail trade, and export of sports goods. Essential if you supply to dealers, institutional buyers, or international sports federations under your own brand name. Required for e-commerce brand registry on Amazon and Flipkart.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Sports Goods Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for sports goods manufacturers in Jalandhar, Punjab and Northern India. Protect your cricket bat, football, boxing equipment or hockey stick brand — Class 28 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for sports goods manufacturers jalandhar, sports goods brand registration punjab, cricket bat trademark jalandhar, football manufacturer trademark india, hockey stick brand registration northern india, trademark class 28 sporting goods, boxing equipment trademark ludhiana punjab, sports goods exporter brand protection, trademark registration jalandhar sports goods, IP india trademark sports equipment';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Sports Goods Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Sports Goods Manufacturers',
        'description': desc,
        'provider': { '@id': 'https://trademarx.in/#organization' },
        'areaServed': [
          { '@type': 'City', 'name': 'Jalandhar' },
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

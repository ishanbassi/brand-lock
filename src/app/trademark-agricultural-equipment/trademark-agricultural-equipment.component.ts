import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkAgriculturalEquipmentFaqs } from '../enums/trademarkAgriculturalEquipmentFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-agricultural-equipment',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-agricultural-equipment.component.html',
  styleUrl: './trademark-agricultural-equipment.component.scss',
})
export class TrademarkAgriculturalEquipmentComponent implements OnInit, OnDestroy {

  faqs = trademarkAgriculturalEquipmentFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-agricultural-equipment';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-agricultural-equipment';

  classes = [
    {
      num: 7,
      name: 'Agricultural Machines & Implements',
      why: 'The primary class for farm machinery manufacturers — covers combine harvesters, threshers, rotavators, cultivators, seed-drills, power tillers, chaff cutters, and agricultural machinery parts.'
    },
    {
      num: 12,
      name: 'Tractor-Trailers & Trolleys',
      why: 'Covers tractor-drawn trailers, trolleys, and other towed farm transport equipment — relevant for manufacturers who supply trailers and trolleys alongside or instead of machinery.'
    },
    {
      num: 8,
      name: 'Hand-Operated Agricultural Implements',
      why: 'Covers sickles, khurpas, spades, and other hand-operated farm tools — essential for manufacturers supplying manual implements alongside powered machinery.'
    },
    {
      num: 35,
      name: 'Wholesale & Retail of Farm Equipment',
      why: 'Covers trading, wholesale, and dealership distribution of agricultural machinery and spare parts — essential if you sell through dealer networks, mandis, or directly to farmers.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Agricultural Equipment & Farm Machinery Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for combine harvester, thresher, rotavator and farm machinery manufacturers in Malerkotla, Punjab and Northern India. Protect your brand from copycats — Class 7 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for agricultural equipment manufacturers, farm machinery brand registration punjab, combine harvester trademark malerkotla, trademark for rotavator manufacturers india, agricultural implements trademark northern india, trademark class 7 farm machinery, brand protection tractor trailer punjab, trademark registration agri equipment exporters, thresher manufacturer trademark malerkotla, IP india trademark agricultural machinery';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Agricultural Equipment Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Agricultural Equipment & Farm Machinery Manufacturers',
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

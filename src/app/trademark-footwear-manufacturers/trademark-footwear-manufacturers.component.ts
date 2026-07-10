import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkFootwearManufacturersFaqs } from '../enums/trademarkFootwearManufacturersFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-footwear-manufacturers',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-footwear-manufacturers.component.html',
  styleUrl: './trademark-footwear-manufacturers.component.scss',
})
export class TrademarkFootwearManufacturersComponent implements OnInit, OnDestroy {

  faqs = trademarkFootwearManufacturersFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-footwear-manufacturers';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-footwear-manufacturers';

  classes = [
    {
      num: 25,
      name: 'Footwear, Clothing & Headgear',
      why: 'The primary class for footwear manufacturers — covers leather shoes, sports shoes, sandals, chappals, boots, juttis, slippers, and all types of footwear along with allied clothing and headgear. Class 25 is the correct filing class for any footwear brand sold to retail chains, e-commerce platforms, or export markets.'
    },
    {
      num: 18,
      name: 'Leather Goods & Bags',
      why: 'Relevant for footwear manufacturers who also produce or brand leather bags, wallets, belts, and leather accessories — common among Agra units that run combined footwear and leather goods lines. Class 18 covers leather and imitation leather goods not included in other classes.'
    },
    {
      num: 35,
      name: 'Wholesale, Retail & Export Trading',
      why: 'Covers wholesale and retail trading, distribution, and export of footwear and leather goods — essential for manufacturers and traders selling through dealer networks, retail chains, e-commerce marketplaces, or directly to overseas buyers.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Footwear Manufacturers — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for footwear and leather goods manufacturers in Agra, Uttar Pradesh and Northern India. Protect your shoe, sandal, or leather brand — Class 25 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for footwear manufacturers agra, shoe manufacturer trademark uttar pradesh, footwear brand registration india, leather shoes trademark registration up, trademark class 25 footwear, brand protection footwear manufacturers northern india, sports shoes manufacturer trademark agra, leather goods trademark registration india, footwear exporters trademark agra, shoe brand registration uttar pradesh, trademark for leather bags manufacturers agra, chappal and sandal manufacturer trademark';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Footwear Manufacturers', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Footwear Manufacturers',
        'description': desc,
        'provider': { '@id': 'https://trademarx.in/#organization' },
        'areaServed': [
          { '@type': 'City', 'name': 'Agra' },
          { '@type': 'State', 'name': 'Uttar Pradesh' },
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

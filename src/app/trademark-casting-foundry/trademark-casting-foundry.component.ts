import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { FaqComponent } from '../faq/faq.component';
import { RatingReviewComponent } from '../rating-review/rating-review.component';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { VerticalStepperComponent } from '../vertical-stepper/vertical-stepper.component';
import { RegistrationProcessList } from '../enums/RegistrationProcessList';
import { trademarkCastingFoundryFaqs } from '../enums/trademarkCastingFoundryFaq';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-trademark-casting-foundry',
  imports: [
    LeadFormComponent,
    FaqComponent,
    RouterLink,
    RatingReviewComponent,
    FirmBannerComponent,
    VerticalStepperComponent,
  ],
  templateUrl: './trademark-casting-foundry.component.html',
  styleUrl: './trademark-casting-foundry.component.scss',
})
export class TrademarkCastingFoundryComponent implements OnInit, OnDestroy {

  faqs = trademarkCastingFoundryFaqs;
  registrationSteps = RegistrationProcessList;

  private readonly schemaId = 'trademark-casting-foundry';
  private readonly pageUrl = 'https://trademarx.in/trademark-registration-for-casting-foundry';

  classes = [
    {
      num: 6,
      name: 'Cast Metal Products & Components',
      why: 'The primary class for foundry and casting manufacturers — covers grey iron castings, ductile iron castings, aluminium die castings, sand castings, investment castings, pressure die castings, SG iron castings, cast metal housings, pump casings, brackets, flanges, and all cast or semi-finished metal parts supplied to automotive, agricultural, pump, and engineering industries.'
    },
    {
      num: 7,
      name: 'Casting Machinery, Dies & Moulds',
      why: 'Relevant for units that also manufacture or market die casting machines, sand casting equipment, shell moulding machines, pattern equipment, or casting dies and moulds. Covers machines and tooling used in the metal casting and foundry process.'
    },
    {
      num: 35,
      name: 'Wholesale, Retail & Export Trading',
      why: 'Covers wholesale and retail trading, distribution, and export of cast metal products and components — essential for foundry units that sell through dealers, stockists, or directly to overseas OEMs and Tier-1 suppliers.'
    },
    {
      num: 40,
      name: 'Metal Treatment & Casting Services',
      why: 'Covers treatment of materials including metal casting-as-a-service, heat treatment, surface treatment, shot blasting, and job-work foundry contracts — relevant if your unit offers casting on a contract basis or provides post-casting machining, heat treatment, and finishing services.'
    },
  ];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'Trademark Registration for Casting & Foundry Units — ₹1,499 | Trademarx';
    const desc = 'Trademark registration for casting and foundry units in Ludhiana, Punjab and Northern India. Protect your grey iron, ductile iron, aluminium die casting, sand casting, or investment casting brand — Class 6 filing from ₹1,499. IP India authorised agents, 100% online process.';
    const keywords = 'trademark registration for casting foundry ludhiana, foundry unit trademark punjab, grey iron casting brand registration india, trademark for casting manufacturers northern india, trademark class 6 cast metal products, brand protection foundry units ludhiana, aluminium die casting trademark registration punjab, ductile iron casting trademark india, sand casting manufacturer trademark punjab, trademark for foundry exporters india, investment casting trademark registration, pressure die casting brand protection india';

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
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark for Casting & Foundry Units', 'item': this.pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Trademark Registration for Casting & Foundry Units',
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

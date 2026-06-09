import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SeoService } from '../../shared/services/seo.service';
import { LeadFormComponent } from '../../lead-form/lead-form.component';
import { FaqComponent } from '../../faq/faq.component';
import { getIndustryData, IndustryData, ALL_INDUSTRY_SLUGS, INDUSTRY_DATA } from './industry-data';

@Component({
  selector: 'app-trademark-industry-page',
  imports: [LeadFormComponent, FaqComponent, RouterLink],
  templateUrl: './trademark-industry-page.component.html',
  styleUrl: './trademark-industry-page.component.scss',
})
export class TrademarkIndustryPageComponent implements OnInit, OnDestroy {
  industry!: IndustryData;
  otherIndustries: IndustryData[] = [];
  schemaId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
    private meta: Meta,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('industry') ?? '';
    const data = getIndustryData(slug);

    if (!data) {
      this.router.navigateByUrl('/not-found', { skipLocationChange: true });
      return;
    }

    this.industry = data;
    this.otherIndustries = Object.values(INDUSTRY_DATA).filter(i => i.slug !== slug).slice(0, 10);
    this.schemaId = `trademark-industry-${slug}`;

    const pageTitle = `Trademark Registration for ${data.displayName} in India — ₹1,499 | Trademarx`;
    const desc = `Register a trademark for your ${data.name} business from ₹1,499. ${data.whyMatters} IP India authorised agents, 100% online.`;
    const pageUrl = `https://trademarx.in/trademark/industry/${slug}`;

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: pageUrl });
    this.meta.updateTag({ property: 'og:image', content: 'https://trademarx.in/assets/images/trademarx.png' });

    this.seo.setCanonical(pageUrl);
    this.seo.injectJsonLd([
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://trademarx.in/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Trademark Registration', 'item': 'https://trademarx.in/trademark' },
          { '@type': 'ListItem', 'position': 3, 'name': `Trademark for ${data.name}`, 'item': pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': `Trademark Registration for ${data.name} Business`,
        'description': desc,
        'provider': { '@id': 'https://trademarx.in/#organization' },
        'areaServed': { '@type': 'Country', 'name': 'India' },
        'offers': {
          '@type': 'Offer',
          'price': '1499',
          'priceCurrency': 'INR',
          'url': pageUrl,
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': data.faqs.map(f => ({
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

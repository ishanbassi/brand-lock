import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SeoService } from '../../shared/services/seo.service';
import { LeadFormComponent } from '../../lead-form/lead-form.component';
import { FaqComponent } from '../../faq/faq.component';
import { getCityData, CityData, CITY_DATA } from '../trademark-city-page/city-data';
import { getServiceData, ServiceConfig } from './service-data';
import { stateSlug as slugifyState } from '../../shared/utils/trends-slug.util';

@Component({
  selector: 'app-service-city-page',
  imports: [LeadFormComponent, FaqComponent, RouterLink],
  templateUrl: './service-city-page.component.html',
  styleUrl: './service-city-page.component.scss',
})
export class ServiceCityPageComponent implements OnInit, OnDestroy {
  city!: CityData;
  service!: ServiceConfig;
  otherCities: CityData[] = [];
  schemaId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
    private meta: Meta,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    const serviceSlug = this.route.snapshot.data['serviceSlug'] as string;
    const citySlug = this.route.snapshot.paramMap.get('city') ?? '';

    const city = getCityData(citySlug);
    const service = getServiceData(serviceSlug);

    if (!city || !service) {
      this.router.navigateByUrl('/not-found', { skipLocationChange: true });
      return;
    }

    this.city = city;
    this.service = service;
    this.otherCities = Object.values(CITY_DATA).filter(c => c.slug !== citySlug).slice(0, 12);
    this.schemaId = `${serviceSlug}-${citySlug}`;

    const pageTitle = `${service.name} in ${city.name}, ${city.state} — ${service.price} | Trademarx`;
    const desc = `Get ${service.name} in ${city.name} for ${service.price}. ${service.tagline} 100% online, certificate in 1–3 working days.`;
    const pageUrl = `https://trademarx.in/${serviceSlug}/${citySlug}`;

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
          { '@type': 'ListItem', 'position': 2, 'name': service.name, 'item': `https://trademarx.in/${serviceSlug}` },
          { '@type': 'ListItem', 'position': 3, 'name': `${service.name} in ${city.name}`, 'item': pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': `${service.name} in ${city.name}`,
        'description': desc,
        'provider': { '@id': 'https://trademarx.in/#organization' },
        'areaServed': [
          { '@type': 'City', 'name': city.name },
          { '@type': 'State', 'name': city.state },
          { '@type': 'Country', 'name': 'India' },
        ],
        'offers': {
          '@type': 'Offer',
          'price': service.price.replace('₹', '').replace(',', ''),
          'priceCurrency': 'INR',
          'description': service.priceNote,
          'url': pageUrl,
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': service.faqs.map(f => ({
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

  /** "Tamil Nadu" -> "tamil-nadu", matching the backend's slugify so the link round-trips. */
  stateSlug(state: string): string {
    return slugifyState(state);
  }
}

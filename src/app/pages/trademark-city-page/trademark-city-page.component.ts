import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SeoService } from '../../shared/services/seo.service';
import { LeadFormComponent } from '../../lead-form/lead-form.component';
import { FaqComponent } from '../../faq/faq.component';
import { trademarkFaqs } from '../../enums/faqList';
import { getCityData, getRegistryOffice, CityData, CITY_DATA } from './city-data';

@Component({
  selector: 'app-trademark-city-page',
  imports: [LeadFormComponent, FaqComponent, RouterLink],
  templateUrl: './trademark-city-page.component.html',
  styleUrl: './trademark-city-page.component.scss',
})
export class TrademarkCityPageComponent implements OnInit, OnDestroy {
  city!: CityData;
  otherCities: CityData[] = [];
  registryOffice = '';
  faqs = trademarkFaqs;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
    private meta: Meta,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('city') ?? '';
    const data = getCityData(slug);

    if (!data) {
      this.router.navigateByUrl('/not-found', { skipLocationChange: true });
      return;
    }

    this.city = data;
    this.registryOffice = getRegistryOffice(data.state);
    this.otherCities = Object.values(CITY_DATA).filter(c => c.slug !== slug);
    const pageTitle = `Trademark Registration in ${data.name}, ${data.state} — ₹1,499 + Govt. Fees | Trademarx`;
    const desc = `Register your trademark in ${data.name} from ₹1,499. IP India authorised agents. Free trademark search, 5,000+ marks filed, 98% success rate. 100% online process.`;

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: `https://trademarx.in/trademark/${data.slug}` });
    this.meta.updateTag({ property: 'og:image', content: 'https://trademarx.in/assets/images/trademarx.png' });

    this.meta.updateTag({ name: 'robots', content: 'index, follow' });

    this.seo.setCanonical(`https://trademarx.in/trademark/${data.slug}`);
    this.seo.injectJsonLd([
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://trademarx.in/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Trademark Registration', 'item': 'https://trademarx.in/trademark' },
          { '@type': 'ListItem', 'position': 3, 'name': `Trademark Registration in ${data.name}`, 'item': `https://trademarx.in/trademark/${data.slug}` },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': `Trademark Registration in ${data.name}`,
        'description': desc,
        'provider': { '@id': 'https://trademarx.in/#organization' },
        'areaServed': [
          { '@type': 'City', 'name': data.name },
          { '@type': 'State', 'name': data.state },
          { '@type': 'Country', 'name': 'India' },
        ],
        'offers': {
          '@type': 'Offer',
          'price': '1499',
          'priceCurrency': 'INR',
          'description': 'Professional fee. Government filing fees of ₹4,500–₹9,000 additional.',
          'url': `https://trademarx.in/trademark/${data.slug}`,
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': this.faqs.slice(0, 8).map(f => ({
          '@type': 'Question',
          'name': f.question,
          'acceptedAnswer': { '@type': 'Answer', 'text': f.answer },
        })),
      },
    ], `trademark-city-${data.slug}`);
  }

  ngOnDestroy(): void {
    if (this.city) {
      this.seo.removeJsonLd(`trademark-city-${this.city.slug}`);
    }
    this.seo.removeCanonical();
    this.meta.removeTag("name='robots'");
  }
}

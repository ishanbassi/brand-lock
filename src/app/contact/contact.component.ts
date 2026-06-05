import { Component, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-contact',
  imports: [LeadFormComponent, SharedModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {

  private schemaScript?: HTMLScriptElement;

  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Contact Us | Trademarx - Trademark & ISO Certification Experts in Ludhiana');
    this.meta.updateTag({ name: 'description', content: 'Contact Trademarx in Ludhiana for trademark registration, ISO certification, and MSME services. Call +91 62397-71006 or visit 38 Hambran Road, Near South City, Ludhiana 141001.' });
    this.meta.updateTag({ property: 'og:title', content: 'Contact Trademarx - Ludhiana\'s IP & Legal Services Experts' });
    this.meta.updateTag({ property: 'og:description', content: 'Get in touch with Trademarx for trademark registration, ISO certification, and MSME services.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://trademarx.in/contact' });
    this.injectJsonLd();
  }

  ngOnDestroy(): void {
    this.schemaScript?.remove();
  }

  private injectJsonLd(): void {
    if (this.document.querySelector('script[data-schema="contact"]')) return;
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'LegalService',
      '@id': 'https://trademarx.in/#organization',
      'name': 'Trademarx - Bassi & Associates',
      'url': 'https://trademarx.in',
      'telephone': '+916239771006',
      'email': 'support@trademarx.in',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': '38 Hambran Road, Near South City',
        'addressLocality': 'Ludhiana',
        'addressRegion': 'Punjab',
        'postalCode': '141001',
        'addressCountry': 'IN'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': 30.8852,
        'longitude': 75.8310
      },
      'openingHoursSpecification': [{
        '@type': 'OpeningHoursSpecification',
        'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'opens': '10:00',
        'closes': '19:00'
      }]
    };
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', 'contact');
    script.text = JSON.stringify(schema);
    this.document.head.appendChild(script);
    this.schemaScript = script;
  }
}

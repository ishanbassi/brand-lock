import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/services/seo.service';
import { LeadFormComponent } from '../../lead-form/lead-form.component';

const isoTypes = [
  { code: 'ISO 9001:2015', name: 'Quality Management System', route: '/iso/iso-9001-2015', price: '₹1,499', desc: 'The most widely adopted ISO standard worldwide. Required by government tenders, large corporates, and international buyers. Improves process efficiency and customer satisfaction.', industries: 'Manufacturing, Services, IT, Construction, Healthcare', icon: 'fas fa-award' },
  { code: 'ISO 14001:2015', name: 'Environmental Management System', route: null, price: 'Contact Us', desc: 'Demonstrates your commitment to environmental responsibility. Required for export-oriented industries, EIA clearances, and green procurement mandates.', industries: 'Manufacturing, Chemicals, Textiles, Construction', icon: 'fas fa-leaf' },
  { code: 'ISO 45001:2018', name: 'Occupational Health & Safety', route: null, price: 'Contact Us', desc: 'Protects workers and reduces workplace incidents. Required by labour-intensive industries and increasingly mandated by government contractors.', industries: 'Construction, Mining, Manufacturing, Logistics', icon: 'fas fa-hard-hat' },
  { code: 'ISO 22000:2018', name: 'Food Safety Management', route: null, price: 'Contact Us', desc: 'Mandatory for food exporters and increasingly required by domestic retail chains. Covers the full farm-to-fork supply chain.', industries: 'Food Processing, Restaurants, Catering, Packaging', icon: 'fas fa-utensils' },
  { code: 'ISO 27001:2022', name: 'Information Security Management', route: null, price: 'Contact Us', desc: 'Gold standard for data security. Required by IT service exporters, BFSI clients, and any company handling sensitive customer data.', industries: 'IT & Software, BFSI, Healthcare, BPO/KPO', icon: 'fas fa-lock' },
  { code: 'IATF 16949:2016', name: 'Automotive Quality Management', route: null, price: 'Contact Us', desc: 'Mandatory for Tier-1 and Tier-2 automotive suppliers. Required by OEMs like Maruti, Hyundai, Tata, Mahindra, and all global auto brands.', industries: 'Automotive Parts, Plastics, Metals, Electronics', icon: 'fas fa-car' },
];

@Component({
  selector: 'app-iso-hub',
  imports: [LeadFormComponent, RouterLink],
  templateUrl: './iso-hub.component.html',
  styleUrl: './iso-hub.component.scss',
})
export class IsoHubComponent implements OnInit, OnDestroy {
  isoTypes = isoTypes;

  constructor(
    private title: Title,
    private meta: Meta,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('ISO Certification in India — All Standards | Trademarx');
    this.meta.updateTag({ name: 'description', content: 'Get ISO certified in India. ISO 9001, 14001, 45001, 22000, 27001, IATF 16949. Starting from ₹1,499. Valid in government tenders. Fast processing by expert consultants.' });
    this.meta.updateTag({ property: 'og:title', content: 'ISO Certification in India — All Standards | Trademarx' });
    this.meta.updateTag({ property: 'og:description', content: 'ISO 9001, 14001, 45001, 22000, 27001, IATF 16949 certification in India. Starting ₹1,499. Expert consultants.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://trademarx.in/iso' });
    this.meta.updateTag({ property: 'og:image', content: 'https://trademarx.in/assets/images/trademarx.png' });
    this.seo.setCanonical('https://trademarx.in/iso');
    this.seo.injectJsonLd([
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://trademarx.in/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'ISO Certification', 'item': 'https://trademarx.in/iso' },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'ISO Certification Consulting',
        'description': 'ISO certification consulting for Indian businesses covering ISO 9001, 14001, 45001, 22000, 27001, and IATF 16949. Certificate valid in government tenders.',
        'provider': { '@id': 'https://trademarx.in/#organization' },
        'areaServed': { '@type': 'Country', 'name': 'India' },
        'hasOfferCatalog': {
          '@type': 'OfferCatalog',
          'name': 'ISO Certification Services',
          'itemListElement': isoTypes.map(iso => ({
            '@type': 'Offer',
            'itemOffered': { '@type': 'Service', 'name': `${iso.code} — ${iso.name}` },
          })),
        },
      },
    ], 'iso-hub');
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd('iso-hub');
    this.seo.removeCanonical();
  }
}

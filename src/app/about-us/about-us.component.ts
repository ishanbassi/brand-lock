import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DefaultTopSectionComponent } from '../deafult-top-section/default-top-section.component';
import { TeamSectionComponent } from '../team-section/team-section.component';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-about-us',
  imports: [DefaultTopSectionComponent, TeamSectionComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent implements OnInit, OnDestroy {

  constructor(
    private title: Title,
    private meta: Meta,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('About Us | Trademarx — IP India Authorised Trademark Agents in Ludhiana');
    this.meta.updateTag({ name: 'description', content: 'Meet the Trademarx team — Anil Bassi (20+ years, 5,000+ marks) and Ishan Bassi (400+ marks). IP India authorised trademark agents based in Ludhiana, Punjab.' });
    this.meta.updateTag({ property: 'og:title', content: 'About Trademarx — Trademark & ISO Experts in Ludhiana' });
    this.meta.updateTag({ property: 'og:description', content: 'Authorised trademark agents with 20+ years of experience. Based in Ludhiana, Punjab.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://trademarx.in/about-us' });
    this.seo.setCanonical('https://trademarx.in/about-us');
    this.seo.injectJsonLd([
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://trademarx.in/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'About Us', 'item': 'https://trademarx.in/about-us' }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': 'Anil Bassi',
        'jobTitle': 'Trademark Attorney & Agent',
        'worksFor': { '@id': 'https://trademarx.in/#organization' },
        'telephone': '+919814133010',
        'email': 'anil@trademarx.in',
        'address': { '@type': 'PostalAddress', 'addressLocality': 'Ludhiana', 'addressRegion': 'Punjab', 'addressCountry': 'IN' }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': 'Ishan Bassi',
        'jobTitle': 'Trademark Attorney',
        'worksFor': { '@id': 'https://trademarx.in/#organization' },
        'telephone': '+916239771006',
        'email': 'ishan@trademarx.in',
        'address': { '@type': 'PostalAddress', 'addressLocality': 'Ludhiana', 'addressRegion': 'Punjab', 'addressCountry': 'IN' }
      }
    ], 'about-page');
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd('about-page');
    this.seo.removeCanonical();
  }
}

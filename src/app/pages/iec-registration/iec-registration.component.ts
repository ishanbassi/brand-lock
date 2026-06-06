import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/services/seo.service';
import { LeadFormComponent } from '../../lead-form/lead-form.component';
import { FaqComponent } from '../../faq/faq.component';

const iecFaqs = [
  { question: 'What is an IEC (Import Export Code)?', answer: 'An Import Export Code (IEC) is a 10-digit alphanumeric code issued by the Directorate General of Foreign Trade (DGFT), Government of India. It is mandatory for any business or individual who wants to import goods into India or export goods from India.' },
  { question: 'Who needs an IEC?', answer: 'Any person or business entity — sole proprietor, partnership, LLP, private limited company, or trust — that imports or exports goods or services from India must have a valid IEC. It is also required for receiving foreign inward remittances and making outward remittances for services.' },
  { question: 'Is IEC mandatory for service exports?', answer: 'IEC is not mandatory for service exporters unless they wish to avail benefits under DGFT schemes like SEIS (Services Exports from India Scheme). However, banks and RBI typically require IEC for foreign remittances related to service exports.' },
  { question: 'What documents are required for IEC registration?', answer: 'You need: PAN card of the entity, Aadhaar card (for proprietors), business registration proof (GST, MSME, Certificate of Incorporation), cancelled cheque or bank certificate, and digital signature (for companies/LLPs).' },
  { question: 'How long does IEC registration take?', answer: 'With our service, IEC is typically obtained within 1–3 working days from the DGFT portal after submission of complete documents. The code is issued digitally and valid for life.' },
  { question: 'Does IEC need to be renewed?', answer: 'No. IEC is a lifetime registration and does not expire or need renewal. However, it must be updated annually on the DGFT portal to keep it active (a free online process).' },
  { question: 'Can I use IEC for multiple businesses?', answer: 'No. One IEC is issued per PAN. If you have multiple businesses under different entities, each entity requires its own IEC code.' },
  { question: 'What is the government fee for IEC registration?', answer: 'The DGFT charges ₹500 as the government fee for IEC registration. Our professional fee of ₹1,499 covers document preparation, application filing, and follow-up with DGFT.' },
];

@Component({
  selector: 'app-iec-registration',
  imports: [LeadFormComponent, FaqComponent, RouterLink],
  templateUrl: './iec-registration.component.html',
  styleUrl: './iec-registration.component.scss',
})
export class IecRegistrationComponent implements OnInit, OnDestroy {
  faqs = iecFaqs;

  constructor(
    private title: Title,
    private meta: Meta,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Import Export Code (IEC) Registration Online — ₹1,499 | Trademarx');
    this.meta.updateTag({ name: 'description', content: 'Get your Import Export Code (IEC) online in India for ₹1,499. Mandatory for importers and exporters. Fast 1–3 day processing. DGFT authorised. No renewal required.' });
    this.meta.updateTag({ property: 'og:title', content: 'Import Export Code (IEC) Registration — ₹1,499 | Trademarx' });
    this.meta.updateTag({ property: 'og:description', content: 'IEC registration online for ₹1,499. Mandatory for any business importing or exporting from India. Fast processing by experts.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://trademarx.in/iec-registration' });
    this.meta.updateTag({ property: 'og:image', content: 'https://trademarx.in/assets/images/trademarx.png' });
    this.seo.setCanonical('https://trademarx.in/iec-registration');
    this.seo.injectJsonLd([
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://trademarx.in/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'IEC Registration', 'item': 'https://trademarx.in/iec-registration' },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'Import Export Code (IEC) Registration',
        'description': 'Online IEC registration for Indian importers and exporters. Includes document preparation, DGFT application filing, and code delivery within 1–3 working days.',
        'provider': { '@id': 'https://trademarx.in/#organization' },
        'areaServed': { '@type': 'Country', 'name': 'India' },
        'offers': {
          '@type': 'Offer',
          'price': '1499',
          'priceCurrency': 'INR',
          'description': 'Professional fee + ₹500 DGFT government fee.',
          'url': 'https://trademarx.in/iec-registration',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': iecFaqs.map(f => ({
          '@type': 'Question',
          'name': f.question,
          'acceptedAnswer': { '@type': 'Answer', 'text': f.answer },
        })),
      },
    ], 'iec-page');
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd('iec-page');
    this.seo.removeCanonical();
  }
}

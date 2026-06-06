import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/services/seo.service';
import { LeadFormComponent } from '../../lead-form/lead-form.component';
import { FaqComponent } from '../../faq/faq.component';

const msmeFaqs = [
  { question: 'What is MSME / Udyam registration?', answer: 'Udyam Registration is the official government process for registering a Micro, Small, or Medium Enterprise (MSME) in India. It replaced the older Udyog Aadhaar system in July 2020 and is governed by the Ministry of MSME.' },
  { question: 'Who is eligible for Udyam registration?', answer: 'Any business engaged in manufacturing, production, or services with annual turnover below ₹250 crore can register. This includes sole proprietors, partnerships, LLPs, private limited companies, and Hindu Undivided Families (HUFs).' },
  { question: 'What are the benefits of MSME registration?', answer: 'Key benefits include: 50% subsidy on trademark registration fees, priority lending at lower interest rates, protection against delayed payments from buyers, eligibility for government tenders reserved for MSMEs, and access to subsidised electricity and tax exemptions.' },
  { question: 'What documents are required for Udyam registration?', answer: 'Only your Aadhaar number and PAN card are required. For companies and LLPs, the GSTIN is also needed. No physical documents need to be submitted — the process is fully online.' },
  { question: 'How long does MSME / Udyam registration take?', answer: 'With our service, registration is typically completed within 1 working day. The Udyam Registration certificate is issued by the government portal after verification.' },
  { question: 'Is MSME registration mandatory?', answer: 'No, MSME registration is not mandatory. However, without it you cannot access the MSME subsidy on trademark fees, priority credit, or government tender benefits.' },
  { question: 'What is the MSME subsidy on trademark registration?', answer: 'MSME-registered businesses pay ₹4,500 per trademark class instead of ₹9,000 — a 50% saving on government fees. This saving alone covers the cost of MSME registration many times over.' },
  { question: 'Can a proprietorship firm get MSME registration?', answer: 'Yes. A sole proprietorship can register as an MSME using the proprietor\'s Aadhaar number. It is one of the most common registrations we process.' },
];

@Component({
  selector: 'app-msme-registration',
  imports: [LeadFormComponent, FaqComponent, RouterLink],
  templateUrl: './msme-registration.component.html',
  styleUrl: './msme-registration.component.scss',
})
export class MsmeRegistrationComponent implements OnInit, OnDestroy {
  faqs = msmeFaqs;

  constructor(
    private title: Title,
    private meta: Meta,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('MSME / Udyam Registration Online — ₹499 | Trademarx');
    this.meta.updateTag({ name: 'description', content: 'Register your MSME / Udyam online in India for ₹499. Get 50% subsidy on trademark fees, priority loans, and government tender benefits. Fast 1-day processing.' });
    this.meta.updateTag({ property: 'og:title', content: 'MSME / Udyam Registration Online — ₹499 | Trademarx' });
    this.meta.updateTag({ property: 'og:description', content: 'MSME Udyam registration for ₹499. Unlock 50% trademark fee subsidy, priority lending, and government tender eligibility.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://trademarx.in/msme-registration' });
    this.meta.updateTag({ property: 'og:image', content: 'https://trademarx.in/assets/images/trademarx.png' });
    this.seo.setCanonical('https://trademarx.in/msme-registration');
    this.seo.injectJsonLd([
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://trademarx.in/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'MSME Registration', 'item': 'https://trademarx.in/msme-registration' },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        'name': 'MSME / Udyam Registration',
        'description': 'Online MSME Udyam registration for Indian businesses. Includes free eligibility check, Aadhaar-based verification, and certificate delivery within 1 working day.',
        'provider': { '@id': 'https://trademarx.in/#organization' },
        'areaServed': { '@type': 'Country', 'name': 'India' },
        'offers': {
          '@type': 'Offer',
          'price': '499',
          'priceCurrency': 'INR',
          'description': 'All-inclusive professional fee. No hidden charges.',
          'url': 'https://trademarx.in/msme-registration',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': msmeFaqs.map(f => ({
          '@type': 'Question',
          'name': f.question,
          'acceptedAnswer': { '@type': 'Answer', 'text': f.answer },
        })),
      },
    ], 'msme-page');
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd('msme-page');
    this.seo.removeCanonical();
  }
}

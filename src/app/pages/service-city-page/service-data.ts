export type ServiceSlug = 'msme-registration' | 'iec-registration' | 'iso-9001';

export interface ServiceFaq { question: string; answer: string; }

export interface ServiceConfig {
  slug: ServiceSlug;
  name: string;
  shortName: string;
  price: string;
  priceNote: string;
  tagline: string;
  leadComment: string;
  whatsappText: string;
  benefits: { icon: string; title: string; desc: string }[];
  process: { title: string; desc: string }[];
  faqs: ServiceFaq[];
  relatedServices: { route: string; icon: string; title: string; price: string }[];
}

export const SERVICE_DATA: Record<ServiceSlug, ServiceConfig> = {
  'msme-registration': {
    slug: 'msme-registration',
    name: 'MSME / Udyam Registration',
    shortName: 'MSME Registration',
    price: '₹499',
    priceNote: 'All-inclusive, no hidden charges',
    tagline: 'Get the 50% trademark fee subsidy, priority lending, and government tender eligibility.',
    leadComment: 'MSME REGISTRATION',
    whatsappText: 'I%20want%20MSME%20registration',
    benefits: [
      { icon: 'fas fa-percent', title: '50% Trademark Fee Subsidy', desc: 'Pay ₹4,500 instead of ₹9,000 per trademark class — the subsidy alone pays for this registration many times over.' },
      { icon: 'fas fa-university', title: 'Priority Lending & Lower Interest', desc: 'Access collateral-free loans up to ₹2 crore under CGTMSE. Banks are mandated to provide priority sector lending to MSMEs.' },
      { icon: 'fas fa-gavel', title: 'Government Tender Eligibility', desc: 'Many central and state tenders are reserved exclusively for MSME vendors. MSME registration is a prerequisite for GeM registration.' },
      { icon: 'fas fa-shield-alt', title: 'Payment Protection', desc: 'Under the MSMED Act, buyers must pay within 45 days. Delays attract compound interest at 3× the RBI rate.' },
      { icon: 'fas fa-bolt', title: 'Electricity & Tax Benefits', desc: 'MSMEs are eligible for subsidised electricity tariffs in many states and additional excise and customs duty exemptions.' },
      { icon: 'fas fa-certificate', title: 'ISO & Certification Subsidies', desc: 'Government reimburses ISO, BIS, and quality certification costs for MSME-registered businesses.' },
    ],
    process: [
      { title: 'Share Your Details', desc: 'Provide your Aadhaar number, PAN, and basic business information. For companies and LLPs, GSTIN is also needed.' },
      { title: 'Aadhaar OTP Verification', desc: 'The Udyam portal verifies your identity via Aadhaar OTP. We guide you through this step for a smooth process.' },
      { title: 'Application Filing', desc: 'We submit your Udyam registration on the official government portal (udyamregistration.gov.in).' },
      { title: 'Certificate Issued', desc: 'Your Udyam Registration Certificate is issued digitally with a unique URN. Valid for life — no renewal required.' },
    ],
    faqs: [
      { question: 'Is MSME registration mandatory?', answer: 'Not legally mandatory for all businesses, but effectively required to access government tenders, priority loans, trademark fee subsidies, and GeM registration.' },
      { question: 'What documents are needed for Udyam registration?', answer: 'Aadhaar card, PAN card, and basic business details. For companies and LLPs, GSTIN is also required. No physical document submission is needed.' },
      { question: 'How long does MSME registration take?', answer: 'The Udyam Registration Certificate is issued on the same day — usually within hours of submitting the application online.' },
      { question: 'Is MSME registration free on the government portal?', answer: 'Yes, the Udyam registration is free on the official government portal (udyamregistration.gov.in). Professional assistance costs ₹499.' },
      { question: 'Does MSME registration need to be renewed?', answer: 'No. The Udyam Registration Certificate is valid for life. There is no renewal process — once registered, you remain an MSME as long as you meet the turnover/investment criteria.' },
      { question: 'Can I get MSME registration for a proprietorship?', answer: 'Yes. Proprietorships, partnerships, LLPs, private limited companies, and one-person companies can all register as MSMEs under Udyam.' },
    ],
    relatedServices: [
      { route: '/trademark', icon: 'fas fa-trademark', title: 'Trademark Registration', price: '₹1,499 + ₹4,500 Govt. Fee (with MSME discount)' },
      { route: '/iso/iso-9001-2015', icon: 'fas fa-certificate', title: 'ISO 9001 Certification', price: '₹1,499 — valid in government tenders' },
      { route: '/iec-registration', icon: 'fas fa-plane-departure', title: 'IEC (Import Export Code)', price: '₹1,499 — required for import/export' },
    ],
  },

  'iec-registration': {
    slug: 'iec-registration',
    name: 'Import Export Code (IEC)',
    shortName: 'IEC Registration',
    price: '₹1,499',
    priceNote: '+ ₹500 DGFT Govt. Fee · Total ₹1,999',
    tagline: 'Mandatory 10-digit code for any business importing or exporting goods and services from India.',
    leadComment: 'IEC REGISTRATION',
    whatsappText: 'I%20want%20IEC%20registration',
    benefits: [
      { icon: 'fas fa-ship', title: 'Customs Clearance', desc: 'IEC is mandatory for customs clearance of all imported and exported goods. Without it, your shipment cannot be processed.' },
      { icon: 'fas fa-money-bill-wave', title: 'Receive Foreign Payments', desc: 'Banks require IEC to process foreign remittances via SWIFT/wire transfer. Freelancers and service exporters need it to receive international payments.' },
      { icon: 'fas fa-globe', title: 'Global Marketplace Access', desc: 'Required to sell on Amazon Global, Etsy, and other international marketplaces. Also needed for FIRC and export incentive claims.' },
      { icon: 'fas fa-infinity', title: 'Lifetime Validity', desc: 'IEC is valid for life — no renewal required. Just update your details on the DGFT portal annually (free compliance step).' },
    ],
    process: [
      { title: 'Document Collection', desc: 'We collect your PAN, Aadhaar, business proof, and bank details. Everything handled digitally — no physical submission.' },
      { title: 'DGFT Application Filing', desc: 'We file your IEC application on the official DGFT portal (dgft.gov.in) with the ₹500 government fee.' },
      { title: 'Verification', desc: 'DGFT verifies the application against your PAN and bank details. We follow up with DGFT if any queries arise.' },
      { title: 'IEC Certificate Issued', desc: 'Your IEC Certificate is emailed directly from DGFT with your unique 10-digit code. The digital copy is legally valid.' },
    ],
    faqs: [
      { question: 'Who needs an IEC code in India?', answer: 'Any business or individual importing or exporting goods or services needs an IEC. This includes product exporters, IT/service exporters receiving foreign payments, Amazon global sellers, and businesses importing raw materials.' },
      { question: 'How long does IEC registration take?', answer: 'IEC is typically issued within 1–3 working days after complete application submission. In straightforward cases, it can be issued on the same day.' },
      { question: 'Is IEC required for service exports and freelancers?', answer: 'Yes. Freelancers and agencies receiving foreign payments for software, design, or consulting services need IEC to repatriate funds through banking channels and to claim export incentives.' },
      { question: 'What is the government fee for IEC?', answer: 'The DGFT charges ₹500 as the government fee for IEC registration. This is included in our total fee of ₹1,999.' },
      { question: 'Does IEC need to be renewed every year?', answer: 'No renewal fee, but you must update/confirm your IEC details on the DGFT portal every year. This is a free compliance step — failure to update can result in deactivation.' },
      { question: 'Can I have multiple IEC codes for different businesses?', answer: 'No. One PAN is linked to one IEC. If you have multiple businesses under different PANs, each gets a separate IEC.' },
    ],
    relatedServices: [
      { route: '/trademark', icon: 'fas fa-trademark', title: 'Trademark Registration', price: '₹1,499 — protect your brand before exporting' },
      { route: '/msme-registration', icon: 'fas fa-building', title: 'MSME Registration', price: '₹499 — unlock export incentives and subsidies' },
      { route: '/iso/iso-9001-2015', icon: 'fas fa-certificate', title: 'ISO 9001 Certification', price: '₹1,499 — required by many international buyers' },
    ],
  },

  'iso-9001': {
    slug: 'iso-9001',
    name: 'ISO 9001:2015 Certification',
    shortName: 'ISO 9001 Certification',
    price: '₹1,499',
    priceNote: 'Valid for 3 years · Government tenders accepted',
    tagline: 'ISO 9001:2015 Quality Management System certification — required for most government tenders and international buyers.',
    leadComment: 'ISO 9001:2015',
    whatsappText: 'I%20want%20ISO%20certification',
    benefits: [
      { icon: 'fas fa-gavel', title: 'Government Tender Eligibility', desc: 'Most central and state government tenders require ISO 9001. Get certified to qualify for CPWD, Railways, Defence, and PSU tenders.' },
      { icon: 'fas fa-globe', title: 'International Buyer Approval', desc: 'International buyers from Europe, USA, and Middle East require ISO 9001 before placing orders. Required for export market entry.' },
      { icon: 'fas fa-chart-line', title: 'Business Process Improvement', desc: 'ISO 9001 forces documentation of key processes, reducing errors and improving quality consistency across your organisation.' },
      { icon: 'fas fa-handshake', title: 'Customer Confidence', desc: 'The ISO 9001 mark on your letterhead and website signals process discipline and quality commitment to clients and partners.' },
    ],
    process: [
      { title: 'Document Submission', desc: 'Share your business registration proof, letterhead, scope of business, and GST invoice. Everything is handled digitally.' },
      { title: 'Gap Analysis', desc: 'Our team reviews your existing processes and identifies what documentation is needed to meet ISO 9001:2015 requirements.' },
      { title: 'Audit', desc: 'An accredited certifier conducts the audit (typically online). We prepare you for the audit and handle any non-conformities.' },
      { title: 'Certificate Issued', desc: 'Your ISO 9001:2015 certificate is issued, valid for 3 years with annual surveillance audits. Hard copy and soft copy both provided.' },
    ],
    faqs: [
      { question: 'Is ISO 9001 certification mandatory for government tenders?', answer: 'Not legally mandatory in all cases, but most government tenders specifically require ISO 9001. Even where not mandatory, ISO-certified vendors score higher in technical evaluations.' },
      { question: 'How long is an ISO 9001 certificate valid?', answer: 'ISO 9001 certificates are valid for 3 years. Annual surveillance audits are conducted in years 1 and 2, with a full recertification audit in year 3.' },
      { question: 'What documents are required for ISO 9001 certification?', answer: 'Business registration proof (MSME/GST/Incorporation), letterhead, scope of business description, and a GST invoice or sale/purchase bill to verify business activity.' },
      { question: 'Is the ISO 9001 certificate valid across India?', answer: 'Yes. ISO 9001 certification issued by an IAF-accredited certifying body is internationally recognised and valid across all Indian states and government departments.' },
      { question: 'How long does ISO 9001 certification take?', answer: 'Typically 7–15 working days from document submission to certificate issuance, depending on your business complexity and certifier schedule.' },
      { question: 'Can MSMEs get a subsidy on ISO certification cost?', answer: 'Yes. MSME-registered businesses can claim reimbursement on certification costs under the National Programme for Application of Lean Manufacturing (NPLM).' },
    ],
    relatedServices: [
      { route: '/iso', icon: 'fas fa-layer-group', title: 'All ISO Standards', price: 'ISO 14001, 45001, 22000, 27001 and more' },
      { route: '/trademark', icon: 'fas fa-trademark', title: 'Trademark Registration', price: '₹1,499 — protect your brand alongside ISO' },
      { route: '/msme-registration', icon: 'fas fa-building', title: 'MSME Registration', price: '₹499 — get ISO subsidy reimbursement' },
    ],
  },
};

export function getServiceData(slug: string): ServiceConfig | null {
  return SERVICE_DATA[slug as ServiceSlug] ?? null;
}

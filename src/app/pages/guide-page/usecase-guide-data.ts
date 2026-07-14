import { GuidePage } from './guide.model';

// Colony cluster #2 — niche "trademark for X" use-case pages.
// Longer-tail than the money keywords, aimed at specific new-age business types.
// Money-page colony links: /trademark (registration) + /trademark-objection-reply,
// plus utility links to the free search and class-finder tools.

const USECASE_RELATED = [
  { title: 'Trademark Registration', route: '/trademark', icon: 'fas fa-trademark', desc: 'File your brand from ₹1,499' },
  { title: 'Free Trademark Search', route: '/search', icon: 'fas fa-magnifying-glass', desc: 'Check if your name is available' },
  { title: 'All 45 Trademark Classes', route: '/trademark-classes', icon: 'fas fa-list-ol', desc: 'Find the right class for your business' },
  { title: 'Trademark Objection Reply', route: '/trademark-objection-reply', icon: 'fas fa-reply', desc: 'Handle objections from ₹2,999' },
];

export const USECASE_GUIDES: Record<string, GuidePage> = {

  'home-bakery': {
    slug: 'home-bakery',
    title: 'Trademark Registration for a Home Bakery in India',
    category: 'Food & Hospitality',
    metaTitle: 'How to Trademark a Home Bakery Name in India (Class 30) | Trademarx',
    metaDesc: 'Register a trademark for your home bakery brand in India. Class 30 covers baked goods like cakes, cookies and breads. File from ₹1,499 — here is the full step-by-step guide.',
    quickAnswer: 'To protect a home bakery brand in India, file a trademark in Class 30, which covers baked goods such as cakes, pastries, cookies, and bread. If you also run a cafe or serve food on premises, add Class 43. You can register even as a home-based sole proprietor, and filing starts at ₹1,499.',
    highlights: [
      { label: 'Main Class', value: 'Class 30 (baked goods)', icon: 'fas fa-cookie-bite' },
      { label: 'Add if you serve', value: 'Class 43 (cafe service)', icon: 'fas fa-mug-hot' },
      { label: 'Who can apply', value: 'Even a home proprietor', icon: 'fas fa-house' },
      { label: 'Starting cost', value: '₹1,499 per class', icon: 'fas fa-indian-rupee-sign' },
    ],
    intro: 'Home bakeries have exploded across India — from Instagram cake studios to weekend cookie brands. But a catchy bakery name has no legal protection until you trademark it. This guide explains which class you need, what you can protect, and exactly how to register your home bakery brand.',
    sections: [
      {
        heading: 'Why a home bakery needs a trademark',
        body: 'Your bakery\'s name and logo are what customers remember and recommend — and on platforms like Instagram, they are easy to copy. Without a trademark, anyone can open a bakery with your name, and you would have little legal recourse. India follows a "first to file" system, so a competitor (or even a former collaborator) could register your name first and force you to rebrand. A registered trademark gives you exclusive nationwide rights to your bakery brand, lets you use the ™ symbol immediately and ® once registered, and is often required to sell on quick-commerce and food-delivery platforms under your own brand.',
      },
      {
        heading: 'Which trademark class for a home bakery?',
        body: 'The primary class is Class 30, which covers coffee, flour and cereal preparations, bread, pastry, and confectionery — in other words, the cakes, cookies, brownies, and breads you sell as products. If you also operate as a cafe or provide catering and on-premises food service, you should additionally file in Class 43 (services for providing food and drink). Some bakeries selling chocolates or sugar confectionery also consider Class 30 sub-categories. For most home bakers selling packaged baked goods, Class 30 alone is the essential filing; add Class 43 only if you serve or cater.',
      },
      {
        heading: 'How to register — step by step',
        body: 'First, run a trademark search to confirm your bakery name is available in Class 30 and not deceptively similar to an existing food brand. Next, prepare your documents: identity and address proof, and a logo file if you are filing a logo mark. Then file Form TM-A online through the IP India portal in Class 30 (a sole proprietor can file in their own name). Pay the government fee — ₹4,500 per class for individuals, startups, and small enterprises. You receive a TM application number the same day and can start using ™. The application then goes through formality check, examination, and journal publication before registration.',
        bullets: [
          'Do a free trademark search in Class 30 first',
          'Keep identity/address proof and your logo ready',
          'File Form TM-A online in Class 30 (add Class 43 if you serve food)',
          'Government fee ₹4,500/class for individuals & small enterprises',
          'Start using ™ the day you file',
        ],
      },
      {
        heading: 'Common mistakes to avoid',
        body: 'The biggest mistake is choosing a descriptive name like "Fresh Cakes" or "Best Bakery", which examiners often object to under Section 9 for lacking distinctiveness. Invented or arbitrary names register far more easily. The second mistake is skipping the search and filing a name that clashes with an existing mark, leading to a Section 11 objection. Third, many home bakers file only a logo and leave the name itself unprotected — filing the name as a wordmark gives broader protection. Finally, do not wait until you are "big enough": filing early secures your priority date and costs the same as filing later.',
      },
    ],
    verdict: 'For a home bakery, a trademark in Class 30 protects your baked-goods brand across India — add Class 43 if you serve or cater. You can file as a home-based proprietor from ₹1,499, get your ™ the same day, and lock in your name before a copycat does. Start with a quick search, then file.',
    faqs: [
      { question: 'Which trademark class is for a home bakery in India?', answer: 'Class 30 is the primary class — it covers baked goods like cakes, pastries, cookies, and bread. If you also run a cafe, provide catering, or serve food on premises, add Class 43 (food and drink services).' },
      { question: 'Can I trademark my home bakery if I run it from home?', answer: 'Yes. There is no requirement to have a shop or company. A sole proprietor can file a trademark in their own name using identity and address proof. Home-based and Instagram bakeries can and should register their brand.' },
      { question: 'How much does it cost to trademark a bakery name?', answer: 'Government fees are ₹4,500 per class for individuals, startups, and small enterprises. Professional filing services typically start around ₹1,499 plus government fees. Filing in one class (Class 30) is enough for most home bakeries selling products.' },
      { question: 'Do I need FSSAI before trademarking my bakery?', answer: 'No — trademark registration and FSSAI licensing are separate. You can file a trademark without an FSSAI licence, though as a food business you will need FSSAI registration to operate legally. The two are obtained independently.' },
    ],
    relatedLinks: USECASE_RELATED,
    ctaHeading: 'Protect Your Home Bakery Brand Today',
    ctaText: 'Our IP team runs a free Class 30 search and files your bakery trademark end-to-end — so your name is legally yours before anyone copies it. From ₹1,499.',
    leadComment: 'Use-case page inquiry - Home Bakery trademark',
  },

  'instagram-page': {
    slug: 'instagram-page',
    title: 'Trademark Registration for an Instagram Page or Handle',
    category: 'Creators & Digital',
    metaTitle: 'How to Trademark an Instagram Page / Handle Name in India | Trademarx',
    metaDesc: 'Protect your Instagram page name and handle in India with a trademark. Class 35 covers online promotion and influencer services. Learn the right class and how to file.',
    quickAnswer: 'To protect an Instagram page name or handle in India, file a trademark in Class 35 (advertising, online promotion, and influencer/marketing services) if you monetise the page, plus the class of any products you sell through it. Content-focused pages may also use Class 41. You can register the name as a wordmark from ₹1,499.',
    highlights: [
      { label: 'Main Class', value: 'Class 35 (promotion)', icon: 'fas fa-bullhorn' },
      { label: 'Content pages', value: 'Class 41 (entertainment)', icon: 'fas fa-photo-film' },
      { label: 'Selling products?', value: 'Add your product class', icon: 'fas fa-bag-shopping' },
      { label: 'Starting cost', value: '₹1,499 per class', icon: 'fas fa-indian-rupee-sign' },
    ],
    intro: 'Your Instagram handle is your brand — but Instagram does not give you legal ownership of the name. Anyone can register a similar handle or launch a business under your page name. Trademarking it gives you real, enforceable rights. Here is how to protect an Instagram page name in India and which class to file.',
    sections: [
      {
        heading: 'Why trademark your Instagram page name?',
        body: 'A large following is a business asset, and the name behind it is worth protecting. Instagram\'s own terms do not grant you trademark rights, and its impersonation and brand-protection tools work far better when you actually own a registered trademark. Without one, a copycat can open "@yourname_official", a competitor can launch a company using your page name, or someone could even register your name as a trademark first and challenge you. A registered mark lets you enforce your name, support takedowns and Meta brand registrations, and safely expand into merchandise, courses, or collaborations under your brand.',
      },
      {
        heading: 'Which class for an Instagram page?',
        body: 'It depends on how you use the page. If you monetise through promotions, brand deals, affiliate marketing, or run it as a marketing/influencer business, Class 35 (advertising and business promotion, including online marketing services) is the core class. If the page is primarily about creating entertainment or educational content — reels, tutorials, shows — Class 41 (entertainment and education services) fits. And if you sell physical products through the page (clothing, cosmetics, food), you must also file in the class of those goods (e.g., Class 25 for apparel, Class 3 for cosmetics). Many creators file Class 35 plus one product/content class.',
      },
      {
        heading: 'How to register your page name',
        body: 'Start with a trademark search on your page name to check availability in the relevant classes. Decide whether to file the name (wordmark — broadest protection) and/or your logo. File Form TM-A online through IP India in your chosen class(es); you can file in your personal name as a sole proprietor. Government fees are ₹4,500 per class for individuals and small enterprises. You get a TM number the same day and can add ™ to your handle and content immediately. The application then proceeds through examination and publication toward registration.',
        bullets: [
          'Search your handle/name in Class 35 (and any product class)',
          'File the name as a wordmark for the broadest protection',
          'File online via IP India — personal name is fine',
          'Government fee ₹4,500/class for individuals & small enterprises',
          'Use ™ on your handle from day one',
        ],
      },
      {
        heading: 'Common mistakes to avoid',
        body: 'Avoid purely descriptive or generic handle names (like "@fitnesstips"), which are hard to register and hard to enforce. Do not rely on Instagram verification or a registered domain as "protection" — neither is a trademark. If you sell products, do not file only Class 35 and leave the goods unprotected. And do not delay: as your following grows, your name becomes a bigger target, and India\'s first-to-file rule rewards whoever registers first.',
      },
    ],
    verdict: 'An Instagram handle is a brand asset with zero legal protection until you trademark it. File the name in Class 35 if you monetise the page (add Class 41 for content, or your product class if you sell), get your ™ the same day, and stop copycats before they cost you. From ₹1,499.',
    faqs: [
      { question: 'Can I trademark my Instagram page name in India?', answer: 'Yes. You can register your page name or handle as a trademark — typically in Class 35 if you monetise through promotion and marketing, Class 41 for content, and your product class if you sell goods. Filing the name as a wordmark gives the broadest protection.' },
      { question: 'Which class is for an Instagram influencer page?', answer: 'Class 35 is the core class for advertising, brand promotion, and influencer/marketing services. If your page focuses on entertainment or educational content, Class 41 also applies. Sell products too? Add the class of those goods.' },
      { question: 'Does being verified on Instagram protect my brand name?', answer: 'No. Instagram verification and a registered handle do not give you legal ownership of the name. Only a trademark registration provides enforceable rights and makes Meta\'s brand-protection and impersonation tools far more effective.' },
      { question: 'Can I register my Instagram name if I am not a company?', answer: 'Yes. A sole proprietor can file a trademark in their personal name using identity and address proof. You do not need a registered company to protect your page name.' },
    ],
    relatedLinks: USECASE_RELATED,
    ctaHeading: 'Own Your Instagram Brand — Legally',
    ctaText: 'Our IP experts find the right class for your page and register your handle as a trademark, so no one can ride on your name. Free search, filing from ₹1,499.',
    leadComment: 'Use-case page inquiry - Instagram page trademark',
  },

  'podcast': {
    slug: 'podcast',
    title: 'Trademark Registration for a Podcast in India',
    category: 'Creators & Digital',
    metaTitle: 'How to Trademark a Podcast Name in India (Class 41) | Trademarx',
    metaDesc: 'Protect your podcast name and logo in India with a trademark. Class 41 covers entertainment and audio content production. Learn the right class and how to register.',
    quickAnswer: 'To protect a podcast name in India, file a trademark in Class 41, which covers entertainment services and the production of audio and video content. If you stream or broadcast, Class 38 may also apply, and Class 9 for downloadable recordings. You can register the name and logo from ₹1,499.',
    highlights: [
      { label: 'Main Class', value: 'Class 41 (entertainment)', icon: 'fas fa-microphone-lines' },
      { label: 'Streaming/broadcast', value: 'Class 38', icon: 'fas fa-tower-broadcast' },
      { label: 'Downloadable episodes', value: 'Class 9', icon: 'fas fa-download' },
      { label: 'Starting cost', value: '₹1,499 per class', icon: 'fas fa-indian-rupee-sign' },
    ],
    intro: 'A podcast lives or dies by its name and identity. As podcasts multiply across Spotify, YouTube, and Apple Podcasts, name clashes and copycats are increasingly common. Trademarking your podcast protects the brand you are building. Here is which class to file and how to register a podcast name in India.',
    sections: [
      {
        heading: 'Why trademark your podcast?',
        body: 'Your podcast name is the anchor of your brand — it appears on every platform, thumbnail, and promotion. Without a trademark, another creator can launch a show with the same or a similar name, and platforms have limited ability to help you without proof of ownership. A registered trademark gives you exclusive rights to the podcast name, supports takedowns of imitators, and becomes essential the moment your show grows into merchandise, live events, sponsorships, or a network. It also protects the value of the brand if you later sell or license the show.',
      },
      {
        heading: 'Which class for a podcast?',
        body: 'The primary class is Class 41, which covers entertainment services, and the production and presentation of audio/audio-visual content — squarely covering a podcast. If your podcast involves streaming or broadcasting infrastructure, Class 38 (telecommunications and broadcasting) can be relevant. If you distribute downloadable recordings or an app, Class 9 (downloadable media and software) may apply. And if you monetise heavily through advertising and sponsorships as a business, Class 35 can be added. For most independent podcasters, Class 41 is the essential filing, with others added based on how you distribute and monetise.',
      },
      {
        heading: 'How to register your podcast name',
        body: 'Begin with a trademark search to confirm your podcast name is available in Class 41 and not similar to an existing show or media brand. Decide whether to file the name (wordmark) and/or your cover-art logo. File Form TM-A online through the IP India portal in Class 41; individual creators can file in their own name. Government fees are ₹4,500 per class for individuals and small enterprises. You receive a TM number the same day and can start using ™ alongside your show name. Examination and journal publication follow before final registration.',
        bullets: [
          'Search your show name in Class 41 first',
          'File the name as a wordmark for broadest protection',
          'Add Class 38 / 9 / 35 based on distribution and monetisation',
          'Government fee ₹4,500/class for individuals & small enterprises',
          'Start using ™ on your show immediately',
        ],
      },
      {
        heading: 'Common mistakes to avoid',
        body: 'Descriptive podcast names (like "The Business Podcast") are difficult to register and enforce — distinctive, coined names fare much better. Do not assume that being live on Spotify or Apple gives you legal rights; it does not. Avoid filing only your logo while leaving the show name unprotected. And file early — as your download numbers climb, the name becomes a more attractive target for imitators, and first-to-file governs in India.',
      },
    ],
    verdict: 'For a podcast, Class 41 protects your show\'s name and identity as entertainment content — add Class 38, 9, or 35 depending on how you distribute and monetise. File the name as a wordmark, claim your ™ the same day, and secure the brand before your show blows up. From ₹1,499.',
    faqs: [
      { question: 'Which trademark class is for a podcast in India?', answer: 'Class 41 is the primary class — it covers entertainment services and the production of audio and audio-visual content. Depending on your setup, you may also file Class 38 (broadcasting/streaming), Class 9 (downloadable recordings), or Class 35 (advertising/sponsorship business).' },
      { question: 'Can I trademark my podcast name before it becomes popular?', answer: 'Yes, and it is smart to do so. Filing early secures your priority date under India\'s first-to-file system and costs the same as filing later. You get your TM number and the right to use ™ the day you file.' },
      { question: 'Does publishing on Spotify or Apple Podcasts protect my name?', answer: 'No. Being listed on a platform does not give you trademark rights. Only a registered trademark provides enforceable ownership of your podcast name and helps you act against copycats.' },
      { question: 'Should I trademark the podcast name or the logo?', answer: 'Ideally both, but if you file one, the name as a wordmark gives broader protection because it covers the name in any style. A logo (device) mark protects mainly the specific cover-art design.' },
    ],
    relatedLinks: USECASE_RELATED,
    ctaHeading: 'Trademark Your Podcast Before It Blows Up',
    ctaText: 'Our IP team searches and files your podcast name in the right class so the brand stays yours across every platform. Free search, filing from ₹1,499.',
    leadComment: 'Use-case page inquiry - Podcast trademark',
  },

  'mobile-app': {
    slug: 'mobile-app',
    title: 'Trademark Registration for a Mobile App in India',
    category: 'Creators & Digital',
    metaTitle: 'How to Trademark a Mobile App Name in India (Class 9 & 42) | Trademarx',
    metaDesc: 'Protect your mobile app name and logo in India. Class 9 covers downloadable software and Class 42 covers SaaS. Learn which classes an app needs and how to register.',
    quickAnswer: 'To protect a mobile app in India, file a trademark in Class 9 (downloadable software / mobile applications) and usually Class 42 (software-as-a-service and app development). Depending on what the app does, add the class of that service — e.g. Class 36 for fintech, Class 35 for marketplaces. Filing starts at ₹1,499 per class.',
    highlights: [
      { label: 'Core classes', value: 'Class 9 + Class 42', icon: 'fas fa-mobile-screen' },
      { label: 'Fintech app', value: 'Add Class 36', icon: 'fas fa-indian-rupee-sign' },
      { label: 'Marketplace app', value: 'Add Class 35', icon: 'fas fa-store' },
      { label: 'Starting cost', value: '₹1,499 per class', icon: 'fas fa-tags' },
    ],
    intro: 'Your app\'s name is its identity on the App Store and Play Store — and app names get copied and squatted constantly. A trademark gives you the legal right to your app name, supports store takedowns of clones, and is expected by investors during due diligence. Here is which classes a mobile app needs and how to register.',
    sections: [
      {
        heading: 'Why trademark a mobile app name?',
        body: 'App stores are crowded, and clone apps riding on a popular name are a real problem. Google Play and Apple both handle trademark-based complaints far more decisively when you hold a registered mark. Beyond takedowns, a trademark protects your brand as you scale across platforms and markets, is a standard item in investor and acquirer due diligence, and prevents a competitor from registering your app name first. For a startup, the app name is often the most valuable brand asset — and it is unprotected until you file.',
      },
      {
        heading: 'Which classes does an app need?',
        body: 'Two classes form the core. Class 9 covers downloadable software and mobile applications — the app itself as a product. Class 42 covers software-as-a-service (SaaS), platform services, and software design and development — the ongoing service your app provides. Most apps file both. On top of that, you add the class matching your app\'s actual function: Class 36 for fintech, payments, and insurance apps; Class 35 for e-commerce marketplaces and advertising; Class 38 for messaging/communication; Class 41 for gaming, education, or streaming; Class 44 for health apps. So a typical filing is Class 9 + Class 42 + one function-specific class.',
      },
      {
        heading: 'How to register your app name',
        body: 'Run a trademark search on your app name across Class 9 and Class 42 (and your function class) to check availability. Decide whether to file the name (wordmark) and/or your app icon/logo. File Form TM-A online through IP India in the chosen classes; a startup can file in the company name or founder\'s name. Government fees are ₹4,500 per class for individuals, startups, and small enterprises, or ₹9,000 for larger companies. You get a TM number the same day and can use ™. The application then proceeds through examination and publication.',
        bullets: [
          'Search the name in Class 9 and Class 42 first',
          'File the name as a wordmark plus your app icon if distinctive',
          'Add a function class (36 fintech, 35 marketplace, 41 gaming, etc.)',
          'Government fee ₹4,500/class for startups & small enterprises',
          'Claim your ™ on the store listing immediately',
        ],
      },
      {
        heading: 'Common mistakes to avoid',
        body: 'The most common error is filing only Class 9 and forgetting Class 42, leaving your SaaS/service side exposed. Another is choosing a descriptive name (like "PayFast" for a payments app) that draws Section 9 objections. Startups also often delay filing until a funding round, by which point a squatter may have registered the name. And do not overlook the function class — a fintech app that files only Class 9/42 but not Class 36 leaves its core service unprotected.',
      },
    ],
    verdict: 'A mobile app needs Class 9 (the downloadable app) and Class 42 (the SaaS/service), plus a function-specific class like 36 or 35. File the name as a wordmark, secure your ™ on day one, and lock the brand before a clone or squatter does. Filing starts at ₹1,499 per class.',
    faqs: [
      { question: 'Which trademark class is for a mobile app in India?', answer: 'The core classes are Class 9 (downloadable software and mobile applications) and Class 42 (software-as-a-service, platforms, and software development). Most apps file both, then add a function class — such as Class 36 for fintech or Class 35 for marketplaces.' },
      { question: 'Do I need to trademark both the app name and logo?', answer: 'Ideally yes. The name as a wordmark gives the broadest protection because it covers the name in any style. The app icon/logo can be filed as a separate device mark to protect the specific design. Many startups file both.' },
      { question: 'Can a startup trademark an app before launch?', answer: 'Yes. You can file on an intent-to-use basis before launch, which secures your priority date early under India\'s first-to-file system. Filing before or at launch is strongly recommended so a squatter cannot register your name first.' },
      { question: 'How much does it cost to trademark an app in India?', answer: 'Government fees are ₹4,500 per class for individuals, startups, and small enterprises (₹9,000 for larger companies). Since apps typically file two or more classes, budget accordingly. Professional filing services start around ₹1,499 per class plus government fees.' },
    ],
    relatedLinks: USECASE_RELATED,
    ctaHeading: 'Protect Your App Name Across Every Store',
    ctaText: 'Our IP team maps the right classes for your app (9, 42, and your function class) and files it correctly — investor-ready protection from ₹1,499 per class.',
    leadComment: 'Use-case page inquiry - Mobile App trademark',
  },

  'ngo': {
    slug: 'ngo',
    title: 'Trademark Registration for an NGO or Trust in India',
    category: 'Organisations',
    metaTitle: 'How to Trademark an NGO / Trust Name in India | Trademarx',
    metaDesc: 'Protect your NGO, trust, or society name and logo in India with a trademark. Class 45, 36 and 41 commonly apply. Learn which class fits your cause and how to register.',
    quickAnswer: 'An NGO, trust, or society can and should trademark its name and logo in India. The relevant class depends on activity: Class 45 for social and charitable services, Class 36 for fundraising and donations, and Class 41 for education and awareness programmes. Registration protects your reputation and donor trust — filing from ₹1,499.',
    highlights: [
      { label: 'Charitable services', value: 'Class 45', icon: 'fas fa-hands-holding-circle' },
      { label: 'Fundraising/donations', value: 'Class 36', icon: 'fas fa-hand-holding-heart' },
      { label: 'Education/awareness', value: 'Class 41', icon: 'fas fa-graduation-cap' },
      { label: 'Starting cost', value: '₹1,499 per class', icon: 'fas fa-indian-rupee-sign' },
    ],
    intro: 'An NGO\'s name and logo carry its reputation and donor trust — and are surprisingly easy to misuse. Fake outfits collecting donations under a well-known NGO\'s name is a real risk. A trademark gives your organisation exclusive rights to its identity. Here is which class an NGO or trust should file and how to register.',
    sections: [
      {
        heading: 'Why an NGO or trust needs a trademark',
        body: 'For a non-profit, credibility is everything — and your name and logo are what donors, grant-makers, and beneficiaries recognise and trust. Registration under the Societies, Trusts, or Section 8 framework establishes your legal entity, but it does not stop others from using a similar name to solicit donations or run programmes. A trademark does. It gives you exclusive nationwide rights to your name and logo for your activities, lets you act against impersonators misusing your identity, and reassures institutional donors and CSR partners during due diligence. It also protects the brand as you expand to new regions or causes.',
      },
      {
        heading: 'Which class for an NGO or trust?',
        body: 'It depends on what your organisation does. Class 45 covers personal and social services rendered to meet the needs of individuals — the natural home for many charitable and social-welfare NGOs. Class 36 covers financial services including charitable fundraising and the collection of donations, relevant if fundraising is central to your work. Class 41 covers education, training, and awareness/cultural programmes, fitting NGOs focused on education, skilling, or awareness campaigns. Health-focused organisations may use Class 44, and environmental or research bodies Class 42. Many NGOs file the class that best matches their primary activity, adding others (like Class 36 for fundraising) as needed.',
      },
      {
        heading: 'How to register your NGO name',
        body: 'Start with a trademark search on your organisation\'s name and logo in the relevant class to check availability. The application is usually filed in the name of the registered entity (the trust, society, or Section 8 company) with its authorised signatory. File Form TM-A online through IP India; a trust or Section 8 company generally qualifies for the concessional fee of ₹4,500 per class. You receive a TM number the same day and can use ™ on your materials. The application then goes through examination and journal publication before registration.',
        bullets: [
          'Search your NGO name and logo in the relevant class',
          'File in the name of the registered trust/society/Section 8 company',
          'Choose the class matching your activity (45 / 36 / 41)',
          'Concessional government fee ₹4,500/class for eligible entities',
          'Use ™ on your branding and donation materials immediately',
        ],
      },
      {
        heading: 'Common mistakes to avoid',
        body: 'A frequent mistake is assuming that registering the trust or society name protects it as a brand — it does not, and similar names can exist. Another is picking a generic, cause-descriptive name that is hard to register or enforce. NGOs also sometimes file only the logo, leaving the name unprotected. Finally, do not treat trademarking as unnecessary for a non-profit: donor-facing reputation makes NGOs prime targets for name misuse, and a registered mark is your strongest protection.',
      },
    ],
    verdict: 'An NGO or trust should trademark its name and logo to protect donor trust and stop impersonators. Choose the class that matches your work — Class 45 for social services, Class 36 for fundraising, Class 41 for education — file in the entity\'s name, and claim your ™ the same day. From ₹1,499.',
    faqs: [
      { question: 'Can an NGO or trust register a trademark in India?', answer: 'Yes. A trust, society, or Section 8 company can file a trademark in the name of the registered entity. Non-profits should protect their name and logo just as businesses do — arguably more, given the reputational risk of name misuse.' },
      { question: 'Which trademark class is for an NGO?', answer: 'It depends on activity: Class 45 for social and charitable services, Class 36 for fundraising and collection of donations, and Class 41 for education and awareness programmes. Health NGOs may use Class 44. Many file the class matching their primary work and add others as needed.' },
      { question: 'Does registering my trust or society protect the name?', answer: 'No. Entity registration establishes your legal status but does not give exclusive brand rights — similar names can exist. Only a trademark gives you the exclusive right to your name and logo and the ability to stop impersonators.' },
      { question: 'Is there a fee concession for NGOs filing a trademark?', answer: 'The reduced government fee of ₹4,500 per class applies to individuals, startups, and small enterprises. Trusts and Section 8 companies generally qualify for the concessional rate; the exact eligibility should be confirmed at filing based on the entity type and documents.' },
    ],
    relatedLinks: USECASE_RELATED,
    ctaHeading: 'Protect Your NGO\'s Name and Reputation',
    ctaText: 'Our IP team helps your trust or NGO pick the right class and register its name and logo — safeguarding donor trust from misuse. Free search, filing from ₹1,499.',
    leadComment: 'Use-case page inquiry - NGO / Trust trademark',
  },

  'youtube-channel': {
    slug: 'youtube-channel',
    title: 'Trademark Registration for a YouTube Channel in India',
    category: 'Creators & Digital',
    metaTitle: 'How to Trademark a YouTube Channel Name in India (Class 41 & 35) | Trademarx',
    metaDesc: 'Protect your YouTube channel name and logo in India with a trademark. Class 41 covers content and entertainment; Class 35 covers advertising and brand deals. Full guide.',
    quickAnswer: 'To protect a YouTube channel name in India, file a trademark in Class 41 (entertainment and educational content) and, if you monetise through ads, sponsorships, or brand deals, add Class 35 (advertising and business promotion). Sell merchandise? Add that product class too. You can register the name and logo from ₹1,499.',
    highlights: [
      { label: 'Main Class', value: 'Class 41 (content)', icon: 'fas fa-play' },
      { label: 'Monetised channel', value: 'Add Class 35', icon: 'fas fa-bullhorn' },
      { label: 'Merch?', value: 'Add your product class', icon: 'fas fa-shirt' },
      { label: 'Starting cost', value: '₹1,499 per class', icon: 'fas fa-indian-rupee-sign' },
    ],
    intro: 'Your YouTube channel name is your brand across thumbnails, socials, and sponsorships — and it is easy for others to imitate. YouTube alone does not give you legal ownership of the name. Trademarking it gives you enforceable rights and supports YouTube\'s own copyright/impersonation tools. Here is which class you need and how to register.',
    sections: [
      {
        heading: 'Why trademark your YouTube channel?',
        body: 'A channel name is a genuine business asset once you have an audience and revenue. Without a trademark, another creator can launch a similar-named channel, a business can adopt your name, or someone can register it as a trademark first. A registered mark gives you exclusive rights to the channel name, strengthens impersonation and brand-protection claims with YouTube and Meta, and becomes essential as you expand into merchandise, courses, events, or a media company. It also protects the brand\'s value if you take on sponsors, sign with a network, or sell the channel later.',
      },
      {
        heading: 'Which class for a YouTube channel?',
        body: 'The primary class is Class 41, which covers entertainment and educational services and the production of video content — exactly what a channel produces. If your channel is monetised through advertising, sponsorships, affiliate deals, or influencer marketing, add Class 35 (advertising and business promotion). If you sell branded merchandise — apparel, mugs, accessories — you also need the class of those goods (e.g., Class 25 for clothing). A typical creator filing is Class 41 for the content plus Class 35 for the monetisation/brand side.',
      },
      {
        heading: 'How to register your channel name',
        body: 'Search your channel name in Class 41 (and Class 35) to confirm it is available and not similar to an existing media brand. Decide whether to file the name (wordmark) and/or your logo/channel art. File Form TM-A online through the IP India portal in the chosen class(es); individual creators can file in their own name. Government fees are ₹4,500 per class for individuals and small enterprises. You receive a TM number the same day and can use ™ on your channel and socials. Examination and journal publication follow before registration.',
        bullets: [
          'Search your channel name in Class 41 (and Class 35)',
          'File the name as a wordmark for broadest protection',
          'Add Class 35 if monetised; add a product class for merch',
          'Government fee ₹4,500/class for individuals & small enterprises',
          'Use ™ on your channel and socials immediately',
        ],
      },
      {
        heading: 'Common mistakes to avoid',
        body: 'Descriptive channel names (like "Tech Reviews") are hard to register and enforce — distinctive names are far stronger. Do not assume a large subscriber count or YouTube verification protects the name; it does not. Avoid filing only the logo and leaving the name unprotected, and do not forget Class 35 if you monetise. As with all marks in India, file early — first-to-file means whoever registers first generally wins.',
      },
    ],
    verdict: 'For a YouTube channel, Class 41 protects your content brand and Class 35 covers the monetisation side — add a product class for merch. File the channel name as a wordmark, claim your ™ the same day, and secure the brand before a copycat or squatter beats you to it. From ₹1,499.',
    faqs: [
      { question: 'Which trademark class is for a YouTube channel in India?', answer: 'Class 41 is the primary class — it covers entertainment and educational content and video production. If you monetise through ads, sponsorships, or brand deals, add Class 35 (advertising and business promotion). Selling merchandise? Add the class for those goods too.' },
      { question: 'Can I trademark my YouTube channel name?', answer: 'Yes. You can register your channel name as a trademark, ideally as a wordmark for the broadest protection, plus your logo as a device mark. Individual creators can file in their own name using identity and address proof.' },
      { question: 'Does YouTube protect my channel name legally?', answer: 'No. YouTube does not give you trademark rights in your channel name. A registered trademark provides enforceable ownership and makes YouTube\'s impersonation and brand-protection tools much more effective.' },
      { question: 'When should I trademark my YouTube channel?', answer: 'As early as possible. Filing secures your priority date under India\'s first-to-file system and costs the same as filing later. You get your TM number and the right to use ™ the day you file.' },
    ],
    relatedLinks: USECASE_RELATED,
    ctaHeading: 'Own Your YouTube Brand — Legally',
    ctaText: 'Our IP team finds the right classes for your channel and registers the name and logo, so no one can ride on your brand. Free search, filing from ₹1,499.',
    leadComment: 'Use-case page inquiry - YouTube channel trademark',
  },

};

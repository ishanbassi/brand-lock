export interface IndustryData {
  slug: string;
  name: string;
  displayName: string;
  classes: { num: number; name: string; why: string }[];
  context: string;
  examples: string[];
  whyMatters: string;
  faqs: { question: string; answer: string }[];
}

export const INDUSTRY_DATA: Record<string, IndustryData> = {
  'textile-garments': {
    slug: 'textile-garments',
    name: 'Textile & Garments',
    displayName: 'Textile & Garments Business',
    context: 'India\'s textile industry is the world\'s second-largest and highly competitive. Brand copying in clothing, fabric, and garment exports is rampant — both domestically and in export markets in the US, UK, and Middle East.',
    whyMatters: 'Textile and garment brands in India face copying by competitors who produce identical designs and sell under similar names at lower prices. A registered trademark gives you the legal right to stop them.',
    examples: ['Ethnic wear brands', 'Export-oriented garment manufacturers', 'Home textile brands', 'Fabric and yarn businesses', 'Saree and kurta brands'],
    classes: [
      { num: 24, name: 'Textiles & Fabrics', why: 'Covers fabrics, bed linen, table linen, and household textile articles — the core class for fabric manufacturers and home textile brands.' },
      { num: 25, name: 'Clothing & Footwear', why: 'Covers all clothing, garments, and fashion accessories — essential for any clothing brand, ethnic wear label, or garment exporter.' },
      { num: 35, name: 'Retail & Business Services', why: 'Covers retail stores and e-commerce platforms selling textile and clothing products — essential if you sell through branded stores or online.' },
    ],
    faqs: [
      { question: 'Which trademark class should a garment brand file in?', answer: 'Class 25 (Clothing & Footwear) is the primary class. If you also sell home textiles, add Class 24. If you run a retail store or sell online, add Class 35.' },
      { question: 'Can I protect a saree or kurta design as a trademark?', answer: 'You can register the brand name and logo as a trademark. For the design itself, a design registration under the Designs Act 2000 is more appropriate. Both protections work together.' },
      { question: 'I export textiles — do I need a trademark in India?', answer: 'Yes. Indian trademark registration protects you in India. For protection in export markets (USA, UK, EU), you need separate registrations in those countries. Start with India, then file internationally.' },
      { question: 'What if a competitor is copying my brand name in textiles?', answer: 'With a registered trademark, you can send a cease-and-desist notice, file a civil suit, and take criminal action. Without registration, stopping a copycat is much harder and more expensive.' },
    ],
  },

  pharmaceutical: {
    slug: 'pharmaceutical',
    name: 'Pharmaceutical',
    displayName: 'Pharmaceutical Business',
    context: 'India is the world\'s pharmacy, producing 20% of global generic medicines. The pharma industry is highly regulated with IP rights central to product protection. Brand names in pharma are business-critical assets.',
    whyMatters: 'Pharmaceutical brand names are among the most copied in India. Counterfeit medicines and passing-off by generic manufacturers with similar names are major risks. Trademark registration is the first line of legal defence.',
    examples: ['Generic drug manufacturers', 'Ayurvedic/herbal product companies', 'Medical device manufacturers', 'Nutraceutical brands', 'Hospital chains and diagnostic labs'],
    classes: [
      { num: 5, name: 'Pharmaceuticals', why: 'The primary class for medicines, dietary supplements, veterinary products, and sanitary preparations — mandatory for any pharma brand.' },
      { num: 10, name: 'Medical Devices', why: 'Covers surgical instruments, medical devices, and orthopaedic articles — essential for medical device manufacturers and distributors.' },
      { num: 44, name: 'Medical & Veterinary Services', why: 'Covers hospital chains, diagnostic labs, veterinary services, and healthcare services — required for service-based healthcare businesses.' },
    ],
    faqs: [
      { question: 'Can a drug name be trademarked in India?', answer: 'Yes, brand names for drugs can be trademarked in Class 5. However, generic names (INN - International Nonproprietary Names) cannot be trademarked. You trademark the brand name, not the molecule name.' },
      { question: 'Do I need trademark registration for an Ayurvedic product brand?', answer: 'Absolutely. Ayurvedic and herbal product brands are among the most copied in India. Class 5 covers pharmaceutical and herbal preparations. File as soon as your brand has market presence.' },
      { question: 'Is a pharma trademark valid across all states in India?', answer: 'Yes. A trademark registered with IP India is valid across all 28 states and 8 union territories. One national registration covers the entire country.' },
      { question: 'What trademark class for a diagnostic lab or hospital chain?', answer: 'Class 44 covers medical and healthcare services. If you also sell medicines or health products, add Class 5. Hospital chains should file in both Class 44 and Class 35 (for business services).' },
    ],
  },

  'information-technology': {
    slug: 'information-technology',
    name: 'Information Technology',
    displayName: 'IT & Software Business',
    context: 'India\'s IT sector is the world\'s largest technology services exporter. From SaaS startups in Bangalore to IT services giants, every tech company needs trademark protection for its brand, product names, and software.',
    whyMatters: 'Tech brand names are copied within weeks of a product going viral. Domain squatters, app store impersonators, and competitors with similar names can destroy years of brand building. Early trademark registration is non-negotiable.',
    examples: ['SaaS product companies', 'IT services and consulting firms', 'Mobile app developers', 'E-commerce technology platforms', 'AI and machine learning startups'],
    classes: [
      { num: 9, name: 'Electronics & Software', why: 'Covers software products, apps, electronic goods, and computer hardware — the primary class for any tech product, SaaS tool, or app.' },
      { num: 42, name: 'Technology & IT Services', why: 'Covers software development services, IT consulting, SaaS, cloud services, and cybersecurity — essential for IT service companies and software agencies.' },
      { num: 35, name: 'Business & Retail Services', why: 'Covers e-commerce platforms, business management software, and digital marketing services — important for tech companies with a B2B service component.' },
    ],
    faqs: [
      { question: 'Which trademark class should a SaaS company file in?', answer: 'File in Class 42 (IT services, SaaS, cloud services) for your service offering. If you also distribute software products, add Class 9. If you provide business tools, consider Class 35 as well.' },
      { question: 'Can I trademark a mobile app name in India?', answer: 'Yes. App names are registered in Class 9 (software, electronic goods) and Class 42 (software development services). File early — app names are frequently copied by impersonators on Play Store and App Store.' },
      { question: 'Does registering a domain name protect my brand?', answer: 'No. Domain registration gives you no trademark rights. You can hold a domain while a competitor registers the same name as a trademark and forces you to stop using it. Trademark registration is the only real protection.' },
      { question: 'I have an AI startup — what trademark class applies?', answer: 'Class 42 covers AI services, machine learning platforms, and data analytics. If you\'re selling AI software products, add Class 9. For AI-powered business process tools, consider Class 35.' },
    ],
  },

  'food-beverage': {
    slug: 'food-beverage',
    name: 'Food & Beverage',
    displayName: 'Food & Beverage Business',
    context: 'India\'s food and beverage sector is a ₹75 lakh crore industry with intense competition in packaged foods, beverages, restaurants, and food exports. Brand names are copied aggressively in this market.',
    whyMatters: 'Food brand names are among the most counterfeited in India. Packaged food products, spice brands, and beverages sold under similar names are a common problem. Trademark registration protects your revenue and consumer trust.',
    examples: ['Packaged food brands', 'Beverage companies', 'Restaurant chains', 'Spice and condiment brands', 'Food export businesses'],
    classes: [
      { num: 30, name: 'Food — Staples', why: 'Covers coffee, tea, sugar, rice, flour, bread, biscuits, spices, sauces, and most packaged food products — the primary class for food brands.' },
      { num: 29, name: 'Food — Animal Products', why: 'Covers meat, fish, dairy, eggs, processed vegetables, and cooking oils — essential for dairy brands, meat processors, and FMCG food companies.' },
      { num: 32, name: 'Beverages (Non-Alcoholic)', why: 'Covers water, juices, soft drinks, and energy drinks — mandatory for beverage brands in the non-alcoholic category.' },
      { num: 43, name: 'Food & Hospitality Services', why: 'Covers restaurants, cafes, food delivery services, and catering — essential for restaurant chains and cloud kitchen brands.' },
    ],
    faqs: [
      { question: 'Which trademark class for a packaged food brand?', answer: 'Class 30 covers most packaged foods including spices, sauces, snacks, and processed foods. Add Class 29 for dairy or meat products, and Class 32 for beverages. Restaurant chains need Class 43.' },
      { question: 'Can I trademark a recipe or food formula?', answer: 'No — recipes and formulas are not trademarkable. You trademark the brand name and logo. For recipes, keep them as trade secrets (confidential internal information).' },
      { question: 'I sell food on Amazon and Swiggy — do I need a trademark?', answer: 'Yes. Amazon Brand Registry requires a registered trademark. Without it, you cannot remove counterfeit listings using your brand name. Swiggy and Zomato also recognise registered trademarks for brand protection.' },
      { question: 'What trademark class for a cloud kitchen?', answer: 'Class 43 (Food & Hospitality Services) covers cloud kitchens and food delivery services. If you also sell packaged products under the same brand, add Class 30.' },
    ],
  },

  'fashion-lifestyle': {
    slug: 'fashion-lifestyle',
    name: 'Fashion & Lifestyle',
    displayName: 'Fashion & Lifestyle Brand',
    context: 'India\'s fashion industry is worth over ₹6 lakh crore and growing rapidly with D2C brands, luxury labels, and fast fashion. Brand identity is the primary asset — and the primary target for copying.',
    whyMatters: 'Fashion brands are copied faster than in almost any other industry. Duplicate designs, near-identical brand names, and counterfeit products sold on Instagram and Meesho directly reduce your revenue.',
    examples: ['D2C clothing brands', 'Jewellery labels', 'Accessories and bags brands', 'Luxury fashion houses', 'Footwear brands'],
    classes: [
      { num: 25, name: 'Clothing & Footwear', why: 'The essential class for all clothing, footwear, and fashion accessories — every fashion brand must file here.' },
      { num: 14, name: 'Jewellery & Watches', why: 'Covers precious metals, jewellery, and watches — mandatory for jewellery brands, designer jewellers, and watch labels.' },
      { num: 18, name: 'Leather Goods', why: 'Covers handbags, wallets, luggage, and leather accessories — essential for accessories and bag brands.' },
      { num: 35, name: 'Retail & Business Services', why: 'Covers retail stores and e-commerce platforms — needed for fashion brands selling through branded stores or online marketplaces.' },
    ],
    faqs: [
      { question: 'I launch a new clothing brand — which trademark class should I file?', answer: 'Class 25 is mandatory for clothing. If you also sell accessories, add Class 18 (bags, belts). For a jewellery line, add Class 14. For your retail store or online shop, add Class 35.' },
      { question: 'Can I protect a fashion logo as a trademark?', answer: 'Yes. Logos, stylised wordmarks, and brand signatures can all be registered as trademarks. File the logo as a device mark in the relevant classes.' },
      { question: 'How do I stop counterfeits on Instagram and Meesho?', answer: 'With a registered trademark, you can report IP violations on Instagram (IP Report tool), Meesho, and Amazon. These platforms act within 48–72 hours for registered trademark holders. Without registration, your reports are often ignored.' },
      { question: 'My fashion brand is growing — should I register the brand name or the logo?', answer: 'Register both — separately. A wordmark registration protects the name in any font/style. A logo (device mark) registration protects the specific visual. Most fashion brands file both for comprehensive protection.' },
    ],
  },

  healthcare: {
    slug: 'healthcare',
    name: 'Healthcare',
    displayName: 'Healthcare Business',
    context: 'India\'s healthcare market is expected to reach $638 billion by 2025. Hospital chains, diagnostic labs, healthtech startups, and wellness brands are all competing for the same patients and consumers.',
    whyMatters: 'In healthcare, brand trust is everything. Patients choose hospitals and labs by name. Copying of hospital names, diagnostic brand names, and healthcare product brands can mislead patients and cause genuine harm.',
    examples: ['Hospital chains', 'Diagnostic lab chains', 'Healthtech and telemedicine startups', 'Wellness and nutraceutical brands', 'Medical equipment distributors'],
    classes: [
      { num: 44, name: 'Medical & Veterinary Services', why: 'The primary class for hospitals, diagnostic labs, healthcare services, and veterinary clinics — mandatory for any healthcare service business.' },
      { num: 5, name: 'Pharmaceuticals', why: 'Covers health supplements, nutraceuticals, and OTC health products — essential for wellness brands and health product companies.' },
      { num: 42, name: 'Technology & IT Services', why: 'Covers healthtech platforms, telemedicine apps, and health data services — required for digital health startups.' },
    ],
    faqs: [
      { question: 'Which trademark class for a hospital or clinic?', answer: 'Class 44 (Medical & Veterinary Services) is the primary class. If you also have a health product line, add Class 5. For digital health apps, add Class 42.' },
      { question: 'Can a diagnostic lab chain register a trademark?', answer: 'Yes. Diagnostic lab brands like a pathology lab chain should file in Class 44. If they also sell wellness products, add Class 5.' },
      { question: 'Is trademark registration different for AYUSH/Ayurvedic healthcare businesses?', answer: 'Ayurvedic products file in Class 5 (pharmaceuticals and herbal preparations). Ayurvedic treatment clinics file in Class 44. Both can be filed together if you have both products and services.' },
      { question: 'What if another hospital in a different city has the same name?', answer: 'If they registered before you, they have priority rights nationally — even if they only operate in one city. This is why early trademark registration is critical, even for local hospitals.' },
    ],
  },

  'education-edtech': {
    slug: 'education-edtech',
    name: 'Education & EdTech',
    displayName: 'Education & EdTech Business',
    context: 'India\'s education sector — from coaching institutes to EdTech platforms — is one of the world\'s largest. Brand names in education build over years of trust, making them prime targets for copying.',
    whyMatters: 'Coaching institute names, EdTech platform brands, and school chain names are frequently copied by competitors in the same or nearby cities. Trademark registration is the only way to enforce exclusive rights to your brand.',
    examples: ['Coaching institutes and test prep companies', 'EdTech platforms and apps', 'School and college chains', 'Online course creators', 'Vocational training institutes'],
    classes: [
      { num: 41, name: 'Education & Entertainment', why: 'The primary class for coaching institutes, EdTech platforms, training programs, and educational institutions — every education business must file here.' },
      { num: 9, name: 'Electronics & Software', why: 'Covers educational software, apps, and digital learning tools — essential for EdTech companies with software products.' },
      { num: 16, name: 'Paper & Stationery', why: 'Covers books, study materials, test papers, and educational publications — needed for coaching institutes publishing study content.' },
    ],
    faqs: [
      { question: 'Which trademark class should a coaching institute file in?', answer: 'Class 41 (Education & Entertainment) is the primary class. If you publish study materials or books, add Class 16. If you have an app or software platform, add Class 9.' },
      { question: 'Can an EdTech startup protect its app name as a trademark?', answer: 'Yes. The app name should be registered in Class 9 (software) and Class 41 (educational services). Register as early as possible — EdTech brand names are copied within months of product launch.' },
      { question: 'I run a local coaching institute — is trademark registration worth it?', answer: 'Yes. Even a local institute\'s brand name can be copied by a new competitor. Once you\'ve built a reputation, someone else can open under the same or similar name and divert your students. Trademark registration prevents this.' },
      { question: 'Can I register a course name as a trademark?', answer: 'Yes, if the course name is distinctive and not generic. Descriptive names like "IIT JEE Coaching" cannot be trademarked. But branded course names like a proprietary course method or brand can be protected.' },
    ],
  },

  automotive: {
    slug: 'automotive',
    name: 'Automotive',
    displayName: 'Automotive Business',
    context: 'India is the world\'s fourth-largest automobile market. The industry spans OEMs, tier-1 and tier-2 suppliers, auto parts manufacturers, EV startups, and automotive service chains.',
    whyMatters: 'In the automotive supply chain, brand names on parts and components are frequently counterfeited. Counterfeit auto parts are a safety risk and a major revenue loss for original manufacturers.',
    examples: ['Auto parts manufacturers', 'EV startups', 'Automotive accessories brands', 'Vehicle service chains', 'Fleet management companies'],
    classes: [
      { num: 12, name: 'Vehicles', why: 'The primary class for vehicle manufacturers, EV companies, and vehicle parts — essential for any automotive OEM or EV startup.' },
      { num: 7, name: 'Machinery', why: 'Covers engines, machine tools, and industrial equipment — relevant for auto parts manufacturers and machinery suppliers.' },
      { num: 37, name: 'Construction & Repair', why: 'Covers vehicle repair and maintenance services — required for automotive service chains, garages, and roadside assistance brands.' },
    ],
    faqs: [
      { question: 'Which trademark class for an EV startup?', answer: 'Class 12 (Vehicles) for the vehicle itself and Class 7 (Machinery) for electric motors and powertrains. If you also offer charging services, add Class 37.' },
      { question: 'Can auto parts manufacturers protect their brand name?', answer: 'Yes. Auto parts brands file in Class 7 (machinery/engines) or Class 12 (vehicle parts). This allows you to take action against counterfeit parts being sold under your brand name.' },
      { question: 'I run a car service chain — what trademark class do I need?', answer: 'Class 37 (Construction & Repair) covers vehicle repair and maintenance services. If you also sell branded spare parts or accessories, add Class 12.' },
    ],
  },

  'real-estate': {
    slug: 'real-estate',
    name: 'Real Estate',
    displayName: 'Real Estate Business',
    context: 'India\'s real estate sector is worth $265 billion and growing. Developer brands, project names, and real estate agency names are all valuable brand assets that need protection.',
    whyMatters: 'Real estate brand names are used in major marketing campaigns and attract crores of investment. Competitors using similar developer or project names can divert buyers and damage reputation.',
    examples: ['Real estate developers', 'Housing project brands', 'Property management companies', 'Real estate agencies', 'PropTech startups'],
    classes: [
      { num: 36, name: 'Financial & Insurance Services', why: 'Covers real estate services, property management, and financial services related to real estate — the primary class for real estate agencies and developers.' },
      { num: 37, name: 'Construction & Repair', why: 'Covers construction and building services — essential for real estate developers and construction companies.' },
      { num: 42, name: 'Technology & IT Services', why: 'Covers PropTech platforms, real estate software, and digital services — required for technology-driven real estate businesses.' },
    ],
    faqs: [
      { question: 'Can a real estate developer trademark a project name?', answer: 'Yes. Project names like a township or housing development can be trademarked in Class 36 (real estate services) and Class 37 (construction). This prevents competitors from using similar project names.' },
      { question: 'Which class for a real estate agency brand?', answer: 'Class 36 (Financial & Real Estate Services) is the primary class for real estate brokerage and agency services.' },
      { question: 'Should a PropTech startup file a trademark?', answer: 'Yes. PropTech brands file in Class 42 (technology services) and Class 36 (real estate services). File early — the PropTech space is competitive and brand names get copied quickly.' },
    ],
  },

  'export-import': {
    slug: 'export-import',
    name: 'Export & Import',
    displayName: 'Export & Import Business',
    context: 'India is a top 10 global exporter with over $770 billion in annual trade. Exporters need trademark protection both in India and in their target markets to prevent brand copying internationally.',
    whyMatters: 'Brands copied in export markets — especially China, UAE, and Southeast Asia — can be registered by local parties, blocking the original Indian exporter from selling under their own name.',
    examples: ['Textile and garment exporters', 'Pharmaceutical exporters', 'Spice and food exporters', 'Engineering goods exporters', 'Handicraft exporters'],
    classes: [
      { num: 35, name: 'Business & Retail Services', why: 'Covers import/export agency services, trading, and business management — essential for export trading houses and import agents.' },
      { num: 39, name: 'Transport & Logistics', why: 'Covers shipping, freight forwarding, customs clearance, and logistics — required for logistics companies in the import-export chain.' },
    ],
    faqs: [
      { question: 'Do I need trademark registration before applying for IEC?', answer: 'No — IEC and trademark are separate registrations. But once you\'re exporting, brand protection in both India and destination countries is important. Start with Indian trademark registration.' },
      { question: 'Should I file a trademark in India or in the export market?', answer: 'Both, ideally. Indian registration protects you domestically. For each major export market (USA, UAE, EU, UK), file in that jurisdiction separately. The Indian registration gives you a priority date for international filings via the Madrid Protocol.' },
      { question: 'Which trademark class for an export trading house?', answer: 'Class 35 (Business Services, import/export agency) is primary. Add the class for the goods you export — e.g., Class 24-25 for textiles, Class 30 for food products.' },
    ],
  },

  agriculture: {
    slug: 'agriculture',
    name: 'Agriculture & Agro-Processing',
    displayName: 'Agriculture & Agro-Processing Business',
    context: 'India is the world\'s largest producer of spices, milk, and several key crops. Agro-processing and branded agricultural products are a fast-growing sector with significant IP risks.',
    whyMatters: 'Agricultural product brands — rice, spice, and organic food labels — are frequently counterfeited in India. Building a brand in agro-processing requires trademark protection to prevent imitation.',
    examples: ['Rice and grain brands', 'Spice and condiment companies', 'Organic food brands', 'Agri-input companies', 'Dairy and animal products brands'],
    classes: [
      { num: 30, name: 'Food — Staples', why: 'Covers rice, spices, flour, and processed agricultural products — the primary class for branded agricultural commodities.' },
      { num: 31, name: 'Agriculture & Live Animals', why: 'Covers fresh produce, seeds, and natural plants — relevant for agri-input companies and fresh produce brands.' },
      { num: 1, name: 'Chemicals', why: 'Covers fertilisers and agricultural chemicals — essential for agri-input manufacturers and fertiliser companies.' },
    ],
    faqs: [
      { question: 'Can a rice or spice brand be trademarked?', answer: 'Yes. The brand name and logo for a rice or spice product can be trademarked in Class 30. The generic name of the crop (like "Basmati") cannot be trademarked as it is a geographic indication, but your brand name can be.' },
      { question: 'What trademark class for an agri-input company?', answer: 'Class 1 (Chemicals) covers fertilisers and pesticides. Class 31 covers seeds and agricultural products. File in both if you sell both product types.' },
      { question: 'Is a GI tag the same as a trademark?', answer: 'No. A Geographical Indication (GI) tag protects products from a specific region (like Darjeeling tea or Basmati rice). A trademark protects your specific brand name. Both can coexist and complement each other.' },
    ],
  },

  jewellery: {
    slug: 'jewellery',
    name: 'Jewellery',
    displayName: 'Jewellery Business',
    context: 'India is the world\'s largest jewellery market and a major global jewellery exporter. Jewellery brands — from large chains to artisan jewellers — face constant imitation in design and brand name.',
    whyMatters: 'Jewellery brand names are copied extensively in India. Hallmark jewellers and branded jewellery stores face competition from shops using identical or similar names, diverting customer trust.',
    examples: ['Jewellery retail chains', 'Designer jewellery brands', 'Diamond jewellery exporters', 'Artificial jewellery brands', 'Imitation jewellery manufacturers'],
    classes: [
      { num: 14, name: 'Jewellery & Watches', why: 'The primary class for precious metal jewellery, watches, gemstones, and all fine jewellery — every jewellery brand must file here.' },
      { num: 35, name: 'Retail & Business Services', why: 'Covers jewellery retail stores — essential for jewellery chains and branded retail stores selling jewellery.' },
      { num: 26, name: 'Lace & Embroidery', why: 'Covers fashion jewellery and accessories — relevant for artificial/imitation jewellery brands.' },
    ],
    faqs: [
      { question: 'Which trademark class for a jewellery brand?', answer: 'Class 14 (Jewellery & Watches) is the primary class. If you operate retail stores, add Class 35. For artificial or fashion jewellery, also consider Class 26.' },
      { question: 'Can I protect a jewellery design as a trademark?', answer: 'Specific jewellery designs can be protected under the Designs Act 2000. The brand name and logo are protected as a trademark under Class 14. Both protections work together for comprehensive IP protection.' },
      { question: 'I\'m a small jeweller — do I need trademark registration?', answer: 'Yes. Even small jewellery shops build reputation by name over time. Once you\'ve built a customer base, a competitor opening under a similar name can divert your customers. Trademark registration costs ₹5,999 — far less than the cost of rebranding.' },
    ],
  },

  hospitality: {
    slug: 'hospitality',
    name: 'Hospitality & Tourism',
    displayName: 'Hospitality & Tourism Business',
    context: 'India\'s hospitality sector is booming with domestic and international tourism growth. Hotel chains, resort brands, travel companies, and restaurant franchises all need brand protection.',
    whyMatters: 'Hotel and restaurant brand names are frequently copied in tourist destinations and near popular locations. A competitor using a similar hotel or resort name can mislead travellers and damage your revenue.',
    examples: ['Hotel chains and boutique hotels', 'Restaurant franchises', 'Travel agencies and tour operators', 'Resort and homestay brands', 'OTAs and travel apps'],
    classes: [
      { num: 43, name: 'Food & Hospitality', why: 'The primary class for restaurants, hotels, cafes, catering, and accommodation services — every hospitality business must file here.' },
      { num: 39, name: 'Transport & Logistics', why: 'Covers travel agencies, tour operators, and transportation services — essential for travel companies and tour operators.' },
      { num: 41, name: 'Education & Entertainment', why: 'Covers entertainment, cultural events, and recreational activities — relevant for hospitality businesses with events and entertainment offerings.' },
    ],
    faqs: [
      { question: 'Which trademark class for a hotel or resort brand?', answer: 'Class 43 (Food & Hospitality) is the primary class for hotels, resorts, and restaurants. If you also operate a travel agency, add Class 39.' },
      { question: 'Can a restaurant franchise protect its brand name?', answer: 'Yes. Restaurant franchises register in Class 43. The trademark then protects the brand across all franchise outlets and allows legal action against restaurants using your brand name without permission.' },
      { question: 'I run a homestay — should I trademark my property name?', answer: 'If your homestay has a distinctive name and you\'re marketing it nationally via Airbnb, booking.com, or your website, trademark registration is worth it. Class 43 covers accommodation services.' },
    ],
  },

  manufacturing: {
    slug: 'manufacturing',
    name: 'Manufacturing',
    displayName: 'Manufacturing Business',
    context: 'India\'s manufacturing sector employs over 57 million people across textiles, auto parts, chemicals, electronics, and more. Make in India has accelerated growth, making brand protection critical for manufacturers scaling nationally and globally.',
    whyMatters: 'Manufacturing brand names on products are counterfeited extensively in India. Duplicate products sold under identical or similar brand names directly hurt revenue and business reputation.',
    examples: ['FMCG product manufacturers', 'Industrial equipment manufacturers', 'Packaging companies', 'Chemical manufacturers', 'Consumer goods brands'],
    classes: [
      { num: 7, name: 'Machinery', why: 'Covers machines, engines, machine tools, and industrial equipment — the primary class for machinery and equipment manufacturers.' },
      { num: 11, name: 'Lighting & Appliances', why: 'Covers electrical appliances, lighting equipment, and HVAC — essential for home appliance and electrical goods manufacturers.' },
      { num: 35, name: 'Business & Retail Services', why: 'Covers wholesale/retail trade services — needed for manufacturers who also operate branded distribution or retail operations.' },
    ],
    faqs: [
      { question: 'Does a manufacturer need to trademark the product brand or the company name?', answer: 'Ideally both. The product brand (what appears on the product) should be trademarked in the relevant goods class. If the company name differs from the product brand, consider trademarking both.' },
      { question: 'We manufacture for other brands — do we still need trademark registration?', answer: 'If you manufacture under other brands, you don\'t need trademark protection for those brands. But if you also have your own branded products or want to protect your manufacturing company name, trademark registration is relevant.' },
      { question: 'Which class for a chemical manufacturer?', answer: 'Class 1 (industrial chemicals), Class 2 (paints and coatings), Class 4 (lubricants), or Class 5 (pharmaceutical chemicals) depending on what you manufacture. Many chemical companies file in multiple classes.' },
    ],
  },

  'retail-ecommerce': {
    slug: 'retail-ecommerce',
    name: 'Retail & E-Commerce',
    displayName: 'Retail & E-Commerce Business',
    context: 'India\'s e-commerce market will reach $350 billion by 2030. D2C brands, marketplace sellers, and offline retailers all need trademark registration — especially for Amazon Brand Registry and Flipkart brand protection programs.',
    whyMatters: 'Counterfeit sellers on Amazon, Flipkart, and Meesho copy successful brands to steal their search traffic and sales. Trademark registration is the only way to have counterfeits removed quickly.',
    examples: ['D2C brands', 'Amazon and Flipkart marketplace sellers', 'Quick commerce brands', 'Offline retail chains', 'Omnichannel retailers'],
    classes: [
      { num: 35, name: 'Business & Retail Services', why: 'Covers retail stores, e-commerce platforms, and business management services — essential for any retail or e-commerce brand.' },
      { num: 25, name: 'Clothing & Footwear', why: 'For fashion and apparel D2C brands selling clothing on e-commerce platforms.' },
      { num: 30, name: 'Food — Staples', why: 'For food D2C brands and FMCG sellers on e-commerce.' },
    ],
    faqs: [
      { question: 'Do I need a trademark for Amazon Brand Registry?', answer: 'Yes. Amazon Brand Registry requires an active or pending trademark registration. Without it, you cannot protect your product listings from counterfeits. File as soon as possible — even a pending trademark application is often accepted.' },
      { question: 'Which trademark class for an e-commerce business?', answer: 'Class 35 (Retail & Business Services) is mandatory for e-commerce businesses. Also file in the class for your core products — e.g., Class 25 for apparel, Class 30 for food, Class 9 for electronics.' },
      { question: 'A counterfeit seller is selling under my brand on Flipkart — what can I do?', answer: 'With a registered trademark, file an IP complaint through Flipkart\'s brand protection portal. Flipkart acts within 48–72 hours for registered trademark holders. Without registration, your complaint is usually ignored.' },
    ],
  },

  'beauty-wellness': {
    slug: 'beauty-wellness',
    name: 'Beauty & Wellness',
    displayName: 'Beauty & Wellness Business',
    context: 'India\'s beauty and wellness market is $20 billion and growing at 20% annually. From organic skincare startups to salon chains and ayurvedic beauty brands, the market is highly competitive with significant copying.',
    whyMatters: 'Beauty product brand names — especially those with natural/organic positioning — are copied aggressively. Counterfeit beauty products also pose consumer safety risks, making brand protection both a business and ethical priority.',
    examples: ['Skincare and cosmetics brands', 'Natural and organic beauty brands', 'Salon and spa chains', 'Haircare product brands', 'Wellness and nutraceutical brands'],
    classes: [
      { num: 3, name: 'Cosmetics & Cleaning', why: 'The primary class for cosmetics, skincare, perfumes, shampoos, and personal care products — every beauty brand must file here.' },
      { num: 44, name: 'Medical & Veterinary', why: 'Covers beauty salons, spas, and wellness treatment services — essential for salon chains and wellness service businesses.' },
      { num: 5, name: 'Pharmaceuticals', why: 'Covers health supplements, nutraceuticals, and medicated skincare — relevant for beauty brands with health and wellness product lines.' },
    ],
    faqs: [
      { question: 'Which trademark class for a skincare brand?', answer: 'Class 3 (Cosmetics & Cleaning) is mandatory for skincare products. If you also offer salon services, add Class 44. For health supplement or nutraceutical products, add Class 5.' },
      { question: 'I sell handmade soaps and natural skincare online — should I trademark?', answer: 'Yes, especially for online sellers. Handmade and natural beauty brands grow quickly on Instagram and Amazon. Once visible, your brand name is quickly copied by competitors. Class 3 is the right class.' },
      { question: 'Can I protect a beauty product formulation with a trademark?', answer: 'No — formulations and recipes are not trademarkable. They can be trade secrets (kept confidential). You trademark the brand name and logo under Class 3.' },
    ],
  },

  'media-entertainment': {
    slug: 'media-entertainment',
    name: 'Media & Entertainment',
    displayName: 'Media & Entertainment Business',
    context: 'India is the world\'s largest media and entertainment market by volume, spanning films, OTT, gaming, music, and digital content. Content brand names and characters are prime IP assets.',
    whyMatters: 'Media brand names, OTT platform names, gaming titles, and content creator brands are copied within weeks of gaining traction. Trademark registration is the foundation of IP protection in entertainment.',
    examples: ['OTT platforms', 'Film production houses', 'Gaming studios', 'Digital content creators', 'Music labels'],
    classes: [
      { num: 41, name: 'Education & Entertainment', why: 'The primary class for entertainment services, OTT platforms, gaming, film production, and content creation — every media business must file here.' },
      { num: 38, name: 'Telecommunications', why: 'Covers broadcasting, streaming, and digital communication services — relevant for OTT platforms and broadcasters.' },
      { num: 9, name: 'Electronics & Software', why: 'Covers apps, games, and digital products — essential for gaming studios and app-based media businesses.' },
    ],
    faqs: [
      { question: 'Which trademark class for an OTT streaming platform?', answer: 'Class 41 (Entertainment Services) is primary. Add Class 38 (Telecommunications, broadcasting) for streaming distribution. If you have an app, add Class 9 as well.' },
      { question: 'Can a YouTube content creator trademark their channel name?', answer: 'Yes. Content creators with large followings can trademark their channel name, brand name, or logo in Class 41. This prevents others from creating channels or products under the same name.' },
      { question: 'I run a gaming studio — what trademark class applies?', answer: 'Class 9 (software, electronic games) for the game products and Class 41 (entertainment services) for online gaming services. File in both for complete protection.' },
    ],
  },

  construction: {
    slug: 'construction',
    name: 'Construction',
    displayName: 'Construction Business',
    context: 'India\'s construction sector accounts for over 9% of GDP. Infrastructure companies, building material brands, and construction service firms all need trademark protection as they compete for tenders and expand nationally.',
    whyMatters: 'Construction company names and building material brands are copied by competitors bidding on the same tenders. A registered trademark is often required in tender documentation and protects against brand confusion.',
    examples: ['Infrastructure companies', 'Building material manufacturers', 'Interior design firms', 'Real estate developers', 'Contractor and civil engineering firms'],
    classes: [
      { num: 37, name: 'Construction & Repair', why: 'The primary class for construction services, building contractors, installation services, and maintenance — every construction firm must file here.' },
      { num: 19, name: 'Building Materials', why: 'Covers non-metallic building materials, cement, bricks, tiles, and glass — essential for building material manufacturers.' },
      { num: 6, name: 'Metals & Hardware', why: 'Covers metallic building materials, pipes, cables, and hardware — relevant for steel and hardware product manufacturers in construction.' },
    ],
    faqs: [
      { question: 'Which trademark class for a construction company?', answer: 'Class 37 (Construction & Repair Services) is the primary class for construction contractors and builders. For building material products, file in Class 19 (non-metallic materials) or Class 6 (metals).' },
      { question: 'Do construction companies need ISO 9001 and a trademark?', answer: 'Both are important. ISO 9001 is often required for government tender qualification. Trademark registration protects your company name and brand. Most serious construction companies need both.' },
      { question: 'I make tiles and flooring products — what trademark class?', answer: 'Class 19 (Building Materials) for tiles, bricks, and flooring materials. If you also sell metal hardware, add Class 6.' },
    ],
  },

  logistics: {
    slug: 'logistics',
    name: 'Logistics & Supply Chain',
    displayName: 'Logistics & Supply Chain Business',
    context: 'India\'s logistics sector is a ₹14 lakh crore industry growing at 10% annually. With e-commerce driving demand, logistics brand names are business-critical assets in a highly competitive market.',
    whyMatters: 'Logistics brand names and courier company names are frequently copied by local operators. A registered trademark allows you to take legal action against operators using similar names and diverting your business.',
    examples: ['Courier and express delivery companies', '3PL (third-party logistics) providers', 'Freight forwarding companies', 'Cold chain logistics', 'Logistics SaaS platforms'],
    classes: [
      { num: 39, name: 'Transport & Logistics', why: 'The primary class for transportation, shipping, storage, freight forwarding, and supply chain services — every logistics company must file here.' },
      { num: 35, name: 'Business & Retail Services', why: 'Covers business management and supply chain consulting services — relevant for logistics tech and 3PL business service providers.' },
      { num: 42, name: 'Technology & IT Services', why: 'Covers logistics software and SaaS platforms — essential for logistics technology companies.' },
    ],
    faqs: [
      { question: 'Which trademark class for a courier company?', answer: 'Class 39 (Transport & Logistics) is the primary class for courier, express delivery, and freight companies.' },
      { question: 'I run a logistics SaaS platform — what trademark class?', answer: 'Class 42 (Technology Services) for the software platform and Class 39 (Transport & Logistics) for the logistics service element. File in both.' },
      { question: 'Do logistics companies need IEC registration?', answer: 'Freight forwarders and customs house agents dealing with import/export on behalf of clients should have IEC. For domestic-only logistics, IEC may not be required.' },
    ],
  },

  fintech: {
    slug: 'fintech',
    name: 'Fintech & Banking',
    displayName: 'Fintech & Banking Business',
    context: 'India\'s fintech sector has 23 unicorns and growing. Digital payment apps, lending platforms, insurance tech, and wealth management brands are in intense competition — and brand names are prime IP assets.',
    whyMatters: 'In financial services, consumer trust is everything. A competitor using a similar app name or brand in fintech can cause consumers to install the wrong app, triggering fraud complaints and regulatory scrutiny.',
    examples: ['Digital payment apps', 'Lending and credit platforms', 'Insurance tech companies', 'Wealth management apps', 'Neobanks and digital banking services'],
    classes: [
      { num: 36, name: 'Financial & Insurance Services', why: 'The primary class for banking, insurance, payment services, and financial advisory — every fintech company must file here.' },
      { num: 42, name: 'Technology & IT Services', why: 'Covers fintech software platforms and apps — essential for technology-driven financial services companies.' },
      { num: 9, name: 'Electronics & Software', why: 'Covers fintech software products and financial apps — relevant for fintech companies with downloadable software products.' },
    ],
    faqs: [
      { question: 'Which trademark class for a digital payments app?', answer: 'Class 36 (Financial Services) and Class 42 (Technology Services) are both needed. Add Class 9 if you have a downloadable app or software product.' },
      { question: 'Can two payment apps have the same name in India?', answer: 'No — once one company trademarks a name in Class 36, no one else can use an identical or confusingly similar name in the same class. This is why early trademark filing is critical in the fast-moving fintech space.' },
      { question: 'I run a lending platform — do I need an RBI licence and a trademark?', answer: 'These are separate requirements. RBI licence/NBFC registration is regulatory compliance. Trademark registration protects your brand. Both are necessary for a legitimate fintech business.' },
    ],
  },
};

export function getIndustryData(slug: string): IndustryData | null {
  return INDUSTRY_DATA[slug.toLowerCase()] ?? null;
}

export const ALL_INDUSTRY_SLUGS = Object.keys(INDUSTRY_DATA);

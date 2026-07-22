export interface CityData {
  slug: string;
  name: string;
  state: string;
  stateCode: string;
  industries: string;
  context: string;
  lat: number;
  lng: number;
  /** Verified, city-specific facts (not generic industry filler) — rolled out city by city. */
  localInsights?: string[];
}

/**
 * Which of the Trade Marks Registry's 5 branch offices (Mumbai, Delhi, Ahmedabad,
 * Kolkata, Chennai) examines applications from a given state — verified against
 * ipindia.gov.in and cross-checked with a second source (nyomlegal.com), July 2026.
 * Jurisdiction is state-wide, not city-specific, but it's a real, checkable fact
 * every city page can show correctly without per-city research.
 */
const REGISTRY_OFFICE_BY_STATE: Record<string, string> = {
  Maharashtra: 'Mumbai',
  'Madhya Pradesh': 'Mumbai',
  Chhattisgarh: 'Mumbai',
  Goa: 'Mumbai',
  Gujarat: 'Ahmedabad',
  Rajasthan: 'Ahmedabad',
  'Jammu & Kashmir': 'Delhi',
  Punjab: 'Delhi',
  Haryana: 'Delhi',
  'Uttar Pradesh': 'Delhi',
  'Himachal Pradesh': 'Delhi',
  Uttarakhand: 'Delhi',
  Delhi: 'Delhi',
  Chandigarh: 'Delhi',
  'Arunachal Pradesh': 'Kolkata',
  Assam: 'Kolkata',
  Bihar: 'Kolkata',
  Odisha: 'Kolkata',
  'West Bengal': 'Kolkata',
  Manipur: 'Kolkata',
  Mizoram: 'Kolkata',
  Meghalaya: 'Kolkata',
  Sikkim: 'Kolkata',
  Tripura: 'Kolkata',
  Jharkhand: 'Kolkata',
  Nagaland: 'Kolkata',
  'Andhra Pradesh': 'Chennai',
  Telangana: 'Chennai',
  Kerala: 'Chennai',
  'Tamil Nadu': 'Chennai',
  Karnataka: 'Chennai',
};

export function getRegistryOffice(state: string): string {
  return REGISTRY_OFFICE_BY_STATE[state] ?? 'Delhi';
}

export const CITY_DATA: Record<string, CityData> = {
  // Tier 1 — original 10
  ludhiana: { slug: 'ludhiana', name: 'Ludhiana', state: 'Punjab', stateCode: 'PB', industries: 'textiles, hosiery, bicycles, auto parts, pharmaceuticals', context: 'Ludhiana is India\'s largest industrial city in Punjab — a major hub for textiles, hosiery, bicycle manufacturing, and auto components. Protecting your brand in these competitive, export-driven markets is essential.', lat: 30.9010, lng: 75.8573, localInsights: [
    "Home to Hero Cycles — the world's largest bicycle manufacturer, founded here in 1956 — and Avon Cycles, whose leadership has chaired the All India Cycle Manufacturers' Association.",
    "The hosiery and knitwear cluster alone counts roughly 14,000 MSMEs organised across some 70 trade associations, one of the most crowded branded-goods markets in North India.",
  ] },
  delhi: { slug: 'delhi', name: 'Delhi', state: 'Delhi', stateCode: 'DL', industries: 'fashion, FMCG, retail, technology, food & beverage', context: 'Delhi NCR is India\'s largest consumer market and a hub for fashion, retail, and fast-moving consumer goods. With thousands of new brands launching each year, trademark registration is critical to protecting your identity.', lat: 28.6139, lng: 77.2090, localInsights: [
    "Delhi's Tank Road (Karol Bagh) and Palika Bazaar markets have both featured on the US Trade Representative's Notorious Markets List for counterfeit goods — exactly the infringement a registered trademark lets you act against directly.",
    "Delhi is also the seat of the Trade Marks Registry's own Delhi branch office, which examines applications from across Punjab, Haryana, UP and the wider northern belt.",
  ] },
  mumbai: { slug: 'mumbai', name: 'Mumbai', state: 'Maharashtra', stateCode: 'MH', industries: 'finance, entertainment, FMCG, real estate, media', context: 'Mumbai is India\'s commercial capital and home to the Bombay Stock Exchange, Bollywood, and thousands of registered companies. Strong trademark protection is a business necessity in this high-competition market.', lat: 19.0760, lng: 72.8777, localInsights: [
    "Mumbai's Heera Panna market has repeatedly appeared on the USTR's Notorious Markets List for counterfeit watches, cosmetics and accessories — a reminder of how exposed an unregistered brand is in India's largest consumer market.",
    "The city hosts the Trade Marks Registry's head office, with jurisdiction extending across Maharashtra, Madhya Pradesh, Chhattisgarh and Goa.",
  ] },
  bangalore: { slug: 'bangalore', name: 'Bangalore', state: 'Karnataka', stateCode: 'KA', industries: 'IT, SaaS, startups, aerospace, biotechnology', context: 'Bangalore is India\'s Silicon Valley and the birthplace of thousands of tech startups and SaaS companies every year. Registering your brand name and logo early protects you from impersonation and domain squatting.', lat: 12.9716, lng: 77.5946, localInsights: [
    "Bengaluru's SP Road (Sadar Patrappa Road) market has been named in the USTR's Notorious Markets List for counterfeit electronics and hardware — the same category many of the city's hardware startups build in.",
    "As India's largest concentration of tech startups and SaaS companies, a name clash here can surface the moment you start fundraising or list on an app store.",
  ] },
  hyderabad: { slug: 'hyderabad', name: 'Hyderabad', state: 'Telangana', stateCode: 'TS', industries: 'pharmaceuticals, IT, biotechnology, food processing', context: 'Hyderabad is a major centre for pharmaceutical and life-sciences companies in India. Brand protection through trademark registration is especially important in regulated industries where reputation directly impacts business.', lat: 17.3850, lng: 78.4867, localInsights: [
    "Hyderabad's Genome Valley cluster has made the city Telangana's self-styled 'vaccine capital of the world,' producing an estimated one-third of global vaccine doses.",
    "The city accounts for roughly 35% of India's bulk drug production and is headquarters to Dr. Reddy's, Aurobindo Pharma, Hetero, Divi's Laboratories and Bharat Biotech — regulated industries where trademark protection is inseparable from regulatory trust.",
  ] },
  pune: { slug: 'pune', name: 'Pune', state: 'Maharashtra', stateCode: 'MH', industries: 'automotive, IT, education, manufacturing, defence', context: 'Pune is one of India\'s fastest-growing cities with a strong automotive and IT sector. With a large startup ecosystem and established industrial base, securing your trademark early prevents costly disputes later.', lat: 18.5204, lng: 73.8567, localInsights: [
    "Bajaj Auto — the world's third-largest motorcycle manufacturer and largest three-wheeler maker — is headquartered in Pune, alongside the Automotive Research Association of India (ARAI).",
    "Hinjewadi's IT park alone hosts 300+ companies, and Pune-born unicorns like FirstCry, OneCard and Druva show how fast a strong brand name here can scale nationally.",
  ] },
  ahmedabad: { slug: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', stateCode: 'GJ', industries: 'textiles, chemicals, pharmaceuticals, diamond processing, FMCG', context: 'Ahmedabad is the commercial heart of Gujarat — India\'s most entrepreneur-friendly state. From textile exporters to chemical manufacturers and diamond traders, trademark protection ensures your brand is legally yours.', lat: 23.0225, lng: 72.5714, localInsights: [
    "India's first UNESCO World Heritage City (declared July 2017), Ahmedabad has been Gujarat's textile hub since its first cotton mill opened in 1861 — earning it the nickname 'Manchester of India.'",
    "Dozens of GIDC industrial estates around the city host chemical, pharmaceutical and engineering exporters for whom a cleared trademark is a precondition for serious buyers.",
  ] },
  chennai: { slug: 'chennai', name: 'Chennai', state: 'Tamil Nadu', stateCode: 'TN', industries: 'automobile, IT, manufacturing, healthcare, logistics', context: 'Chennai is India\'s automobile manufacturing capital and a growing IT hub. With global OEMs and tier-1 suppliers based here, protecting your brand and product names through trademark registration is essential.', lat: 13.0827, lng: 80.2707, localInsights: [
    "Nicknamed the 'Detroit of Asia,' Chennai's 60km automotive corridor hosts 200+ industrial units — including Hyundai, Ford, Renault-Nissan, Royal Enfield, Ashok Leyland and TVS — and generates roughly 60% of India's auto exports.",
    "The city is also the seat of the Trade Marks Registry's Chennai branch, which covers Tamil Nadu, Karnataka, Kerala, Andhra Pradesh and Telangana.",
  ] },
  jaipur: { slug: 'jaipur', name: 'Jaipur', state: 'Rajasthan', stateCode: 'RJ', industries: 'handicrafts, gemstones, tourism, textiles, food & spices', context: 'Jaipur is renowned for its handicrafts, gemstone jewellery, blue pottery, and textile exports. Artisans and entrepreneurs in these industries are especially vulnerable to brand copying without proper trademark protection.', lat: 26.9124, lng: 75.7873, localInsights: [
    "Jaipur is the world's largest gemstone cutting and setting centre, with an estimated 800,000+ people working in the trade.",
    "Jaipur Blue Pottery and Sanganeri prints both carry GI tags — heritage crafts that face constant imitation, making trademark registration the difference between a protected brand and an unbranded commodity.",
  ] },
  chandigarh: { slug: 'chandigarh', name: 'Chandigarh', state: 'Chandigarh', stateCode: 'CH', industries: 'retail, healthcare, education, hospitality, real estate', context: 'Chandigarh is the capital of Punjab and Haryana and a rapidly growing commercial centre. As the gateway city to North India\'s economic corridor, registering your trademark here protects your brand across the entire region.', lat: 30.7333, lng: 76.7794, localInsights: [
    "Designed by Le Corbusier as India's first fully planned city, Chandigarh's Sector 17 city centre anchors commerce for both Punjab and Haryana, the two states it serves as joint capital.",
    "PGIMER, one of India's top referral hospitals, and Panjab University give the city an outsized concentration of healthcare and education brands that reach patients and students well beyond the city limits.",
  ] },

  // Tier 2 — 40 additional cities
  surat: { slug: 'surat', name: 'Surat', state: 'Gujarat', stateCode: 'GJ', industries: 'diamonds, textiles, synthetic fabrics, petrochemicals', context: 'Surat is the diamond capital of India and a global hub for synthetic textiles. With massive export volumes and highly competitive markets, brand protection through trademark registration is non-negotiable for Surat businesses.', lat: 21.1702, lng: 72.8311, localInsights: [
    "Surat is home to the Surat Diamond Bourse — Guinness World Records' largest office building on Earth, bigger than the Pentagon, housing over 4,700 offices for 65,000+ diamond professionals.",
    "An estimated 90% of the world's diamonds are cut and polished in Surat, and the city produces roughly 40% of India's man-made-fibre (MMF) fabric output.",
  ] },
  kolkata: { slug: 'kolkata', name: 'Kolkata', state: 'West Bengal', stateCode: 'WB', industries: 'jute, leather, IT, FMCG, steel, trading', context: 'Kolkata is Eastern India\'s commercial gateway with a rich history in jute, leather, and manufacturing. As the city transitions toward IT and services, brand protection becomes critical for both traditional and modern businesses.', lat: 22.5726, lng: 88.3639, localInsights: [
    "Kolkata's Kidderpore ('Fancy Market') has featured on the USTR's Notorious Markets List for counterfeit apparel and cosmetics — the same list that includes Delhi's Palika Bazaar and Mumbai's Heera Panna.",
    "The city has been the world's most important jute-manufacturing centre since the 1870s, and West Bengal today accounts for roughly 50% of India's leather goods exports.",
  ] },
  noida: { slug: 'noida', name: 'Noida', state: 'Uttar Pradesh', stateCode: 'UP', industries: 'IT, manufacturing, FMCG, media, electronics', context: 'Noida is Delhi NCR\'s tech and manufacturing hub, home to major IT parks, media companies, and electronics manufacturers. Fast-growing businesses in Noida face intense brand competition and need early trademark protection.', lat: 28.5355, lng: 77.3910, localInsights: [
    "Noida is home to Samsung's mobile factory — the world's largest smartphone manufacturing facility, with a capacity of 120 million units a year.",
    "Noida Film City, established in 1988, anchors the city's media and broadcasting industry alongside its electronics manufacturing clusters.",
  ] },
  gurugram: { slug: 'gurugram', name: 'Gurugram', state: 'Haryana', stateCode: 'HR', industries: 'IT, fintech, FMCG, automotive, corporate services', context: 'Gurugram (Gurgaon) is India\'s corporate capital — home to Fortune 500 company offices, IT parks, and a booming startup ecosystem. Trademark registration is a fundamental requirement for any serious business operating here.', lat: 28.4595, lng: 77.0266, localInsights: [
    "More than 250 Fortune 500 companies have offices in Gurugram, including Google, Microsoft, IBM and American Express, clustered around business districts like DLF Cyber City.",
    "The city's growth traces back to Maruti Suzuki setting up its manufacturing plant here in 1975 — still one of its two main plants alongside neighbouring Manesar.",
  ] },
  lucknow: { slug: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', stateCode: 'UP', industries: 'FMCG, chikankari, government, education, healthcare', context: 'Lucknow is the capital of India\'s most populous state and a centre for chikankari textiles, food products, and a growing services sector. Brand protection is essential for artisans and FMCG businesses competing in a large market.', lat: 26.8467, lng: 80.9462, localInsights: [
    "Chikankari embroidery earned a GI tag in 2008, meaning only producers in Lucknow and its adjoining districts may legally market work as 'Lucknow chikan' — GI protection and trademark protection work hand in hand for artisans here.",
    "The chikankari cluster alone employs 250,000+ artisans (95% women) across Lucknow and six surrounding districts, generating over ₹5,000 crore a year.",
  ] },
  kanpur: { slug: 'kanpur', name: 'Kanpur', state: 'Uttar Pradesh', stateCode: 'UP', industries: 'leather, textiles, chemicals, engineering, FMCG', context: 'Kanpur is one of India\'s largest leather and textile manufacturing centres, exporting goods globally. With a concentration of manufacturing exports, protecting your brand name and product identity is critical for long-term business success.', lat: 26.4499, lng: 80.3319, localInsights: [
    "Kanpur is India's largest centre for buffalo-based leather, with the Jajmau cluster's 200+ tanneries contributing roughly 30% of India's leather trade — around ₹6,000 crore in exports annually.",
    "The city holds a 95% share of India's harness and saddlery production, and its leather industry employs close to a million people across Kanpur and Unnao districts.",
  ] },
  nagpur: { slug: 'nagpur', name: 'Nagpur', state: 'Maharashtra', stateCode: 'MH', industries: 'oranges, mining, power, logistics, textiles', context: 'Nagpur is Central India\'s logistics and commercial hub, strategically located at the geographical centre of India. Its growing industrial base and MIHAN economic zone make brand protection a necessity for businesses expanding nationally.', lat: 21.1458, lng: 79.0882, localInsights: [
    "Known as the 'Orange City,' Nagpur is the trading centre for a region producing an estimated 70% of India's oranges, and its 1907 Zero Mile Stone marks the geographical centre of the country.",
    "The MIHAN special economic zone has drawn campuses from TCS, Infosys and HCL, positioning Nagpur as Central India's newest logistics and IT hub.",
  ] },
  indore: { slug: 'indore', name: 'Indore', state: 'Madhya Pradesh', stateCode: 'MP', industries: 'FMCG, pharmaceuticals, textiles, IT, trading', context: 'Indore is the commercial capital of Madhya Pradesh and one of India\'s cleanest and fastest-growing cities. Its vibrant startup ecosystem and strong trading community make trademark registration a priority for any growing business.', lat: 22.7196, lng: 75.8577, localInsights: [
    "Indore has topped the Swachh Survekshan ranking as India's cleanest city for eight consecutive years, a rare civic distinction that reinforces the city's brand-conscious business culture.",
    "Known as India's snack capital, Indore's namkeen makers — famous for Indori Sev and Ratlami Sev — compete in a category where a recognisable, registered brand name is the main point of difference on a crowded shelf.",
  ] },
  bhopal: { slug: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh', stateCode: 'MP', industries: 'pharmaceuticals, education, IT, tourism, government', context: 'Bhopal is the capital of Madhya Pradesh with a growing pharmaceutical sector and increasing IT presence. As the city attracts more businesses and startups, protecting brand identity early becomes essential for long-term success.', lat: 23.2599, lng: 77.4126, localInsights: [
    "Known as the 'City of Lakes' after the 11th-century Bhoj Tal, Bhopal's twin lakes (Bada Talab and Chhota Talab) still anchor the city's identity and tourism economy.",
    "Mandideep, Bhopal's industrial suburb, hosts 400+ manufacturing units including Procter & Gamble, HEG, Lupin Laboratories and Godrej Foods.",
  ] },
  coimbatore: { slug: 'coimbatore', name: 'Coimbatore', state: 'Tamil Nadu', stateCode: 'TN', industries: 'textiles, engineering, pumps, FMCG, agriculture', context: 'Coimbatore is Tamil Nadu\'s industrial capital and the world\'s largest pump manufacturing hub. With a strong export market in textiles and engineering goods, brand protection is essential to prevent copying in international markets.', lat: 11.0168, lng: 76.9558, localInsights: [
    "Nicknamed the 'Manchester of South India' for its textile heritage, Coimbatore is also home to over 1,500 spinning mills exporting cotton yarn worldwide.",
    "Known as India's 'Pump City,' the region supplies an estimated 40% of the country's motor and pump requirements, with manufacturers like CRI Pumps, Texmo and Kirloskar Brothers based here.",
  ] },
  kochi: { slug: 'kochi', name: 'Kochi', state: 'Kerala', stateCode: 'KL', industries: 'IT, tourism, spices, seafood, shipping, startups', context: 'Kochi is Kerala\'s commercial and IT hub with a fast-growing startup ecosystem and strong export trade in spices and seafood. As businesses scale nationally and globally, trademark registration protects the brands they\'ve built.', lat: 9.9312, lng: 76.2673, localInsights: [
    "Infopark Kochi, established in 2004, now hosts 582 companies employing around 72,000 professionals, with IT exports nearly doubling to ₹631 crore between 2016-17 and 2020-21.",
    "Kochi's natural harbour formed after a 1341 CE flood silted the older port of Muziris — since then the city has anchored a spice export trade that stretches back 5,000 years.",
  ] },
  visakhapatnam: { slug: 'visakhapatnam', name: 'Visakhapatnam', state: 'Andhra Pradesh', stateCode: 'AP', industries: 'pharmaceuticals, steel, IT, tourism, shipbuilding', context: 'Visakhapatnam (Vizag) is Andhra Pradesh\'s largest city and a key port and industrial centre. The presence of major pharma, steel, and IT companies makes trademark registration a necessity for businesses protecting their market position.', lat: 17.6868, lng: 83.2185, localInsights: [
    "The Vizag Steel Plant (RINL), inaugurated in 1970, is India's first major shore-based integrated steel plant, now upgraded to a 6.3 million-tonne capacity.",
    "Hindustan Shipyard here built India's first ship, Jala Usha, in 1948, and Vizag remains known as the country's shipbuilding capital alongside its Jawaharlal Nehru Pharma City cluster.",
  ] },
  patna: { slug: 'patna', name: 'Patna', state: 'Bihar', stateCode: 'BR', industries: 'agriculture, education, FMCG, government, trading', context: 'Patna is Bihar\'s capital and a major commercial centre serving one of India\'s largest states. With a booming FMCG and education sector, brand protection is increasingly important as businesses from Patna compete nationally.', lat: 25.5941, lng: 85.1376, localInsights: [
    "As ancient Pataliputra, Patna was capital of the Magadha Empire under the Mauryas and Guptas, and is among the oldest continuously inhabited cities in the world.",
    "Bihar's Shahi Litchi — grown extensively around Patna and earning a GI tag in 2018 — accounts for over 40% of India's total litchi production.",
  ] },
  vadodara: { slug: 'vadodara', name: 'Vadodara', state: 'Gujarat', stateCode: 'GJ', industries: 'chemicals, petrochemicals, engineering, textiles, pharmaceuticals', context: 'Vadodara is Gujarat\'s chemical and engineering capital, home to ONGC, GSFC, and hundreds of chemical manufacturers. In export-heavy, IP-sensitive industries like chemicals and pharma, trademark registration is a critical business asset.', lat: 22.3072, lng: 73.1812, localInsights: [
    "Vadodara's Laxmi Vilas Palace, built by the ruling Gaekwad dynasty, spans roughly 500 acres — making it larger than Buckingham Palace and one of India's largest private residences.",
    "GSFC's Vadodara phosphoric acid plant, commissioned in 1967, anchors a petrochemical cluster that today includes ONGC, GAIL and Reliance's IPCL complex.",
  ] },
  rajkot: { slug: 'rajkot', name: 'Rajkot', state: 'Gujarat', stateCode: 'GJ', industries: 'engineering, jewellery, textiles, auto parts, FMCG', context: 'Rajkot is Saurashtra\'s industrial and commercial centre, known for precision engineering, jewellery, and auto components. With major export markets in the Middle East and Africa, brand protection is essential for Rajkot businesses going global.', lat: 22.3039, lng: 70.8022, localInsights: [
    "Rajkot's foundry cluster of roughly 500 units produces around 300 categories of automotive spare parts, exporting to the Gulf, Europe and the Middle East.",
    "The city is also home to one of India's largest gold jewellery markets, prized specifically for the purity of its gold.",
  ] },
  agra: { slug: 'agra', name: 'Agra', state: 'Uttar Pradesh', stateCode: 'UP', industries: 'leather, footwear, tourism, handicrafts, FMCG', context: 'Agra is globally known for the Taj Mahal but is equally important as India\'s leather and footwear capital. With major export operations in leather goods, artisans and manufacturers need trademark protection to prevent brand copying.', lat: 27.1767, lng: 78.0081, localInsights: [
    "Agra Leather Footwear itself carries a GI tag, and the city contributes an estimated 75% of India's total leather footwear production — a rare case where the product category and the city's name are legally linked.",
    "Agra Petha, the city's signature sweet, is also GI-tagged, alongside neighbouring UP specialties like Lucknow Chikankari and Bhadohi Carpets.",
  ] },
  amritsar: { slug: 'amritsar', name: 'Amritsar', state: 'Punjab', stateCode: 'PB', industries: 'textiles, tourism, food processing, carpets, pharmaceuticals', context: 'Amritsar is Punjab\'s religious and cultural capital and a major commercial hub near the Pakistan border. Its textile, food processing, and tourism businesses need trademark registration to protect brands in these competitive sectors.', lat: 31.6340, lng: 74.8723, localInsights: [
    "The Golden Temple's Guru Ka Langar is the world's largest free community kitchen, feeding 50,000-100,000 people daily using a roti-making machine capable of 25,000 rotis an hour.",
    "That volume of pilgrim traffic feeds a large local food-processing trade, from Amritsari Papad Wadiyan makers to the city's well-known kulcha and food brands.",
  ] },
  jalandhar: { slug: 'jalandhar', name: 'Jalandhar', state: 'Punjab', stateCode: 'PB', industries: 'sports goods, textiles, leather, furniture, hardware', context: 'Jalandhar is the world\'s sports goods capital, producing over 80% of India\'s sports equipment exports. With significant international buyers and competing manufacturers, brand protection through trademark registration is essential for any Jalandhar business.', lat: 31.3260, lng: 75.5762, localInsights: [
    "Jalandhar and Meerut together account for roughly 82% of India's domestic sports goods production, across more than 38,200 manufacturing units.",
    "The Jalandhar cluster alone exports an estimated USD 50 million in sports goods annually — cricket bats, hockey sticks, boxing gear — and employs upwards of 500,000 people between the two hubs.",
  ] },
  jodhpur: { slug: 'jodhpur', name: 'Jodhpur', state: 'Rajasthan', stateCode: 'RJ', industries: 'handicrafts, textiles, tourism, agro-processing, furniture', context: 'Jodhpur is the Blue City of Rajasthan and a major centre for handicrafts, antique furniture, and textile exports. With international buyers from Europe and the USA, Jodhpur businesses need trademark protection to prevent brand copying.', lat: 26.2389, lng: 73.0243, localInsights: [
    "Jodhpur's furniture and handicraft export cluster counts over 3,000 exporters and 150,000+ artisans, accounting for close to 60% of Rajasthan's total handicraft exports.",
    "The city is also a major processing hub for guar gum — a key export ingredient used worldwide in food and industrial applications.",
  ] },
  varanasi: { slug: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', stateCode: 'UP', industries: 'silk, handicrafts, tourism, FMCG, education', context: 'Varanasi is the silk weaving capital of India and one of the world\'s oldest living cities. Banarasi silk and handicrafts face significant copying problems — trademark registration is essential for weavers and artisans protecting their identity.', lat: 25.3176, lng: 82.9739, localInsights: [
    "Banarasi silk sarees have carried a GI tag since 2009, legally restricting the name to sarees actually woven in the Varanasi region — a direct precedent for how trademark protection works for a brand name.",
    "Around 100,000 weavers, most from the Muslim Ansari community, keep alive a weaving tradition that traces back roughly 2,000 years in one of the world's oldest continuously inhabited cities.",
  ] },
  dehradun: { slug: 'dehradun', name: 'Dehradun', state: 'Uttarakhand', stateCode: 'UK', industries: 'education, IT, tourism, FMCG, pharmaceuticals', context: 'Dehradun is Uttarakhand\'s capital and a rapidly growing city with a strong education sector and emerging IT and pharmaceutical industries. As businesses grow from local to national, trademark registration becomes a key priority.', lat: 30.3165, lng: 78.0322, localInsights: [
    "Dehraduni Basmati is one of the most prized Basmati varieties, and India's Basmati GI tag (granted in 2010) exists largely because a US company once tried to patent Basmati rice — a direct precedent for why registering names matters.",
    "The city hosts the Indian Military Academy, the Forest Research Institute and the Wadia Institute of Himalayan Geology, giving it an outsized concentration of national research and training institutions.",
  ] },
  mysore: { slug: 'mysore', name: 'Mysore', state: 'Karnataka', stateCode: 'KA', industries: 'silk, sandalwood, tourism, IT, FMCG', context: 'Mysore is famous for its silk, sandalwood products, and tourism industry. With globally recognised products at risk of counterfeiting, trademark registration is critical for Mysore businesses protecting their GI-associated brands.', lat: 12.2958, lng: 76.6394, localInsights: [
    "Mysore Silk was Karnataka's first GI-tagged product (2005), and Mysore Sandal Soap remains the only soap in the world made from 100% pure sandalwood oil.",
    "18 separate products from the Mysuru region now carry GI tags — one of the densest concentrations of protected regional brands anywhere in India.",
  ] },
  thiruvananthapuram: { slug: 'thiruvananthapuram', name: 'Thiruvananthapuram', state: 'Kerala', stateCode: 'KL', industries: 'IT, tourism, healthcare, education, handicrafts', context: 'Thiruvananthapuram is Kerala\'s capital and a growing IT and healthcare hub. With Technopark as one of India\'s largest IT parks, tech startups and service businesses increasingly need trademark protection as they scale.', lat: 8.5241, lng: 76.9366, localInsights: [
    "Technopark, established in 1995, was India's first IT park and now hosts close to 486 companies employing around 72,000 people.",
    "The Vikram Sarabhai Space Centre on the city's outskirts launched India's first-ever rocket in 1963, making Thiruvananthapuram the birthplace of the country's space programme.",
  ] },
  mangalore: { slug: 'mangalore', name: 'Mangalore', state: 'Karnataka', stateCode: 'KA', industries: 'chemicals, seafood, cashew, banking, education', context: 'Mangalore is a major port city and commercial hub in coastal Karnataka. With significant chemical exports, seafood processing, and cashew industries, brand protection is essential for Mangalore businesses competing in international markets.', lat: 12.9141, lng: 74.8560, localInsights: [
    "New Mangalore Port, India's ninth major port (inaugurated 1975), handles an estimated 75% of India's coffee and cashew exports.",
    "Mangalore Refinery and Petrochemicals Limited (MRPL), an ONGC subsidiary based here, has a design capacity of 15 million metric tonnes a year.",
  ] },
  nashik: { slug: 'nashik', name: 'Nashik', state: 'Maharashtra', stateCode: 'MH', industries: 'wine, grapes, pharmaceuticals, engineering, FMCG', context: 'Nashik is India\'s wine capital and a major pharmaceutical and engineering hub. With premium food and beverage brands at constant risk of copying, trademark registration is a necessity for Nashik\'s growing branded goods sector.', lat: 19.9975, lng: 73.7898, localInsights: [
    "Nashik is home to 52 wineries, including Sula Vineyards — India's first, opened in 1999 — and is widely known as the country's Wine Capital.",
    "The district alone accounts for roughly 55% of India's total grape exports, thanks to a February-April harvest window that lets its grapes hit European markets in their off-season.",
  ] },
  aurangabad: { slug: 'aurangabad', name: 'Aurangabad', state: 'Maharashtra', stateCode: 'MH', industries: 'automobiles, pharmaceuticals, textiles, tourism', context: 'Aurangabad is Maharashtra\'s fastest-growing industrial city and home to major automobile manufacturers like Bajaj and Skoda. With significant manufacturing and pharma exports, protecting brand names and product marks is essential.', lat: 19.8762, lng: 75.3433, localInsights: [
    "The Waluj MIDC industrial zone alone spans nearly 1,300 hectares and hosts Bajaj Auto, Skoda, and pharma majors like Cipla and Mylan.",
    "The city is the gateway to two separate UNESCO World Heritage Sites — the Ajanta Caves (2nd century BC-6th century AD) and Ellora Caves (6th-11th century AD).",
  ] },
  bhubaneswar: { slug: 'bhubaneswar', name: 'Bhubaneswar', state: 'Odisha', stateCode: 'OD', industries: 'IT, steel, mining, tourism, handicrafts', context: 'Bhubaneswar is Odisha\'s capital and a rapidly growing IT and government hub. As the city\'s startup ecosystem matures and traditional businesses professionalise, trademark registration protects the brands businesses spend years building.', lat: 20.2961, lng: 85.8245, localInsights: [
    "Known as the 'Temple City of India,' Bhubaneswar is still home to roughly 700 surviving ancient temples, including the 11th-century Lingaraj Temple with its 180-foot tower.",
    "Government-backed IT enclaves like Infocity have drawn Infosys, TCS and Wipro, with over 50 new IT companies setting up here in the last four years alone.",
  ] },
  raipur: { slug: 'raipur', name: 'Raipur', state: 'Chhattisgarh', stateCode: 'CG', industries: 'steel, mining, agriculture, FMCG, trading', context: 'Raipur is Chhattisgarh\'s capital and India\'s steel trading hub. With a concentration of steel producers, mineral traders, and agro-processors, brand protection ensures businesses maintain their competitive advantage in this resource-rich market.', lat: 21.2514, lng: 81.6296, localInsights: [
    "Just 24km from Raipur, the Bhilai Steel Plant is India's largest integrated steel plant and the country's sole producer of rails for Indian Railways.",
    "Raipur itself hosts the largest concentration of cement plants in Chhattisgarh, alongside its role as the state's primary steel trading centre.",
  ] },
  guwahati: { slug: 'guwahati', name: 'Guwahati', state: 'Assam', stateCode: 'AS', industries: 'tea, oil, FMCG, tourism, handicrafts', context: 'Guwahati is Northeast India\'s commercial gateway and a hub for tea, oil, and FMCG distribution. As the primary business city of the Northeast, trademark registration protects businesses from the growing problem of brand copying in this expanding market.', lat: 26.1445, lng: 91.7362, localInsights: [
    "The Guwahati Tea Auction Centre, established in 1970, handles the largest volume of CTC tea auctioned anywhere in the world.",
    "Guwahati Refinery, commissioned in 1962 and inaugurated by Jawaharlal Nehru, was India's first public-sector oil refinery.",
  ] },
  vijayawada: { slug: 'vijayawada', name: 'Vijayawada', state: 'Andhra Pradesh', stateCode: 'AP', industries: 'agriculture, FMCG, textiles, construction, education', context: 'Vijayawada is Andhra Pradesh\'s commercial capital and a major agriculture trade hub. With a fast-growing FMCG sector and expanding retail brands, trademark registration is increasingly important for businesses scaling from regional to national.', lat: 16.5062, lng: 80.6480, localInsights: [
    "Nearby Kondapalli's 400-year-old wooden toy-making tradition earned a GI tag in 2005, protecting the 'Kondapalli Toys' name for artisans in that one village.",
    "Sitting on the fertile Krishna river delta, Vijayawada is often called the 'Rice Bowl of Andhra Pradesh' and is the second-largest railway junction on the Indian Railways network.",
  ] },
  meerut: { slug: 'meerut', name: 'Meerut', state: 'Uttar Pradesh', stateCode: 'UP', industries: 'sports goods, scissors, sugarcane, education, FMCG', context: 'Meerut is globally known for sports goods, scissors, and musical instruments. With significant export activity and well-known product categories, businesses in Meerut need trademark protection to defend their brand identity in competitive markets.', lat: 28.9845, lng: 77.7064, localInsights: [
    "Meerut is India's largest hub for both scissors/cutlery and musical instruments, with some manufacturing families keeping the same instrument-making tradition alive for over 150 years.",
    "Alongside Jalandhar, Meerut's 3,500+ sports goods units contribute roughly 25% of India's total sports goods exports.",
  ] },
  prayagraj: { slug: 'prayagraj', name: 'Prayagraj', state: 'Uttar Pradesh', stateCode: 'UP', industries: 'education, government, FMCG, tourism, services', context: 'Prayagraj (Allahabad) is a major education and government hub in Uttar Pradesh. With a growing services sector and FMCG market, trademark registration helps local businesses protect their brands as they compete with national players.', lat: 25.4358, lng: 81.8463, localInsights: [
    "The 2025 Maha Kumbh Mela at Prayagraj's Triveni Sangam drew a record 660 million pilgrims over 45 days — the largest gathering of any kind in recorded history.",
    "Nicknamed the 'Oxford of the East' under British rule, the city still hosts the Allahabad High Court and institutions like Allahabad University and IIIT-Allahabad.",
  ] },
  ghaziabad: { slug: 'ghaziabad', name: 'Ghaziabad', state: 'Uttar Pradesh', stateCode: 'UP', industries: 'manufacturing, IT, FMCG, auto parts, chemicals', context: 'Ghaziabad is NCR\'s manufacturing hub, producing everything from electronic goods to auto parts and chemicals. As part of the Delhi-NCR market, businesses in Ghaziabad face intense competition and need trademark protection to secure their brand identity.', lat: 28.6692, lng: 77.4538, localInsights: [
    "The Sahibabad Industrial Area is one of NCR's most important manufacturing hubs, hosting Maruti Suzuki and a dense cluster of auto-component and electronics makers along the historic Grand Trunk Road.",
    "Ghaziabad's rapid post-independence industrial growth was driven partly by an influx of skilled refugee workers, building on its earlier reputation for metalworking and electronics.",
  ] },
  kota: { slug: 'kota', name: 'Kota', state: 'Rajasthan', stateCode: 'RJ', industries: 'education, coaching, chemicals, textiles, FMCG', context: 'Kota is India\'s coaching capital and a major petrochemical hub. Education businesses, coaching institutes, and chemical manufacturers in Kota increasingly need trademark registration to protect their brand from imitation and passing-off.', lat: 25.2138, lng: 75.8648, localInsights: [
    "Known as India's 'Coaching Capital,' Kota has drawn as many as 200,000+ students a year to its NEET and JEE test-prep institutes since the tradition began in the late 1980s.",
    "The Gadepan fertiliser complex near Kota, run by Chambal Fertilisers, produces around 2 million tonnes of urea annually, making it one of India's largest private-sector urea plants.",
  ] },
  goa: { slug: 'goa', name: 'Goa', state: 'Goa', stateCode: 'GA', industries: 'tourism, mining, food & beverage, real estate, handicrafts', context: 'Goa is India\'s premier tourism destination and a growing hub for premium food, beverage, and lifestyle brands. With international tourist footfall and high brand visibility, trademark registration protects Goa businesses from copying by imitators.', lat: 15.2993, lng: 74.1240, localInsights: [
    "Goan Feni received its own GI tag in 2025, placing it in the same legally-protected category as Scotch whisky and Champagne — a direct example of how geography and brand identity intertwine.",
    "Feni has been distilled in Goa since the 1600s using traditional clay-pot methods introduced alongside Portuguese-era cashew cultivation, during 450+ years of Portuguese rule that ended only in 1961.",
  ] },
  hubballi: { slug: 'hubballi', name: 'Hubballi', state: 'Karnataka', stateCode: 'KA', industries: 'agriculture, cotton, FMCG, engineering, trading', context: 'Hubballi-Dharwad is North Karnataka\'s commercial capital and a major cotton and agricultural trade hub. Growing retail and FMCG businesses in this region need trademark registration to protect their brands as they expand beyond local markets.', lat: 15.3647, lng: 75.1240, localInsights: [
    "Hubballi-Dharwad is Karnataka's second-largest urban agglomeration after Bangalore, and Hubballi has served as headquarters of the South Western Railway zone since the two cities' 1962 municipal merger.",
    "The neighbouring twin city of Dharwad gives its name to GI-tagged Dharwad Peda, a milk sweet whose name is legally protected the same way a registered trademark protects a brand.",
  ] },
  trichy: { slug: 'trichy', name: 'Trichy', state: 'Tamil Nadu', stateCode: 'TN', industries: 'textiles, engineering, education, FMCG, agriculture', context: 'Tiruchirapalli (Trichy) is Tamil Nadu\'s central commercial hub with a strong engineering and textile base. With significant manufacturing exports and a growing education sector, trademark registration is essential for businesses building recognisable brands.', lat: 10.7905, lng: 78.7047, localInsights: [
    "BHEL's Trichy plant manufactures high-pressure boilers, and the city accounts for an estimated 63% of India's boiler and windmill manufacturing and fabrication.",
    "Trichy is also home to the Srirangam Temple, a 156-acre Vaishnavite complex considered the largest functioning Hindu temple in the world.",
  ] },
  madurai: { slug: 'madurai', name: 'Madurai', state: 'Tamil Nadu', stateCode: 'TN', industries: 'textiles, jasmine, tourism, FMCG, engineering', context: 'Madurai is Tamil Nadu\'s cultural capital and a major textile and FMCG hub. Known for Madurai jasmine and handloom textiles, businesses in this city need trademark registration to protect their geographical indication-linked products from imitation.', lat: 9.9252, lng: 78.1198, localInsights: [
    "Madurai Malli jasmine has carried a GI tag since 2013, protecting a flower whose cultivation around the city traces back to at least 300 BCE.",
    "Nearly 2,500 years old, Madurai grew up around the Meenakshi Amman Temple, where jasmine offerings still feature in rituals performed six times a day.",
  ] },
  'navi-mumbai': { slug: 'navi-mumbai', name: 'Navi Mumbai', state: 'Maharashtra', stateCode: 'MH', industries: 'IT, chemicals, pharmaceuticals, logistics, retail', context: 'Navi Mumbai is a planned satellite city that has become a major IT and chemical hub. With JNPT port nearby and major corporate offices, businesses in Navi Mumbai need trademark protection to compete in both domestic and export markets.', lat: 19.0330, lng: 73.0297, localInsights: [
    "Developed since 1972 to decongest Mumbai, Navi Mumbai is often cited as the largest planned city in the world by area.",
    "Nearby JNPT (Nhava Sheva) handles roughly 65% of India's container traffic, and Vashi's APMC market is Asia's largest wholesale market for fruit and vegetables.",
  ] },
  thane: { slug: 'thane', name: 'Thane', state: 'Maharashtra', stateCode: 'MH', industries: 'manufacturing, chemicals, IT, FMCG, real estate', context: 'Thane is Mumbai\'s industrial neighbour and one of Maharashtra\'s fastest-growing cities. With a dense concentration of chemical plants, IT companies, and FMCG distributors, trademark registration is a key business requirement for Thane enterprises.', lat: 19.2183, lng: 72.9781, localInsights: [
    "Thane railway station was the terminus of India's very first passenger train, which ran from Bombay's Bori Bunder in 1853.",
    "Known as the 'City of Lakes' for the roughly 30 lakes within its limits, Thane also hosts major industrial estates like Wagle Estate MIDC alongside that natural landscape.",
  ] },
};

export function getCityData(slug: string): CityData | null {
  return CITY_DATA[slug.toLowerCase()] ?? null;
}

export const ALL_CITY_SLUGS = Object.keys(CITY_DATA);

export interface CityData {
  slug: string;
  name: string;
  state: string;
  stateCode: string;
  industries: string;
  context: string;
  lat: number;
  lng: number;
}

export const CITY_DATA: Record<string, CityData> = {
  ludhiana: {
    slug: 'ludhiana',
    name: 'Ludhiana',
    state: 'Punjab',
    stateCode: 'PB',
    industries: 'textiles, hosiery, bicycles, auto parts, pharmaceuticals',
    context: 'Ludhiana is India\'s largest industrial city in Punjab and a major hub for textiles, hosiery, bicycle manufacturing, and auto components. Protecting your brand in these competitive export-driven markets is essential.',
    lat: 30.9010,
    lng: 75.8573,
  },
  delhi: {
    slug: 'delhi',
    name: 'Delhi',
    state: 'Delhi',
    stateCode: 'DL',
    industries: 'fashion, FMCG, retail, technology, food & beverage',
    context: 'Delhi NCR is India\'s largest consumer market and a hub for fashion, retail, and fast-moving consumer goods. With thousands of new brands launching each year, trademark registration is critical to protecting your identity.',
    lat: 28.6139,
    lng: 77.2090,
  },
  mumbai: {
    slug: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    stateCode: 'MH',
    industries: 'finance, entertainment, FMCG, real estate, media',
    context: 'Mumbai is India\'s commercial capital and home to the Bombay Stock Exchange, Bollywood, and thousands of registered companies. Strong trademark protection is a business necessity in this high-competition market.',
    lat: 19.0760,
    lng: 72.8777,
  },
  bangalore: {
    slug: 'bangalore',
    name: 'Bangalore',
    state: 'Karnataka',
    stateCode: 'KA',
    industries: 'IT, SaaS, startups, aerospace, biotechnology',
    context: 'Bangalore is India\'s Silicon Valley and the birthplace of thousands of tech startups and SaaS companies every year. Registering your brand name and logo early protects you from impersonation and domain squatting.',
    lat: 12.9716,
    lng: 77.5946,
  },
  hyderabad: {
    slug: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    stateCode: 'TS',
    industries: 'pharmaceuticals, IT, biotechnology, food processing',
    context: 'Hyderabad is a major centre for pharmaceutical and life-sciences companies in India. Brand protection through trademark registration is especially important in regulated industries where reputation directly impacts business.',
    lat: 17.3850,
    lng: 78.4867,
  },
  pune: {
    slug: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    stateCode: 'MH',
    industries: 'automotive, IT, education, manufacturing, defence',
    context: 'Pune is one of India\'s fastest-growing cities with a strong automotive and IT sector. With a large startup ecosystem and established industrial base, securing your trademark early prevents costly disputes later.',
    lat: 18.5204,
    lng: 73.8567,
  },
  ahmedabad: {
    slug: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    stateCode: 'GJ',
    industries: 'textiles, chemicals, pharmaceuticals, diamond processing, FMCG',
    context: 'Ahmedabad is the commercial heart of Gujarat — India\'s most entrepreneur-friendly state. From textile exporters to chemical manufacturers and diamond traders, trademark protection ensures your brand is legally yours.',
    lat: 23.0225,
    lng: 72.5714,
  },
  chennai: {
    slug: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    stateCode: 'TN',
    industries: 'automobile, IT, manufacturing, healthcare, logistics',
    context: 'Chennai is India\'s automobile manufacturing capital and a growing IT hub. With global OEMs and tier-1 suppliers based here, protecting your brand and product names through trademark registration is essential.',
    lat: 13.0827,
    lng: 80.2707,
  },
  jaipur: {
    slug: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    stateCode: 'RJ',
    industries: 'handicrafts, gemstones, tourism, textiles, food & spices',
    context: 'Jaipur is renowned for its handicrafts, gemstone jewellery, blue pottery, and textile exports. Artisans and entrepreneurs in these industries are especially vulnerable to brand copying without proper trademark protection.',
    lat: 26.9124,
    lng: 75.7873,
  },
  chandigarh: {
    slug: 'chandigarh',
    name: 'Chandigarh',
    state: 'Chandigarh',
    stateCode: 'CH',
    industries: 'retail, healthcare, education, hospitality, real estate',
    context: 'Chandigarh is the capital of Punjab and Haryana and a rapidly growing commercial centre. As the gateway city to North India\'s economic corridor, registering your trademark here protects your brand across the entire region.',
    lat: 30.7333,
    lng: 76.7794,
  },
};

export function getCityData(slug: string): CityData | null {
  return CITY_DATA[slug.toLowerCase()] ?? null;
}

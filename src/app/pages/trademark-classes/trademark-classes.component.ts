import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../shared/services/seo.service';

export const TRADEMARK_CLASSES = [
  // Goods
  { num: 1, category: 'Goods', name: 'Chemicals', examples: 'Industrial chemicals, fertilisers, adhesives, photographic chemicals, unprocessed plastics' },
  { num: 2, category: 'Goods', name: 'Paints & Coatings', examples: 'Paints, varnishes, lacquers, rustproofing preparations, dyes, colorants' },
  { num: 3, category: 'Goods', name: 'Cosmetics & Cleaning', examples: 'Cosmetics, soaps, perfumes, shampoos, toothpaste, cleaning preparations' },
  { num: 4, category: 'Goods', name: 'Lubricants & Fuels', examples: 'Industrial oils, lubricants, fuels, candles, motor oils' },
  { num: 5, category: 'Goods', name: 'Pharmaceuticals', examples: 'Medicines, veterinary products, dietary supplements, sanitary preparations, disinfectants' },
  { num: 6, category: 'Goods', name: 'Metals & Hardware', examples: 'Common metals, metal building materials, pipes, cables, safes, locks' },
  { num: 7, category: 'Goods', name: 'Machinery', examples: 'Machines, machine tools, motors, engines (except for vehicles), agricultural implements' },
  { num: 8, category: 'Goods', name: 'Hand Tools', examples: 'Hand tools, cutlery, razors, manicure implements, silverware' },
  { num: 9, category: 'Goods', name: 'Electronics & Software', examples: 'Computers, smartphones, software, cameras, scientific apparatus, electronic components' },
  { num: 10, category: 'Goods', name: 'Medical Devices', examples: 'Surgical instruments, medical devices, orthopaedic articles, dental instruments' },
  { num: 11, category: 'Goods', name: 'Lighting & Appliances', examples: 'Lighting apparatus, heating equipment, refrigerators, air conditioners, water purifiers' },
  { num: 12, category: 'Goods', name: 'Vehicles', examples: 'Cars, motorcycles, bicycles, aircraft, marine vessels, vehicle parts' },
  { num: 13, category: 'Goods', name: 'Firearms & Explosives', examples: 'Firearms, ammunition, explosives, fireworks' },
  { num: 14, category: 'Goods', name: 'Jewellery & Watches', examples: 'Precious metals, jewellery, watches, clocks, gemstones' },
  { num: 15, category: 'Goods', name: 'Musical Instruments', examples: 'Musical instruments, musical accessories' },
  { num: 16, category: 'Goods', name: 'Paper & Stationery', examples: 'Paper, books, magazines, stationery, printing materials, office supplies' },
  { num: 17, category: 'Goods', name: 'Rubber & Plastics', examples: 'Rubber, gutta-percha, gum, asbestos, mica, semi-finished plastic goods, hoses, packing materials' },
  { num: 18, category: 'Goods', name: 'Leather Goods', examples: 'Leather, handbags, wallets, umbrellas, luggage, pet accessories' },
  { num: 19, category: 'Goods', name: 'Building Materials', examples: 'Non-metallic building materials, cement, bricks, tiles, glass, pipes for construction' },
  { num: 20, category: 'Goods', name: 'Furniture', examples: 'Furniture, mirrors, picture frames, wooden and plastic articles, bamboo products' },
  { num: 21, category: 'Goods', name: 'Household Items', examples: 'Kitchen utensils, glass and porcelain, brushes, cleaning equipment, cookware' },
  { num: 22, category: 'Goods', name: 'Ropes & Textiles (Raw)', examples: 'Ropes, string, nets, tents, sails, raw fibrous textile materials, stuffing materials' },
  { num: 23, category: 'Goods', name: 'Yarns & Threads', examples: 'Yarns, threads for textile use' },
  { num: 24, category: 'Goods', name: 'Textiles & Fabrics', examples: 'Textiles, bed linen, table linen, curtains, household textile articles' },
  { num: 25, category: 'Goods', name: 'Clothing & Footwear', examples: 'Clothing, footwear, headgear, sportswear, fashion accessories' },
  { num: 26, category: 'Goods', name: 'Lace & Embroidery', examples: 'Lace, embroidery, ribbons, buttons, pins, sewing accessories, artificial flowers' },
  { num: 27, category: 'Goods', name: 'Floor Coverings', examples: 'Carpets, rugs, mats, linoleum, wall hangings (non-textile)' },
  { num: 28, category: 'Goods', name: 'Toys & Sports Goods', examples: 'Toys, games, sporting articles, Christmas decorations, video game equipment' },
  { num: 29, category: 'Goods', name: 'Food — Animal Products', examples: 'Meat, fish, dairy products, eggs, processed vegetables, jams, oils and fats for food' },
  { num: 30, category: 'Goods', name: 'Food — Staples', examples: 'Coffee, tea, sugar, rice, flour, bread, biscuits, spices, sauces, chocolate, ice cream' },
  { num: 31, category: 'Goods', name: 'Agriculture & Live Animals', examples: 'Fresh fruits, vegetables, live animals, seeds, natural plants, animal food' },
  { num: 32, category: 'Goods', name: 'Beverages (Non-Alcoholic)', examples: 'Beer, mineral water, juices, soft drinks, energy drinks, non-alcoholic beverages' },
  { num: 33, category: 'Goods', name: 'Alcoholic Beverages', examples: 'Wine, spirits, whiskey, brandy, gin, rum (excluding beers)' },
  { num: 34, category: 'Goods', name: 'Tobacco', examples: 'Tobacco, cigarettes, cigars, matches, smokers\' articles' },
  // Services
  { num: 35, category: 'Services', name: 'Business & Retail Services', examples: 'Advertising, business management, retail services, e-commerce, import/export agency, market research' },
  { num: 36, category: 'Services', name: 'Financial & Insurance Services', examples: 'Banking, insurance, real estate, stock broking, financial advisory, payment services' },
  { num: 37, category: 'Services', name: 'Construction & Repair', examples: 'Building construction, repair, installation services, maintenance, plumbing, electrical work' },
  { num: 38, category: 'Services', name: 'Telecommunications', examples: 'Internet services, broadcasting, telephone, cable, satellite communication' },
  { num: 39, category: 'Services', name: 'Transport & Logistics', examples: 'Transportation, shipping, storage, travel agency, courier services, supply chain' },
  { num: 40, category: 'Services', name: 'Treatment of Materials', examples: 'Printing, food processing, recycling, metalworking, wood treatment, textile treatment' },
  { num: 41, category: 'Services', name: 'Education & Entertainment', examples: 'Education, training, sports activities, entertainment, publishing, cultural activities, OTT platforms' },
  { num: 42, category: 'Services', name: 'Technology & IT Services', examples: 'Software development, SaaS, IT consulting, cloud services, research, design, cybersecurity' },
  { num: 43, category: 'Services', name: 'Food & Hospitality', examples: 'Restaurants, hotels, cafes, catering, accommodation, food delivery, bars' },
  { num: 44, category: 'Services', name: 'Medical & Veterinary', examples: 'Medical services, veterinary services, beauty salons, agriculture, farming advisory' },
  { num: 45, category: 'Services', name: 'Legal & Security Services', examples: 'Legal services, security services, personal protection, social services, funeral services' },
];

@Component({
  selector: 'app-trademark-classes',
  imports: [RouterLink],
  templateUrl: './trademark-classes.component.html',
  styleUrl: './trademark-classes.component.scss',
})
export class TrademarkClassesComponent implements OnInit, OnDestroy {
  classes = TRADEMARK_CLASSES;
  goodsClasses = TRADEMARK_CLASSES.filter(c => c.category === 'Goods');
  servicesClasses = TRADEMARK_CLASSES.filter(c => c.category === 'Services');

  constructor(
    private title: Title,
    private meta: Meta,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Trademark Classes in India — All 45 Classes Explained | Trademarx');
    this.meta.updateTag({ name: 'description', content: 'Complete guide to all 45 trademark classes in India. Find the right Nice Classification for your goods or services before filing. Expert help from IP India authorised agents.' });
    this.meta.updateTag({ property: 'og:title', content: 'Trademark Classes in India — All 45 Classes | Trademarx' });
    this.meta.updateTag({ property: 'og:description', content: 'All 45 trademark classes in India explained with examples. Find the right class for your business before filing your trademark application.' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://trademarx.in/trademark-classes' });
    this.meta.updateTag({ property: 'og:image', content: 'https://trademarx.in/assets/images/trademarx.png' });
    this.seo.setCanonical('https://trademarx.in/trademark-classes');
    this.seo.injectJsonLd([
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://trademarx.in/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Trademark Registration', 'item': 'https://trademarx.in/trademark' },
          { '@type': 'ListItem', 'position': 3, 'name': 'Trademark Classes', 'item': 'https://trademarx.in/trademark-classes' },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': 'All 45 Trademark Classes in India — Complete Guide',
        'description': 'A comprehensive guide to all 45 trademark classes under the Nice Classification as used in India for trademark registration with IP India.',
        'author': { '@id': 'https://trademarx.in/#organization' },
        'publisher': { '@id': 'https://trademarx.in/#organization' },
        'url': 'https://trademarx.in/trademark-classes',
      },
    ], 'trademark-classes');
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd('trademark-classes');
    this.seo.removeCanonical();
  }
}

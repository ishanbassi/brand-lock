import { GuidePage, GuideSourceConfig } from './guide.model';
import { STATUS_GUIDES } from './status-guide-data';
import { USECASE_GUIDES } from './usecase-guide-data';

// Registry of guide clusters. The route supplies `data.source`, which selects the
// dataset, URL prefix, breadcrumb, and hub copy. Add a new cluster here + a route
// pair and it is fully wired (page, hub, schema, sitemap helper).

export const GUIDE_SOURCES: Record<string, GuideSourceConfig> = {

  status: {
    key: 'status',
    urlPrefix: '/trademark-status',
    breadcrumbLabel: 'Trademark Status',
    hubMetaTitle: 'Trademark Status Meanings — Every IP India Status Explained | Trademarx',
    hubMetaDesc: 'Confused by your trademark status? Plain-English meanings for every IP India registry status — Formalities Chk Pass, Objected, Opposed, Accepted & Advertised, Registered and more.',
    hubH1: 'Trademark Status Meanings — Every Registry Status Explained',
    hubIntro: 'Checked your trademark on the IP India portal and found a status you do not understand? This guide decodes every registry status in plain English — what it means, whether you need to act, and what happens next. Select your status below.',
    ctaWhatsappText: 'Hi%2C%20I%20need%20help%20understanding%20my%20trademark%20status',
    data: STATUS_GUIDES,
  },

  usecase: {
    key: 'usecase',
    urlPrefix: '/trademark-for',
    breadcrumbLabel: 'Trademark Guides',
    hubMetaTitle: 'How to Trademark Your Business — Guides by Business Type | Trademarx',
    hubMetaDesc: 'Step-by-step trademark guides for specific business types — home bakery, Instagram page, podcast, mobile app, NGO, YouTube channel. Find the right class and file from ₹1,499.',
    hubH1: 'Trademark Registration Guides by Business Type',
    hubIntro: 'Not sure which trademark class your business needs or how to protect your brand? These practical guides cover specific business types — from home bakeries to mobile apps — with the right class, cost, and a step-by-step filing process for each.',
    ctaWhatsappText: 'Hi%2C%20I%20want%20to%20register%20a%20trademark%20for%20my%20business',
    data: USECASE_GUIDES,
  },

};

export function getGuideSource(key: string): GuideSourceConfig | undefined {
  return GUIDE_SOURCES[key];
}

export function getGuidePage(sourceKey: string, slug: string): GuidePage | undefined {
  return GUIDE_SOURCES[sourceKey]?.data[slug];
}

/** Slugs for a cluster — used by the sitemap generator and hub. */
export function guideSlugs(sourceKey: string): string[] {
  const src = GUIDE_SOURCES[sourceKey];
  return src ? Object.keys(src.data) : [];
}

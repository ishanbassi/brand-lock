import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from './seo.service';

export interface AgentSeoPage {
  title: string;
  description: string;
  type?: 'website' | 'article';
  schemaType?: 'WebPage' | 'SoftwareApplication';
}

const AGENT_ORIGIN = 'https://agent.trademarx.in';
const OG_IMAGE = `${AGENT_ORIGIN}/assets/images/agent-portfolio-hero-v2.png`;
const SOCIAL_TAGS = [
  "property='og:type'",
  "property='og:site_name'",
  "property='og:title'",
  "property='og:description'",
  "property='og:url'",
  "property='og:image'",
  "property='og:image:alt'",
  "property='og:locale'",
  "name='twitter:card'",
  "name='twitter:title'",
  "name='twitter:description'",
  "name='twitter:url'",
  "name='twitter:image'",
  "name='twitter:image:alt'",
];

@Injectable({ providedIn: 'root' })
export class AgentSeoService {
  private active = false;

  constructor(
    private readonly meta: Meta,
    private readonly title: Title,
    private readonly seo: SeoService,
  ) {}

  apply(page: AgentSeoPage, routerUrl: string): void {
    this.active = true;
    const path = routerUrl.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/';
    const canonical = `${AGENT_ORIGIN}${path}`;

    this.title.setTitle(page.title);
    this.meta.updateTag({ name: 'description', content: page.description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow, max-image-preview:large' });
    this.meta.updateTag({ name: 'googlebot', content: 'index, follow, max-image-preview:large' });
    this.meta.updateTag({ property: 'og:type', content: page.type ?? 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Trademarx Agent Portal' });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({ property: 'og:image', content: OG_IMAGE });
    this.meta.updateTag({ property: 'og:image:alt', content: 'Trademarx Agent Portal for trademark professionals' });
    this.meta.updateTag({ property: 'og:locale', content: 'en_IN' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: page.title });
    this.meta.updateTag({ name: 'twitter:description', content: page.description });
    this.meta.updateTag({ name: 'twitter:url', content: canonical });
    this.meta.updateTag({ name: 'twitter:image', content: OG_IMAGE });
    this.meta.updateTag({ name: 'twitter:image:alt', content: 'Trademarx Agent Portal for trademark professionals' });
    this.seo.setCanonical(canonical);

    this.seo.removeJsonLd('agent-page');
    this.seo.removeJsonLd('agent-breadcrumbs');
    this.seo.injectJsonLd({
      '@context': 'https://schema.org',
      '@type': page.schemaType ?? 'WebPage',
      name: page.title,
      description: page.description,
      url: canonical,
      ...(page.schemaType === 'SoftwareApplication' ? {
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
      } : {}),
      isPartOf: {
        '@type': 'WebSite',
        name: 'Trademarx Agent Portal',
        url: AGENT_ORIGIN,
      },
      ...(path === '/agent-home' ? {} : {
        breadcrumb: { '@id': `${canonical}#agent-breadcrumbs` },
      }),
    }, 'agent-page');
    if (path !== '/agent-home') {
      this.seo.injectJsonLd({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        '@id': `${canonical}#agent-breadcrumbs`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Agent Portal',
            item: `${AGENT_ORIGIN}/agent-home`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: page.title,
            item: canonical,
          },
        ],
      }, 'agent-breadcrumbs');
    }
  }

  clear(noindex = false): void {
    if (this.active) {
      this.meta.removeTag("name='description'");
      this.meta.removeTag("name='robots'");
      this.meta.removeTag("name='googlebot'");
      for (const selector of SOCIAL_TAGS) this.meta.removeTag(selector);
      this.seo.removeJsonLd('agent-page');
      this.seo.removeJsonLd('agent-breadcrumbs');
      this.active = false;
    }
    if (noindex) {
      this.meta.removeTag("name='robots'");
      this.meta.removeTag("name='googlebot'");
      this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
      this.meta.updateTag({ name: 'googlebot', content: 'noindex, nofollow' });
    }
  }
}

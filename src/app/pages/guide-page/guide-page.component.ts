import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SeoService } from '../../shared/services/seo.service';
import { LeadFormComponent } from '../../lead-form/lead-form.component';
import { FaqComponent } from '../../faq/faq.component';
import { GuidePage, GuideSourceConfig } from './guide.model';
import { getGuidePage, getGuideSource } from './guide-sources';

@Component({
  selector: 'app-guide-page',
  imports: [LeadFormComponent, FaqComponent, RouterLink],
  templateUrl: './guide-page.component.html',
  styleUrl: './guide-page.component.scss',
})
export class GuidePageComponent implements OnInit, OnDestroy {
  page!: GuidePage;
  source!: GuideSourceConfig;
  relatedGuides: GuidePage[] = [];
  schemaId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private title: Title,
    private meta: Meta,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    const sourceKey = this.route.snapshot.data['source'] as string;
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    const source = getGuideSource(sourceKey);
    const data = source ? getGuidePage(sourceKey, slug) : undefined;

    if (!source || !data) {
      this.router.navigateByUrl('/not-found', { skipLocationChange: true });
      return;
    }

    this.source = source;
    this.page = data;
    this.relatedGuides = Object.values(source.data)
      .filter(p => p.slug !== slug && p.category === data.category)
      .slice(0, 3);
    this.schemaId = `guide-${sourceKey}-${slug}`;

    const pageUrl = `https://trademarx.in${source.urlPrefix}/${slug}`;

    this.title.setTitle(data.metaTitle);
    this.meta.updateTag({ name: 'description', content: data.metaDesc });
    this.meta.updateTag({ property: 'og:title', content: data.metaTitle });
    this.meta.updateTag({ property: 'og:description', content: data.metaDesc });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ property: 'og:url', content: pageUrl });
    this.meta.updateTag({ property: 'og:image', content: 'https://trademarx.in/assets/images/trademarx.png' });

    this.seo.setCanonical(pageUrl);
    this.seo.injectJsonLd([
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://trademarx.in/' },
          { '@type': 'ListItem', 'position': 2, 'name': source.breadcrumbLabel, 'item': `https://trademarx.in${source.urlPrefix}` },
          { '@type': 'ListItem', 'position': 3, 'name': data.title, 'item': pageUrl },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': data.title,
        'description': data.metaDesc,
        'author': { '@type': 'Organization', 'name': 'Trademarx', 'url': 'https://trademarx.in' },
        'publisher': {
          '@type': 'Organization',
          'name': 'Trademarx',
          'logo': { '@type': 'ImageObject', 'url': 'https://trademarx.in/assets/images/trademarx.png' },
        },
        'mainEntityOfPage': pageUrl,
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': data.faqs.map(f => ({
          '@type': 'Question',
          'name': f.question,
          'acceptedAnswer': { '@type': 'Answer', 'text': f.answer },
        })),
      },
    ], this.schemaId);
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd(this.schemaId);
    this.seo.removeCanonical();
  }
}

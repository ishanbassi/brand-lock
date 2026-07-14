import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SeoService } from '../../shared/services/seo.service';
import { GuidePage, GuideSourceConfig } from '../guide-page/guide.model';
import { getGuideSource } from '../guide-page/guide-sources';

interface GuideGroup {
  category: string;
  pages: GuidePage[];
}

@Component({
  selector: 'app-guide-hub',
  imports: [RouterLink],
  templateUrl: './guide-hub.component.html',
  styleUrl: './guide-hub.component.scss',
})
export class GuideHubComponent implements OnInit, OnDestroy {
  source!: GuideSourceConfig;
  groups: GuideGroup[] = [];
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
    const source = getGuideSource(sourceKey);

    if (!source) {
      this.router.navigateByUrl('/not-found', { skipLocationChange: true });
      return;
    }

    this.source = source;
    const grouped: Record<string, GuidePage[]> = {};
    for (const page of Object.values(source.data)) {
      (grouped[page.category] ??= []).push(page);
    }
    this.groups = Object.entries(grouped).map(([category, pages]) => ({ category, pages }));

    const pageUrl = `https://trademarx.in${source.urlPrefix}`;
    this.schemaId = `guide-hub-${sourceKey}`;

    this.title.setTitle(source.hubMetaTitle);
    this.meta.updateTag({ name: 'description', content: source.hubMetaDesc });
    this.meta.updateTag({ property: 'og:title', content: source.hubMetaTitle });
    this.meta.updateTag({ property: 'og:description', content: source.hubMetaDesc });
    this.meta.updateTag({ property: 'og:url', content: pageUrl });
    this.seo.setCanonical(pageUrl);

    this.seo.injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://trademarx.in/' },
        { '@type': 'ListItem', 'position': 2, 'name': source.breadcrumbLabel, 'item': pageUrl },
      ],
    }, this.schemaId);
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd(this.schemaId);
    this.seo.removeCanonical();
  }
}

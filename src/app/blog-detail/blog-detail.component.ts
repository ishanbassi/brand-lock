import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import dayjs from 'dayjs/esm';
import { environment } from '../../environments/environment';
import { BlogData } from '../../models/blog.model';
import { BlogMarkdownComponent } from '../blog-markdown/blog-markdown.component';
import { BlogService } from '../shared/services/blog-service.service';
import { SharedModule } from '../shared/shared.module';
import { SeoService } from '../shared/services/seo.service';

@Component({
  selector: 'app-blog-detail',
  imports: [RouterLink, SharedModule, BlogMarkdownComponent],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss'
})
export class BlogDetailComponent implements OnInit, OnDestroy {

  blog?: BlogData;
  blogBaseUrl = `${environment.BaseBlogUrl}`;
  baseUrl = `${environment.BaseUrl}`;
  collapsed = false;
  previewCount = 4;
  showAll = false;
  private isBrowser = false;

  get visibleToc() {
    return this.showAll ? this.toc : this.toc.slice(0, this.previewCount);
  }


  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private title: Title,
    private meta: Meta,
    private router: Router,
    private seo: SeoService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnDestroy(): void {
    this.seo.removeJsonLd('blog-post');
    this.seo.removeCanonical();
  }

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.blogService.getBlogBySlug(slug).subscribe(res => {
      this.blog = res?.data[0];

      const cmsImageUrl = this.blogBaseUrl + this.blog!.featuredImage.formats.small?.url;
      if (cmsImageUrl) {
        const proxiedUrl = `${this.baseUrl}/og-image-proxy?src=${encodeURIComponent(cmsImageUrl)}`;
        this.meta.updateTag({
          property: 'og:image',
          content: proxiedUrl
        });

        this.meta.updateTag({
          property: 'og:image:secure_url',
          content: proxiedUrl
        });
      }


      if (!this.blog) return;
      this.blog = this.convertDateFromServer(this.blog);
      // SEO
      this.title.setTitle(this.blog.title);
      this.meta.updateTag({ name: 'description', content: this.blog.excerpt });
      this.meta.updateTag({
        property: 'og:title',
        content: this.blog.title
      });

      this.meta.updateTag({
        property: 'og:description',
        content: this.blog.excerpt
      });



      if (this.blog.featuredImage.formats.small?.mime) {
        this.meta.updateTag({
          property: 'og:image:type',
          content: this.blog.featuredImage.formats.small?.mime
        });
      }
      if (this.blog.featuredImage.formats.small?.width) {
        this.meta.updateTag({
          property: 'og:image:width',
          content: this.blog.featuredImage.formats.small.width.toString()
        });
      }
      if (this.blog.featuredImage.formats.small?.height) {
        this.meta.updateTag({
          property: 'og:image:height',
          content: this.blog.featuredImage.formats.small.height.toString()
        });

      }

      this.meta.updateTag({
        property: 'og:type',
        content: 'article'
      });

      const slug = this.route.snapshot.paramMap.get('slug')!;
      const canonicalUrl = `https://trademarx.in/blogs/${slug}`;
      this.seo.setCanonical(canonicalUrl);
      this.meta.updateTag({ property: 'og:url', content: canonicalUrl });

      const imageUrl = this.blogBaseUrl + (this.blog.featuredImage?.url ?? '');
      this.seo.injectJsonLd({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': this.blog.title,
        'description': this.blog.excerpt,
        'image': imageUrl,
        'url': canonicalUrl,
        'datePublished': this.blog.createdAt?.toISOString(),
        'dateModified': this.blog.updatedAt?.toISOString(),
        'author': {
          '@type': 'Person',
          'name': this.blog.author || 'Trademarx',
          'url': 'https://trademarx.in/about-us'
        },
        'publisher': {
          '@type': 'Organization',
          '@id': 'https://trademarx.in/#organization',
          'name': 'Trademarx - Bassi & Associates',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://trademarx.in/assets/images/trademarx.png'
          }
        },
        'mainEntityOfPage': { '@type': 'WebPage', '@id': canonicalUrl }
      }, 'blog-post');

    });
  }

  convertDateFromServer(blog: BlogData): BlogData {
    return {
      ...blog,
      createdAt: blog.createdAt ? dayjs(blog.createdAt) : undefined,
      updatedAt: blog.updatedAt ? dayjs(blog.updatedAt) : undefined,
    }
  }

  slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  toc: { id: string; text: string; level: number, active?: boolean, expanded: boolean; children: any[] }[] = [];

  buildTOC() {
    this.toc = [];

    const headings = document.querySelectorAll(
      '.blog-content h2, .blog-content h3'
    );

    let currentParent: any = null;

    headings.forEach((heading: Element) => {
      const text = heading.textContent?.trim() || '';
      if (!text) return;

      const id = this.slugify(text);
      heading.setAttribute('id', id);

      const level = heading.tagName === 'H2' ? 2 : 3;

      if (level === 2) {
        // New parent item
        currentParent = {
          id,
          text,
          level: 2,
          expanded: true,
          children: []
        };

        this.toc.push(currentParent);
      }

      if (level === 3 && currentParent) {
        // Child of last H2
        currentParent.children.push({
          id,
          text,
          level: 3
        });
      }
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    for (const item of this.toc) {
      const section = document.getElementById(item.id);
      if (!section) continue;

      const rect = section.getBoundingClientRect();
      item['active'] = rect.top >= 0 && rect.top < 200;
    }
  }


  onMarkdownReady() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.buildTOC();
  }




}
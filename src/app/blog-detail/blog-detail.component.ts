import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, HostListener, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import dayjs from 'dayjs/esm';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';
import { BlogData } from '../../models/blog.model';
import { BlogMarkdownComponent } from '../blog-markdown/blog-markdown.component';
import { BlogService } from '../shared/services/blog-service.service';
import { SharedModule } from '../shared/shared.module';
import { SeoService } from '../shared/services/seo.service';
import { LeadFormComponent } from '../lead-form/lead-form.component';
import { ServiceType } from '../../models/service-order.model';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';

const WORDS_PER_MINUTE = 200;

@Component({
  selector: 'app-blog-detail',
  imports: [RouterLink, SharedModule, BlogMarkdownComponent, LeadFormComponent, SkeletonComponent],
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
  mobileTocOpen = false;
  readProgress = 0;
  showBackToTop = false;
  canNativeShare = false;
  relatedBlogs: BlogData[] = [];
  lightboxImage: { src: string; alt: string } | null = null;
  private isBrowser = false;

  get visibleToc() {
    return this.showAll ? this.toc : this.toc.slice(0, this.previewCount);
  }

  get readTimeMinutes(): number {
    const words = (this.blog?.content || '').trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  }

  get authorInitials(): string {
    const name = this.blog?.author || 'Trademarx';
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('');
  }

  get shareUrl(): string {
    const slug = this.route.snapshot.paramMap.get('slug') || '';
    return `https://trademarx.in/blogs/${slug}`;
  }

  get shareTitle(): string {
    return this.blog?.title || '';
  }

  /**
   * Derives the service funnel a blog reader should enter when they submit the
   * aside lead form. Uses the campaign block's CTA link / blog category as hints
   * so an ISO article routes to ISO checkout, an IEC article to IEC, etc.,
   * falling back to trademark registration.
   */
  get leadServiceType(): ServiceType {
    const hint = `${this.blog?.campaignBlock?.ctaLink ?? ''} ${this.blog?.category ?? ''}`.toLowerCase();
    if (hint.includes('iso')) return 'ISO';
    if (hint.includes('iec') || hint.includes('import') || hint.includes('export')) return 'IEC';
    if (hint.includes('msme') || hint.includes('udyam')) return 'MSME';
    if (hint.includes('renewal')) return 'TRADEMARK_RENEWAL';
    if (hint.includes('objection')) return 'TRADEMARK_OBJECTION';
    if (hint.includes('opposition')) return 'TRADEMARK_OPPOSITION';
    return 'TRADEMARK_REGISTRATION';
  }

  toggleMobileToc() {
    this.mobileTocOpen = !this.mobileTocOpen;
  }

  closeMobileToc() {
    this.mobileTocOpen = false;
  }


  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private title: Title,
    private meta: Meta,
    private router: Router,
    private seo: SeoService,
    private toastr: ToastrService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.canNativeShare = this.isBrowser && !!(navigator as any)?.share;
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

      this.loadRelatedBlogs(this.blog.category, slug);

    });
  }

  loadRelatedBlogs(category: string, currentSlug: string) {
    this.blogService.getLatestBlogsByCategory(4, category).subscribe(res => {
      this.relatedBlogs = (res?.data || [])
        .filter((b: BlogData) => b.slug !== currentSlug)
        .slice(0, 3);
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

      for (const child of item.children) {
        const childSection = document.getElementById(child.id);
        if (!childSection) continue;
        const childRect = childSection.getBoundingClientRect();
        child['active'] = childRect.top >= 0 && childRect.top < 200;
      }
    }

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    this.readProgress = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0;
    this.showBackToTop = scrollTop > 600;
  }

  scrollToTop() {
    if (!this.isBrowser) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Opens the image lightbox and pushes a throwaway history entry so the
   * device/browser back gesture closes the overlay instead of navigating
   * away from the article. Switching to a different image while the
   * lightbox is already open reuses that same entry.
   */
  openLightbox(src?: string, alt?: string) {
    if (!src) return;
    const wasOpen = !!this.lightboxImage;
    this.lightboxImage = { src, alt: alt || '' };
    if (this.isBrowser && !wasOpen) {
      history.pushState({ blogLightbox: true }, '');
    }
  }

  closeLightbox(fromPopState = false) {
    if (!this.lightboxImage) return;
    this.lightboxImage = null;
    if (this.isBrowser && !fromPopState) {
      history.back();
    }
  }

  @HostListener('window:popstate')
  onPopState() {
    if (this.lightboxImage) {
      this.closeLightbox(true);
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.closeLightbox();
  }

  onMarkdownReady() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.buildTOC();
  }

  shareOn(network: 'twitter' | 'linkedin' | 'whatsapp') {
    if (!this.isBrowser) return;
    const url = encodeURIComponent(this.shareUrl);
    const text = encodeURIComponent(this.shareTitle);
    const links: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`,
    };
    window.open(links[network], '_blank', 'noopener,noreferrer,width=600,height=600');
  }

  nativeShare() {
    if (!this.isBrowser || !(navigator as any)?.share) return;
    (navigator as any).share({ title: this.shareTitle, url: this.shareUrl }).catch(() => { });
  }

  copyLink() {
    if (!this.isBrowser) return;
    navigator.clipboard.writeText(this.shareUrl).then(() => {
      this.toastr.success('Link copied to clipboard');
    });
  }


}
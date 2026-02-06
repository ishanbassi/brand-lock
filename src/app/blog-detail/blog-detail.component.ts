import { AfterViewInit, Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MarkdownComponent } from 'ngx-markdown';
import { BlogService } from '../shared/services/blog-service.service';
import { Meta, Title } from '@angular/platform-browser';
import { Blog, BlogData, CampaignBlock } from '../../models/blog.model';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { FooterComponent } from '../footer/footer.component';
import { environment } from '../../environments/environment';
import dayjs from 'dayjs/esm';
import { SharedModule } from '../shared/shared.module';
import { RecentPostsComponent } from '../recent-posts/recent-posts.component';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { BlogMarkdownComponent } from '../blog-markdown/blog-markdown.component';
import { FooterV2Component } from '../footer-v2/footer-v2.component';
import { NavbarV2Component } from '../navbar-v2/navbar-v2.component';
import { TopHeaderComponent } from '../top-header/top-header.component';

@Component({
  selector: 'app-blog-detail',
  imports: [DashboardHeaderComponent, FooterComponent, RouterLink, SharedModule, RecentPostsComponent, BlogMarkdownComponent, TopHeaderComponent, NavbarV2Component, FooterV2Component],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss'
})
export class BlogDetailComponent implements OnInit {

  blog?: BlogData;
  blogBaseUrl = `${environment.BaseBlogUrl}`;
  collapsed=false;
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
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { 
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.blogService.getBlogBySlug(slug).subscribe(res => {
      this.blog = res?.data[0];
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
      
      this.meta.updateTag({
        property: 'og:image',
        content: this.blogBaseUrl+this.blog.featuredImage.url
      });

      this.meta.updateTag({
        property: 'og:type',
        content: 'article'
      });
      if (isPlatformBrowser(this.platformId)){
          const url = this.document.location.href;
          this.meta.updateTag({
          property: 'og:url',
          content: url
        });

      };

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

  toc: { id: string; text: string; level: number, active?: boolean, expanded:boolean; children:any[] }[] = [];

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
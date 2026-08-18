import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import dayjs from 'dayjs/esm';
import { environment } from '../../environments/environment';
import { Blog } from '../../models/blog.model';
import { RecentPostsComponent } from '../recent-posts/recent-posts.component';
import { BlogService } from '../shared/services/blog-service.service';
import { SharedModule } from '../shared/shared.module';
import { ActivatedRoute } from '@angular/router';
import { FirmBannerComponent } from '../firm-banner/firm-banner.component';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';


@Component({
  selector: 'app-blog-list',
  imports: [SharedModule,RecentPostsComponent, FirmBannerComponent, SkeletonComponent],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss'
})
export class BlogListComponent implements OnInit{

    blogs?: Blog;
    blogBaseUrl = `${environment.BaseBlogUrl}`;
    currentPage = 1;
    pageSize = 20;
    totalPages = 0;
    pages: number[] = [];
    readonly blogSkeletons = Array.from({ length: 6 });





  constructor(
    private blogService: BlogService,
    private title:Title,
    private meta:Meta,
    private route: ActivatedRoute
  ) {}


   ngOnInit() {
    this.route.queryParams.subscribe(params => {
    const page = params['page'] ? +params['page'] : 1;
      this.loadBlogsByPage(page);
    });

          // SEO
      this.title.setTitle("Trademark Registration Guides & Tips | Trademarx Blog");
      this.meta.updateTag({ name: 'description', content: "Expert guides on trademark registration, IP protection, and business compliance in India. Free resources to help you search, file, and protect your brand." });
      this.meta.updateTag({
        property: 'og:title',
        content: "Trademark Registration Guides & Tips | Trademarx Blog"
      });

      this.meta.updateTag({
        property: 'og:description',
        content: "Expert guides on trademark registration, IP protection, and business compliance in India. Free resources to help you search, file, and protect your brand."
      });


      this.meta.updateTag({
        property: 'og:image',
        content: '/assets/images/services.jpg'
      });
      
      this.meta.updateTag({
        property: 'og:image:secure_url',
        content: '/assets/images/services.jpg'
      });
      this.meta.updateTag({
          property: 'og:image:width',
          content: '1536'
        });
        this.meta.updateTag({
          property: 'og:image:height',
          content: '1024'
        });
      
      
        

      

      this.meta.updateTag({
        property: 'og:type',
        content: 'article'
      });
  }
     convertDateFromServer(blog: Blog): Blog {
      blog.data = blog.data.map(d => {
        return {
          ...d,
          createdAt: d.createdAt ? dayjs(d.createdAt) : undefined,
          updatedAt:d.updatedAt ? dayjs(d.updatedAt) : undefined,
        }
      })
      return blog

    }

    loadBlogsByPage(page:number){
      this.currentPage = page;
      this.blogService.getBlogsByPage(this.currentPage,this.pageSize)
      .subscribe(res => {
        this.blogs = this.convertDateFromServer(res);
         const pagination = res.meta.pagination;
        this.totalPages = pagination.pageCount;
        this.pages = Array.from(
          { length: this.totalPages },
          (_, i) => i + 1
        );
      })
    }

}
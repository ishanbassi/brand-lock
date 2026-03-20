import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import dayjs from 'dayjs/esm';
import { environment } from '../../environments/environment';
import { Blog } from '../../models/blog.model';
import { FooterV2Component } from '../footer-v2/footer-v2.component';
import { NavbarV2Component } from '../navbar-v2/navbar-v2.component';
import { RecentPostsComponent } from '../recent-posts/recent-posts.component';
import { BlogService } from '../shared/services/blog-service.service';
import { SharedModule } from '../shared/shared.module';
import { TopHeaderComponent } from '../top-header/top-header.component';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-blog-list',
  imports: [SharedModule,RecentPostsComponent,TopHeaderComponent, NavbarV2Component, FooterV2Component],
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
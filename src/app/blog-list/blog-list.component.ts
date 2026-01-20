import { Component, OnInit } from '@angular/core';
import { BlogService } from '../shared/services/blog-service.service';
import { Meta, Title } from '@angular/platform-browser';
import { Blog } from '../../models/blog.model';
import { SharedModule } from '../shared/shared.module';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { environment } from '../../environments/environment';
import dayjs from 'dayjs/esm';
import { RecentPostsComponent } from '../recent-posts/recent-posts.component';


@Component({
  selector: 'app-blog-list',
  imports: [SharedModule, DashboardHeaderComponent, FooterComponent,RecentPostsComponent],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss'
})
export class BlogListComponent implements OnInit{

    blogs?: Blog;
    blogBaseUrl = `${environment.BaseBlogUrl}`;
    currentPage = 1;
    pageSize = 6;
    totalPages = 0;
    pages: number[] = [];





  constructor(
    private blogService: BlogService,
    private title:Title,
    private meta:Meta
  ) {}


   ngOnInit() {
      this.loadBlogsByPage(1);
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
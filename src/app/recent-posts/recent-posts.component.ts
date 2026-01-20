import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { Blog } from '../../models/blog.model';
import { BlogService } from '../shared/services/blog-service.service';
import dayjs from 'dayjs/esm';
import { SharedModule } from '../shared/shared.module';

@Component({
  selector: 'app-recent-posts',
  imports: [SharedModule],
  templateUrl: './recent-posts.component.html',
  styleUrl: './recent-posts.component.scss'
})
export class RecentPostsComponent implements OnInit{

    blogs?: Blog;
    blogBaseUrl = `${environment.BaseBlogUrl}`;
    currentPage = 1;
    pageSize = 6;
    totalPages = 0;
    pages: number[] = [];





  constructor(
    private blogService: BlogService,
  ) {}

  ngOnInit(): void {
    this.blogService.getLatestBlogs(3).subscribe(res => this.blogs = this.convertDateFromServer(res));
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



}

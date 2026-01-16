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


@Component({
  selector: 'app-blog-list',
  imports: [SharedModule, DashboardHeaderComponent, FooterComponent],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss'
})
export class BlogListComponent implements OnInit{

    blogs?: Blog;
    blogBaseUrl = `${environment.BaseBlogUrl}`;


  constructor(
    private blogService: BlogService,
    private title:Title,
    private meta:Meta
  ) {}


   ngOnInit() {
    this.blogService.getBlogs().subscribe(data => {
      console.log(data)
      this.blogs = this.convertDateFromServer(data);
      console.log(this.blogs)
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

}
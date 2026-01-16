import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MarkdownComponent } from 'ngx-markdown';
import { BlogService } from '../shared/services/blog-service.service';
import { Meta, Title } from '@angular/platform-browser';
import { Blog } from '../../models/blog.model';

@Component({
  selector: 'app-blog-detail',
  imports: [MarkdownComponent],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss'
})
export class BlogDetailComponent implements OnInit {
  blog?: Blog;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private title: Title,
    private meta: Meta
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;

    this.blogService.getBlogBySlug(slug).subscribe(blog => {
      this.blog = blog;

      // SEO
      this.title.setTitle(blog.title);
      this.meta.updateTag({ name: 'description', content: blog.summary });
    });
  }
}
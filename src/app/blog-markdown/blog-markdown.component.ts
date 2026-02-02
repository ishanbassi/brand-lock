import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';
import { BlogData } from '../../models/blog.model';

@Component({
  selector: 'app-blog-markdown',
  imports: [MarkdownComponent],
  templateUrl: './blog-markdown.component.html',
  styleUrl: './blog-markdown.component.scss'
})
export class BlogMarkdownComponent {

  @Input()
  blog?: BlogData;

  @Output()
  markdownReady:EventEmitter<boolean> = new EventEmitter();

  onMarkdownReady() {
    this.markdownReady.emit(true);
  }

}

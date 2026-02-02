import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogMarkdownComponent } from './blog-markdown.component';

describe('BlogMarkdownComponent', () => {
  let component: BlogMarkdownComponent;
  let fixture: ComponentFixture<BlogMarkdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogMarkdownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogMarkdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

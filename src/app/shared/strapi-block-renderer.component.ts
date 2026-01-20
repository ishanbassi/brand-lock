
// strapi-blocks-renderer.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface StrapiBlock {
  type: string;
  children?: StrapiNode[];
  level?: number;
  format?: 'ordered' | 'unordered';
  image?: {
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
  };
  url?: string;
}

export interface StrapiNode {
  type: 'text' | 'link';
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  url?: string;
  children?: StrapiNode[];
}

@Component({
  selector: 'strapi-blocks-renderer',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .strapi-blocks-content {
      line-height: 1.6;
    }
    .strapi-blocks-content p {
      margin: 1em 0;
    }
    .strapi-blocks-content h1 { font-size: 2em; margin: 0.67em 0; font-weight: bold; }
    .strapi-blocks-content h2 { font-size: 1.5em; margin: 0.75em 0; font-weight: bold; }
    .strapi-blocks-content h3 { font-size: 1.17em; margin: 0.83em 0; font-weight: bold; }
    .strapi-blocks-content h4 { font-size: 1em; margin: 1.12em 0; font-weight: bold; }
    .strapi-blocks-content h5 { font-size: 0.83em; margin: 1.5em 0; font-weight: bold; }
    .strapi-blocks-content h6 { font-size: 0.75em; margin: 1.67em 0; font-weight: bold; }
    .strapi-blocks-content ul, .strapi-blocks-content ol {
      margin: 1em 0;
      padding-left: 2em;
    }
    .strapi-blocks-content blockquote {
      margin: 1em 0;
      padding-left: 1em;
      border-left: 4px solid #ccc;
      color: #666;
    }
    .strapi-blocks-content pre {
      background: #f4f4f4;
      padding: 1em;
      border-radius: 4px;
      overflow-x: auto;
    }
    .strapi-blocks-content code {
      background: #f4f4f4;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: monospace;
    }
    .strapi-blocks-content img {
      max-width: 100%;
      height: auto;
    }
  `],
  template: `
    <div class="strapi-blocks-content">
      <ng-container *ngFor="let block of blocks">
        <ng-container [ngSwitch]="block.type">
          
          <p *ngSwitchCase="'paragraph'">
            <ng-container *ngTemplateOutlet="renderChildren; context: { children: block.children }"></ng-container>
          </p>

          <h1 *ngSwitchCase="'heading'" [hidden]="block.level !== 1">
            <ng-container *ngTemplateOutlet="renderChildren; context: { children: block.children }"></ng-container>
          </h1>
          
          <h2 *ngSwitchCase="'heading'" [hidden]="block.level !== 2">
            <ng-container *ngTemplateOutlet="renderChildren; context: { children: block.children }"></ng-container>
          </h2>

          <h3 *ngSwitchCase="'heading'" [hidden]="block.level !== 3">
            <ng-container *ngTemplateOutlet="renderChildren; context: { children: block.children }"></ng-container>
          </h3>

          <h4 *ngSwitchCase="'heading'" [hidden]="block.level !== 4">
            <ng-container *ngTemplateOutlet="renderChildren; context: { children: block.children }"></ng-container>
          </h4>

          <h5 *ngSwitchCase="'heading'" [hidden]="block.level !== 5">
            <ng-container *ngTemplateOutlet="renderChildren; context: { children: block.children }"></ng-container>
          </h5>

          <h6 *ngSwitchCase="'heading'" [hidden]="block.level !== 6">
            <ng-container *ngTemplateOutlet="renderChildren; context: { children: block.children }"></ng-container>
          </h6>

          <ul *ngSwitchCase="'list'" [hidden]="block.format !== 'unordered'">
            <li *ngFor="let item of block.children">
              <ng-container *ngTemplateOutlet="renderChildren; context: { children: item.children }"></ng-container>
            </li>
          </ul>

          <ol *ngSwitchCase="'list'" [hidden]="block.format !== 'ordered'">
            <li *ngFor="let item of block.children">
              <ng-container *ngTemplateOutlet="renderChildren; context: { children: item.children }"></ng-container>
            </li>
          </ol>

          <blockquote *ngSwitchCase="'quote'">
            <ng-container *ngTemplateOutlet="renderChildren; context: { children: block.children }"></ng-container>
          </blockquote>

          <pre *ngSwitchCase="'code'"><code>{{ getCodeText(block.children) }}</code></pre>

          <img *ngSwitchCase="'image'" 
               [src]="block.image?.url" 
               [alt]="block.image?.alternativeText || ''"
               [width]="block.image?.width"
               [height]="block.image?.height">

        </ng-container>
      </ng-container>
    </div>

    <ng-template #renderChildren let-children="children">
      <ng-container *ngFor="let node of children">
        <ng-container [ngSwitch]="node.type">
          
          <a *ngSwitchCase="'link'" [href]="node.url" [innerHTML]="renderNode(node)"></a>
          
          <span *ngSwitchCase="'text'" [innerHTML]="renderNode(node)"></span>
          
        </ng-container>
      </ng-container>
    </ng-template>
  `
})
export class StrapiBlocksRendererComponent {
  @Input() blocks: StrapiBlock[] = [];

  constructor(private sanitizer: DomSanitizer) {}

  renderNode(node: StrapiNode): SafeHtml {
    let text = node.text || '';
    
    if (node.children) {
      text = node.children.map(child => this.getNodeText(child)).join('');
    }

    if (node.code) {
      text = `<code>${this.escapeHtml(text)}</code>`;
    }
    if (node.bold) {
      text = `<strong>${text}</strong>`;
    }
    if (node.italic) {
      text = `<em>${text}</em>`;
    }
    if (node.underline) {
      text = `<u>${text}</u>`;
    }
    if (node.strikethrough) {
      text = `<s>${text}</s>`;
    }

    return this.sanitizer.sanitize(1, text) || '';
  }

  private getNodeText(node: StrapiNode): string {
    let text = node.text || '';
    
    if (node.children) {
      text = node.children.map(child => this.getNodeText(child)).join('');
    }

    if (node.code) {
      text = `<code>${this.escapeHtml(text)}</code>`;
    }
    if (node.bold) {
      text = `<strong>${text}</strong>`;
    }
    if (node.italic) {
      text = `<em>${text}</em>`;
    }
    if (node.underline) {
      text = `<u>${text}</u>`;
    }
    if (node.strikethrough) {
      text = `<s>${text}</s>`;
    }
    if (node.type === 'link') {
      text = `<a href="${node.url}">${text}</a>`;
    }

    return text;
  }

  getCodeText(children?: StrapiNode[]): string {
    if (!children) return '';
    return children.map(child => child.text || '').join('');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}


// USAGE EXAMPLE:
// 
// In your component:
// import { StrapiBlocksRendererComponent } from './strapi-blocks-renderer.component';
//
// @Component({
//   selector: 'app-article',
//   standalone: true,
//   imports: [CommonModule, StrapiBlocksRendererComponent],
//   template: `
//     <div class="article">
//       <h1>{{ article?.title }}</h1>
//       <strapi-blocks-renderer [blocks]="article?.content"></strapi-blocks-renderer>
//     </div>
//   `
// })
// export class ArticleComponent {
//   article: any;
//
//   ngOnInit() {
//     this.strapiService.getArticle(id).subscribe(response => {
//       this.article = response.data.attributes;
//     });
//   }
// }
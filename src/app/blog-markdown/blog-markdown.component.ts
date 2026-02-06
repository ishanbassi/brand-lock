import { Component, EventEmitter, Inject, Input, Output, PLATFORM_ID } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';
import { BlogData, CampaignBlock } from '../../models/blog.model';
import { isPlatformBrowser } from '@angular/common';

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
  private isBrowser = false;


  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ){
    this.isBrowser = isPlatformBrowser(platformId);

  }

  onMarkdownReady() {
    if (!this.isBrowser) return;
    this.markdownReady.emit(true);
    
    if (!this.blog?.content || !this.blog.campaignBlock) return;

    
    // Get the rendered HTML from markdown
    const markdownElement = document.querySelector('.blog-content');
    if (!markdownElement) return;
    
   const paragraphs = markdownElement.querySelectorAll('p');
    const totalParagraphs = paragraphs.length;
    
    // Define strategic positions
    const positions = [
        Math.floor(totalParagraphs * 0.33), // After 1/3 of content
        Math.floor(totalParagraphs * 0.66), // After 2/3 of content
        Math.floor(totalParagraphs * 0.9)  // Near the end
    ];
    
    positions.forEach(position => {
        if (position < paragraphs.length) {
            const campaignDiv = this.createCampaignElement(this.blog?.campaignBlock!);
            paragraphs[position].insertAdjacentElement('afterend', campaignDiv);
            this.observeCampaignSection(campaignDiv);
        }
    });
  }

  createCampaignElement(campaignBlock: CampaignBlock): HTMLElement {
    const div = document.createElement('div');
    div.className = 'campaign-section';
    
    // Apply custom background color if provided, otherwise use gradient
    if (campaignBlock.backgroundColor) {
        div.style.backgroundColor = campaignBlock.backgroundColor;
    } else {
        div.style.background = 'var(--gradient)';
    }
    
    const imageHTML = campaignBlock.campaignImage
        ? `<div class="campaign-image">
             <img src="${campaignBlock.campaignImage}" 
                  alt="${campaignBlock.title}"
                  loading="lazy">
           </div>`
        : '';
    
    div.innerHTML = `
        <div class="campaign-content">
            ${imageHTML}
            <div class="campaign-text">
                <h3>${campaignBlock.title}</h3>
                <p>${campaignBlock.description || ''}</p>
                <a href="${campaignBlock.ctaLink}" class="cta-button">
                    ${campaignBlock.ctaText}
                    <svg class="cta-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
            </div>
        </div>
    `;
    return div;
}

observeCampaignSection(element: HTMLElement) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('campaign-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.2 }
    );
    
    observer.observe(element);
}



}

import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';
import { BlogData, CampaignBlock } from '../../models/blog.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DataUtils } from '../shared/services/data-util.service';

@Component({
    selector: 'app-blog-markdown',
    imports: [MarkdownComponent, CommonModule],
    templateUrl: './blog-markdown.component.html',
    styleUrl: './blog-markdown.component.scss'
})
export class BlogMarkdownComponent implements OnInit , OnDestroy{

    @Input()
    blog?: BlogData;
  private faqSchemaScript!: HTMLScriptElement;

    @Output()
    markdownReady: EventEmitter<boolean> = new EventEmitter();
    private isBrowser = false;


    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private dataUtils: DataUtils
    ) {
        this.isBrowser = isPlatformBrowser(platformId);

    }
    ngOnDestroy(): void {
    if(this.isBrowser && this.faqSchemaScript){
      document.head.removeChild(this.faqSchemaScript);
    }
  }
    ngOnInit() {
        if (!this.isBrowser || !this.blog?.faqs) return;
        this.faqSchemaScript = document.createElement('script');
        this.faqSchemaScript.type = 'application/ld+json';
        this.faqSchemaScript.text = JSON.stringify(this.dataUtils.generateFaqSchema(this.blog?.faqs));
        document.head.appendChild(this.faqSchemaScript);
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
            Math.floor(totalParagraphs * 0.66), // After 2/3 of content
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

    toggleFaq(event: any) {
        const btn = event.target;
        const item = btn.closest('.faq-item');
        const answer = item.querySelector('.faq-answer');
        const isOpen = item.classList.contains('open');

        document.querySelectorAll('.faq-item.open').forEach(el => {
            el.classList.remove('open');
            (el.querySelector('.faq-answer') as any)!.style.maxHeight = '0';
        });

        if (!isOpen) {
            item.classList.add('open');
            answer.style.maxHeight = answer.scrollHeight + 'px';
        }
    }



}

import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SeoService {

  constructor(@Inject(DOCUMENT) private document: Document) {}

  setCanonical(url: string): void {
    let link: HTMLLinkElement | null = this.document.querySelector("link[rel='canonical']");
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  injectJsonLd(schema: object | object[], id: string): void {
    if (this.document.querySelector(`script[data-schema="${id}"]`)) return;
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', id);
    script.text = JSON.stringify(schema);
    this.document.head.appendChild(script);
  }

  removeJsonLd(id: string): void {
    this.document.querySelector(`script[data-schema="${id}"]`)?.remove();
  }

  removeCanonical(): void {
    this.document.querySelector("link[rel='canonical']")?.remove();
  }
}

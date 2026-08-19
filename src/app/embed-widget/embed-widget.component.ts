import { Component, Inject, Input, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ITrademark } from '../../models/trademark.model';
import { environment } from '../../environments/environment';

/**
 * "Get embed code" panel for the trademark detail page. Builds a static, server-renderable
 * HTML snippet (a real <a href>, not an iframe and not a JS-injected link) so that whoever
 * pastes it gets a crawlable backlink regardless of whether embed.js ever loads on their page —
 * embed.js is progressive enhancement that keeps the status text current, not what makes the
 * link count. See PublicEmbedResource / embed.js for the refresh side of this.
 */
@Component({
  selector: 'app-embed-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './embed-widget.component.html',
  styleUrl: './embed-widget.component.scss',
})
export class EmbedWidgetComponent {
  @Input() trademark: ITrademark | null | undefined;

  expanded = signal(false);
  copied = signal(false);
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    @Inject(DOCUMENT) private readonly document: Document,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  toggle(): void {
    this.expanded.update(v => !v);
  }

  get detailUrl(): string {
    if (this.isBrowser) {
      return this.document.location.href;
    }
    return environment.BaseUrl;
  }

  get embedOrigin(): string {
    return environment.BaseUrl.replace(/\/$/, '');
  }

  get snippetHtml(): string {
    const tm = this.trademark;
    if (!tm?.applicationNo) return '';
    const name = this.escape(tm.name || 'Trademark');
    const status = this.escape(tm.trademarkStatus || 'Unknown');
    const cls = tm.tmClass != null ? ` · Class ${tm.tmClass}` : '';
    return (
      `<div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px 14px;max-width:320px;font-family:system-ui,sans-serif;">\n` +
      `  <a href="${this.detailUrl}" rel="noopener" style="text-decoration:none;color:inherit;display:block;">\n` +
      `    <strong style="font-size:14px;">${name}</strong>${cls}<br/>\n` +
      `    <span style="font-size:13px;color:#374151;">Status: <span data-tmx-status="${tm.applicationNo}">${status}</span></span><br/>\n` +
      `    <span style="font-size:11px;color:#2563eb;">View full trademark details on TradeMarx →</span>\n` +
      `  </a>\n` +
      `</div>\n` +
      `<script async src="${this.embedOrigin}/embed.js" data-tmx-id="${tm.applicationNo}"></script>`
    );
  }

  copy(): void {
    if (!this.isBrowser || !this.snippetHtml) return;
    navigator.clipboard.writeText(this.snippetHtml).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  private escape(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

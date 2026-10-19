import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { LocalStorageService } from './local-storage.service';

export interface LeadAcquisition {
  source: string;
  referrerDomain?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  capturedAt: number;
}

const STORAGE_KEY = 'tm_lead_acquisition';
const ATTRIBUTION_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

const KNOWN_SOURCES: ReadonlyArray<[string, string]> = [
  ['chatgpt.com', 'ChatGPT'],
  ['chat.openai.com', 'ChatGPT'],
  ['perplexity.ai', 'Perplexity'],
  ['claude.ai', 'Claude'],
  ['gemini.google.com', 'Gemini'],
  ['copilot.microsoft.com', 'Microsoft Copilot'],
  ['you.com', 'You.com'],
  ['phind.com', 'Phind'],
  ['poe.com', 'Poe'],
  ['grok.com', 'Grok'],
  ['google.', 'Google Search'],
  ['bing.com', 'Bing Search'],
  ['duckduckgo.com', 'DuckDuckGo'],
  ['search.yahoo.', 'Yahoo Search'],
  ['linkedin.com', 'LinkedIn'],
  ['facebook.com', 'Facebook'],
  ['instagram.com', 'Instagram'],
  ['twitter.com', 'X'],
  ['x.com', 'X'],
];

/**
 * Persists the channel that brought a visitor to the site so a later form
 * submission can be attributed even after the visitor has navigated the SPA.
 * Only a hostname is retained for referrals — never the referring page URL.
 */
@Injectable({ providedIn: 'root' })
export class LeadAcquisitionService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly localStorageService = inject(LocalStorageService);

  capture(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const url = new URL(window.location.href);
    const utmSource = this.utmParam(url, 'utm_source');
    const utmMedium = this.utmParam(url, 'utm_medium');
    const utmCampaign = this.utmParam(url, 'utm_campaign');
    const utmContent = this.utmParam(url, 'utm_content');
    const utmTerm = this.utmParam(url, 'utm_term');
    const hasUtm = Boolean(utmSource || utmMedium || utmCampaign || utmContent || utmTerm);
    const referrerDomain = this.referrerDomain();
    const source = utmSource
      ? this.sourceFor(utmSource, 'Campaign')
      : referrerDomain
        ? this.sourceFor(referrerDomain, 'Referral')
        : hasUtm
          ? 'Campaign'
        : 'Direct';
    const existing = this.getActive();

    // An internal/direct navigation must not erase a meaningful source already
    // captured for this visitor. A fresh campaign or external referral wins.
    if (!hasUtm && !referrerDomain && existing) return;

    this.localStorageService.setObject(STORAGE_KEY, {
      source,
      referrerDomain: referrerDomain ?? undefined,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      capturedAt: Date.now(),
    } satisfies LeadAcquisition);
  }

  getActive(): LeadAcquisition | null {
    const acquisition = this.localStorageService.getObject(STORAGE_KEY) as LeadAcquisition | null;
    if (!acquisition || Date.now() - acquisition.capturedAt > ATTRIBUTION_WINDOW_MS) return null;
    return acquisition;
  }

  private referrerDomain(): string | null {
    const referrer = this.document.referrer;
    if (!referrer) return null;

    try {
      const domain = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
      return domain && domain !== window.location.hostname.toLowerCase().replace(/^www\./, '') ? domain : null;
    } catch {
      return null;
    }
  }

  private sourceFor(value: string, unknownPrefix: 'Campaign' | 'Referral'): string {
    const normalized = value.toLowerCase().replace(/^www\./, '');
    return (
      KNOWN_SOURCES.find(([domain]) => normalized === domain || normalized.endsWith(`.${domain}`) || normalized.includes(domain))?.[1]
      ?? `${unknownPrefix}: ${value}`
    ).slice(0, 100);
  }

  private utmParam(url: URL, parameter: string): string | undefined {
    const value = url.searchParams.get(parameter)?.trim();
    return value ? value.slice(0, 255) : undefined;
  }
}

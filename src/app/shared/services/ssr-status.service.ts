import { Injectable, REQUEST_CONTEXT, inject } from '@angular/core';

/**
 * Lets a server-rendered route choose the HTTP status of its own response.
 *
 * Without this every route returns 200, including /not-found — so a dead URL served a
 * "page not found" card under a 200, which Google logs as a soft 404. That matters most
 * for the programmatic pages (/trademark-filings/:state, /trademark-journal/:no, …), where
 * a handful of unresolvable slugs in the sitemap would otherwise burn crawl budget across
 * the whole set.
 *
 * server.ts passes a mutable context object into AngularNodeAppEngine.handle(); Angular
 * exposes it here through REQUEST_CONTEXT. Setting a code is a no-op in the browser, where
 * the token is absent.
 */
export interface SsrResponseContext {
  statusCode?: number;
}

@Injectable({ providedIn: 'root' })
export class SsrStatusService {
  private readonly context = inject(REQUEST_CONTEXT, { optional: true }) as SsrResponseContext | null;

  setStatus(statusCode: number): void {
    if (this.context) {
      this.context.statusCode = statusCode;
    }
  }
}

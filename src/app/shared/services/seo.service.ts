import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

/** Absolute origin every canonical is built from. */
const SITE_URL = 'https://trademarx.in';

/**
 * Parameters that record where a visitor came from without changing what the page renders, so a
 * canonical derived from the route drops them.
 *
 * This is the whole reason the default exists. The API attribution snippet
 * (DeveloperPortalService) mints a distinct `?utm_content=<consumerId>` per API consumer and the
 * weekly audit job enforces that the link stays up — so the scheme deliberately manufactures
 * followed backlinks, each aimed at a different URL. Without a canonical collapsing them, that
 * authority lands on dozens of near-duplicate homepages instead of on one. `ref` is here for the
 * same reason: partner links carry `?ref=CODE` onto any page on the site.
 */
const TRACKING_PARAMS = new Set([
  'gclid',
  'fbclid',
  'msclkid',
  'gad_source',
  'gbraid',
  'wbraid',
  'igshid',
  'mc_cid',
  'mc_eid',
  'ref',
  'referrer',
]);

/**
 * Route prefixes that get no canonical at all.
 *
 * Two kinds. The role portals and auth flows are private or noindex — a canonical there claims a
 * page is worth indexing when it isn't. `/search/results` is the deliberate one: its query string
 * *is* its content, so a self-canonical would invite an unbounded set of search URLs into the
 * index. That page wants `noindex`, which is a separate decision from this one.
 */
const UNCANONICAL_PREFIXES = [
  '/portal',
  '/agent-portal',
  '/admin-portal',
  '/partner-portal',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/create-new-password',
  '/submit-otp',
  '/service-checkout',
  '/thank-you',
  '/search/results',
];

/**
 * Paths whose query string never changes what renders, so their canonical is always the bare path.
 *
 * `/search` is the marketing page for the search tool; the component reads no query parameters at
 * all, so `/search?q=nike` server-renders byte-identical content to `/search`. Left to the default
 * below it would self-canonicalise to `/search?q=nike`, which turns every link anyone ever builds
 * with a stray parameter into its own indexable copy of the same 3,900 words. The results page next
 * door is handled by {@link UNCANONICAL_PREFIXES} instead, because there the query string *is* the
 * content and no canonical is the right answer.
 */
const PARAMLESS_PATHS = new Set(['/search']);

@Injectable({ providedIn: 'root' })
export class SeoService {

  /**
   * Whether the active page set its own canonical. Reset at the start of each navigation by
   * {@link beginNavigation}, so the router-level default only fills the gap and never overwrites a
   * component that knows better — a paginated listing, or a page reachable at more than one path.
   */
  private canonicalOverridden = false;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  setCanonical(url: string): void {
    this.writeCanonical(url);
    this.canonicalOverridden = true;
  }

  /** Called on NavigationStart so one page's decision is not inherited by the next. */
  beginNavigation(): void {
    this.canonicalOverridden = false;
  }

  /**
   * Self-referencing canonical derived from the route, applied only where the component set none.
   *
   * Runs on NavigationEnd, which is after the incoming component's ngOnInit — that ordering is
   * what makes the override work rather than race.
   *
   * @param routerUrl the router's URL for the navigation, query string included
   * @param isErrorPage true for the 404/403 routes, which must not claim to be canonical URLs
   */
  applyRouteCanonical(routerUrl: string, isErrorPage: boolean): void {
    if (this.canonicalOverridden || isErrorPage) return;

    const canonical = this.canonicalFor(routerUrl);
    if (canonical) {
      this.writeCanonical(canonical);
    } else {
      // A private or noindex route. Any canonical left over from the previous page has to go,
      // otherwise a client-side navigation carries it onto a page it does not describe.
      this.removeCanonical();
    }
  }

  /** @returns the canonical URL for a route, or null where the route should not have one. */
  private canonicalFor(routerUrl: string): string | null {
    const [withoutFragment] = routerUrl.split('#');
    const [rawPath, rawQuery] = withoutFragment.split('?');

    // Collapse the root to a bare slash and strip it everywhere else, so one page can never be
    // canonicalised to two strings that differ only by that slash.
    const path = rawPath.replace(/\/+$/, '') || '/';

    if (UNCANONICAL_PREFIXES.some(prefix => path === prefix || path.startsWith(prefix + '/'))) {
      return null;
    }

    if (PARAMLESS_PATHS.has(path)) {
      return SITE_URL + path;
    }

    // Parameters that do change the page (?page=2 on a listing) are kept, so paginated pages stay
    // distinct URLs rather than all collapsing onto page one. Sorted so that two orderings of the
    // same parameters cannot yield two canonicals.
    const kept = new URLSearchParams();
    if (rawQuery) {
      const entries = Array.from(new URLSearchParams(rawQuery).entries())
        .filter(([key]) => !TRACKING_PARAMS.has(key.toLowerCase()) && !key.toLowerCase().startsWith('utm_'))
        .sort(([a], [b]) => a.localeCompare(b));
      entries.forEach(([key, value]) => kept.append(key, value));
    }

    const query = kept.toString();
    return SITE_URL + path + (query ? `?${query}` : '');
  }

  private writeCanonical(url: string): void {
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

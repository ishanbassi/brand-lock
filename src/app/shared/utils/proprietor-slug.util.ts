/**
 * "Reliance Industries Limited" -> "reliance-industries-limited".
 *
 * Builds the /trademarks-by/:slug links from a raw registry proprietor name. MUST stay
 * byte-identical to TrademarkProprietorService.slugify() (which builds the sitemap URLs) and
 * to TrademarkRepository.PROPRIETOR_SLUG_EXPR (which the page's lookup matches on) — if they
 * drift, every applicant link on the site points at a URL that 404s.
 *
 * Slugifying rather than passing the name through as a query parameter is deliberate: the
 * registry records one entity under many spellings ("ABC PVT LTD", "Abc Pvt. Ltd."), and this
 * collapses them onto a single canonical page.
 */
export function proprietorSlug(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** The public URL for a proprietor's portfolio page, or null when the name can't form a slug. */
export function proprietorUrl(name: string | null | undefined): string | null {
  const slug = proprietorSlug(name);
  return slug ? `/trademarks-by/${slug}` : null;
}

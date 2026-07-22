/**
 * "Tamil Nadu" -> "tamil-nadu". Matches the backend's slugify (TrademarkTrendsService) so
 * /trademark-filings/:state links built from a free-text state label round-trip correctly.
 */
export function stateSlug(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

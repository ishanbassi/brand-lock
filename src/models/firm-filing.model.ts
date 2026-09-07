/**
 * A mark this firm filed, as returned by {@code GET /api/trademarks/firm-recent-filings}.
 *
 * Deliberately narrower than {@link ITrademark}: the endpoint projects onto a handful of columns so
 * the marketing site never ships proprietor names or addresses to render a logo strip.
 */
export interface IFirmFiling {
  name?: string | null;
  applicationNo?: number | null;
  tmClass?: number | null;
  imgUrl?: string | null;
  type?: string | null;
  trademarkStatus?: string | null;
  /** Detail-page path, already slugged server-side — e.g. /trademarks/acme-class-25-1234567 */
  url?: string | null;
}

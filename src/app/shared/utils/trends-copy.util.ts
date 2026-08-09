/**
 * Shared copy helpers for the public filing-trends pages.
 *
 * The charts on these pages render to <canvas>, which crawlers and AI answer engines
 * cannot read, and a stat card is a <div> with a number in it — not something that can be
 * quoted. Everything here turns the same figures the charts plot into sentences and
 * question/answer pairs, so each page states its findings in extractable prose without
 * anyone hand-writing 150+ variants.
 */

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Escapes text before it goes into a generated HTML string. Labels come from scraped
 * registry data (state and class names), so they are treated as untrusted even though
 * Angular's sanitiser would also strip anything dangerous from [innerHTML].
 */
function esc(value: string | number): string {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Wraps a figure so it stands out inside a paragraph of generated prose. A wall of plain
 * sentences hides exactly the numbers the reader came for; these render as bolded,
 * slightly tinted spans (see .page-intro .figure in styles/_trends-data.scss).
 */
export function hl(value: string | number): string {
  return `<strong class="figure">${esc(value)}</strong>`;
}

/** Highlighted figure with a direction colour, for the month-over-month movement. */
export function hlTrend(value: number | null | undefined): string {
  if (value === null || value === undefined) return esc(signedPercent(value));
  const dir = Math.abs(value) < 0.05 ? 'flat' : value > 0 ? 'up' : 'down';
  return `<strong class="figure figure--${dir}">${esc(signedPercent(value))}</strong>`;
}

/** Plain text form of the same content, for meta descriptions and schema.org values. */
export function stripHl(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

/** 12345 -> "12,345" in the Indian grouping the rest of the site uses. */
export function num(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString('en-IN');
}

/** "+3.2%" / "-3.2%" / "unchanged" — never a bare minus sign next to a noun. */
export function signedPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'not comparable';
  const rounded = Math.abs(value) < 0.05 ? 0 : value;
  if (rounded === 0) return 'unchanged';
  return `${rounded > 0 ? 'up' : 'down'} ${Math.abs(rounded).toFixed(1)}%`;
}

/** ISO date -> "9 August 2026". */
export function longDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Two ISO dates -> "11 July – 9 August 2026", collapsing a shared month or year. */
export function dateRange(fromIso: string | null | undefined, toIso: string | null | undefined): string {
  if (!fromIso || !toIso) return '';
  const from = new Date(fromIso);
  const to = new Date(toIso);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return '';

  const sameYear = from.getFullYear() === to.getFullYear();
  const sameMonth = sameYear && from.getMonth() === to.getMonth();
  const fromPart = sameMonth
    ? from.toLocaleDateString('en-GB', { day: 'numeric' })
    : from.toLocaleDateString('en-GB', sameYear ? { day: 'numeric', month: 'long' } : { day: 'numeric', month: 'long', year: 'numeric' });
  return `${fromPart} – ${longDate(toIso)}`;
}

/** Share of a whole as a readable percentage, e.g. "2.8%" — "<0.1%" rather than "0.0%". */
export function share(part: number | null | undefined, whole: number | null | undefined): string {
  if (!whole) return '—';
  const pct = ((part ?? 0) * 100) / whole;
  if (pct > 0 && pct < 0.1) return '<0.1%';
  return `${pct.toFixed(1)}%`;
}

/**
 * Registry mark types arrive as raw enum names (TrademarkType). Rendering "IMAGEMARK" at a
 * visitor is jargon leaking out of the database, so the breakdown rows and the generated
 * prose both go through this.
 */
const MARK_TYPE_LABELS: Record<string, string> = {
  IMAGEMARK: 'Logo / device',
  TRADEMARK: 'Word mark',
  TRADEMARK_WITH_IMAGE: 'Word mark with logo',
  SOUNDMARK: 'Sound mark',
  SLOGAN: 'Slogan',
};

export function markTypeLabel(raw: string | null | undefined): string {
  if (!raw) return 'Unspecified';
  return MARK_TYPE_LABELS[raw.toUpperCase()] ?? raw;
}

/** Schema.org FAQPage node for a set of Q&As. */
export function faqSchema(items: FaqItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/**
 * The standing caveats every one of these pages has to carry:
 * filings are counted by application date from a scrape that trails the registry, so the
 * most recent days are always under-reported. Stated once here so all five pages say the
 * same thing.
 */
export const COLLECTION_LAG_NOTE =
  'Figures are counted by the application date recorded in the register. Our index is refreshed hourly, ' +
  'but the registry publishes new applications with a delay, so the most recent days are always ' +
  'under-reported and will rise as records arrive.';

export const SOURCE_NOTE =
  'Sourced from the official IP India trademark register and the Trade Marks Journal. Only records ' +
  'published by the registry are counted — never applications filed through Trademarx.';

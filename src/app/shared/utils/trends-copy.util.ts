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

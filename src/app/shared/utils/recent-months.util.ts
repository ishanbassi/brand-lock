export interface RecentMonth {
  slug: string; // e.g. "2026-06", matching /trademark-trends/:yearMonth
  label: string; // e.g. "June 2026"
}

/**
 * Last `count` complete calendar months, newest first, for linking to
 * /trademark-trends/:yearMonth report pages. Starts from last month - the current,
 * still-in-progress month isn't a finished "report" yet.
 */
export function buildRecentMonths(count = 12): RecentMonth[] {
  const months: RecentMonth[] = [];
  const now = new Date();
  let cursor = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  for (let i = 0; i < count; i++) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth() + 1;
    months.push({
      slug: `${year}-${String(month).padStart(2, '0')}`,
      label: cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    });
    cursor = new Date(year, month - 2, 1);
  }
  return months;
}

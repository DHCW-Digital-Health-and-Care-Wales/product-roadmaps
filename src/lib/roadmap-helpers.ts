/**
 * Presentation helpers for the roadmap.
 */

// Not Intl: some browsers lack Welsh locale data, which would also break hydration.
const MONTHS = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  cy: [
    'Ionawr',
    'Chwefror',
    'Mawrth',
    'Ebrill',
    'Mai',
    'Mehefin',
    'Gorffennaf',
    'Awst',
    'Medi',
    'Hydref',
    'Tachwedd',
    'Rhagfyr',
  ],
};

/**
 * Format an ISO date (YYYY-MM-DD) as a readable day-month-year string in the
 * active language, for example "26 June 2026", or return the raw value if it
 * isn't one. Used only for "last updated"; roadmap items never show dates.
 */
export function formatDate(iso: string, lang: 'cy' | 'en'): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const month = match ? MONTHS[lang][Number(match[2]) - 1] : undefined;
  if (!match || !month) return iso;
  return `${Number(match[3])} ${month} ${match[1]}`;
}

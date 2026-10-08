/**
 * Presentation helpers for the roadmap.
 */

/**
 * Format an ISO date (YYYY-MM-DD) as a readable day-month-year string in the
 * active language, for example "26 June 2026". Falls back to British English
 * formatting if the locale is unavailable, and to the raw value if parsing
 * fails. Used only for "last updated"; roadmap items never show dates.
 */
export function formatDate(iso: string, lang: 'cy' | 'en'): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const locale = lang === 'cy' ? 'cy' : 'en-GB';
  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }
}

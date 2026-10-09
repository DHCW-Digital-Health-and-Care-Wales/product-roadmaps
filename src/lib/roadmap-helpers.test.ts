import { describe, expect, it } from 'vitest';
import { formatDate } from './roadmap-helpers';

describe('formatDate', () => {
  it('writes the day, month and year in each language', () => {
    expect(formatDate('2026-06-01', 'en')).toBe('1 June 2026');
    expect(formatDate('2026-10-26', 'cy')).toBe('26 Hydref 2026');
  });

  it('returns anything else unchanged', () => {
    expect(formatDate('2026-13-01', 'en')).toBe('2026-13-01');
    expect(formatDate('soon', 'cy')).toBe('soon');
  });
});

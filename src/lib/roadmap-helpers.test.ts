import { describe, expect, it } from 'vitest';
import {
  formatDate,
  isExpandable,
  placementHeadingId,
  roadmapGroups,
} from './roadmap-helpers';
import snapshot from '../../e2e/fixtures/roadmaps.json';

const loc = (en: string) => ({ en, cy: '' });

describe('isExpandable', () => {
  it.each([
    ['neither', {}, false],
    ['an outcome', { outcome: loc('Why') }, true],
    ['details', { details: [{ text: loc('What'), level: 0 }] }, true],
  ])('is %s -> %s', (_, extra, expected) => {
    expect(
      isExpandable({ title: loc('T'), description: loc(''), ...extra }),
    ).toBe(expected);
  });
});

describe('placementHeadingId', () => {
  it('prefixes horizons and sections differently', () => {
    expect(placementHeadingId('now')).toBe('horizon-now');
    expect(placementHeadingId('not-doing')).toBe('section-not-doing');
  });
});

describe('roadmapGroups', () => {
  it('lists sections and horizons in page order, counting the top ones', () => {
    const groups = roadmapGroups(snapshot[0]);
    expect(groups.map((g) => [g.id, g.glance])).toEqual([
      ['recently-delivered', true],
      ['now', true],
      ['next', true],
      ['later', true],
      ['delivered-this-year', false],
      ['not-doing', false],
    ]);
  });
});

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

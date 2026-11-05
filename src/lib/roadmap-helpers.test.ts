import { describe, expect, it } from 'vitest';
import {
  filterGroups,
  formatDate,
  groupByCategory,
  isExpandable,
  matchesSearch,
  placementHeadingId,
  roadmapGroups,
  titleWithFamily,
  categoryTiles,
} from './roadmap-helpers';
import type { CategoryId, Roadmap } from './types';
import fixture from '../../e2e/fixtures/roadmaps.json';

const snapshot = fixture as Roadmap[];

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

describe('titleWithFamily', () => {
  const localised = (en: string, cy = '') => ({ en, cy });

  it('puts the family in front of the title', () => {
    expect(
      titleWithFamily({
        title: localised('Nursing Healthcare'),
        family: localised('Single Record'),
      }),
    ).toEqual({ en: 'Single Record | Nursing Healthcare', cy: '' });
  });

  it('is just the title when there is no family', () => {
    expect(
      titleWithFamily({
        title: localised('Vaccines', 'Brechlynnau'),
        family: localised(''),
      }),
    ).toEqual({ en: 'Vaccines', cy: 'Brechlynnau' });
  });

  it('falls back to English for each part separately in Welsh', () => {
    expect(
      titleWithFamily({
        title: localised('Pathology', 'Patholeg'),
        family: localised('Medicines & Diagnostics'),
      }).cy,
    ).toBe('Medicines & Diagnostics | Patholeg');
    expect(
      titleWithFamily({
        title: localised('Pathology'),
        family: localised(
          'Medicines & Diagnostics',
          'Meddyginiaethau a Diagnosteg',
        ),
      }).cy,
    ).toBe('Meddyginiaethau a Diagnosteg | Pathology');
  });

  it('ignores a family that has only Welsh, as the landing page card does', () => {
    expect(
      titleWithFamily({
        title: localised('Pathology', 'Patholeg'),
        family: localised('', 'Meddyginiaethau'),
      }),
    ).toEqual({ en: 'Pathology', cy: 'Patholeg' });
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

const roadmap = (
  slug: string,
  category: CategoryId | '',
  title: { en: string; cy?: string },
  extra: Partial<Roadmap['meta']> = {},
): Roadmap => ({
  ...snapshot[0],
  slug,
  meta: {
    ...snapshot[0].meta,
    title: { cy: '', ...title },
    category,
    family: loc(''),
    ...extra,
  },
});

describe('groupByCategory', () => {
  const ids = (roadmaps: Roadmap[], lang: 'en' | 'cy' = 'en') =>
    groupByCategory(roadmaps, lang).map((g) => [
      g.category.id,
      g.roadmaps.map((r) => r.slug),
    ]);

  it('groups in category order, sorted by title, leaving out empty ones', () => {
    expect(
      ids([
        roadmap('zeta', 'national-systems-data', { en: 'Zeta' }),
        roadmap('beta', 'public-health-apps', { en: 'beta' }),
        roadmap('alpha', 'public-health-apps', { en: 'Álpha' }),
        roadmap('gamma', 'gp-community-services', { en: 'Gamma' }),
      ]),
    ).toEqual([
      ['public-health-apps', ['alpha', 'beta']],
      ['gp-community-services', ['gamma']],
      ['national-systems-data', ['zeta']],
    ]);
  });

  it('has no Other group when every roadmap has a category', () => {
    const groups = groupByCategory(
      [roadmap('a', 'tests-scans-results', { en: 'A' })],
      'en',
    );
    expect(groups.some((g) => g.category.id === 'other')).toBe(false);
  });

  it('puts roadmaps with no category in a last Other group', () => {
    expect(
      ids([
        roadmap('other', '', { en: 'Other' }),
        roadmap('a', 'hospital-specialist-care', { en: 'A' }),
      ]),
    ).toEqual([
      ['hospital-specialist-care', ['a']],
      ['other', ['other']],
    ]);
  });

  it('sorts equal titles by slug', () => {
    const roadmaps = [
      roadmap('b-slug', 'public-health-apps', { en: 'Same' }),
      roadmap('a-slug', 'public-health-apps', { en: 'same' }),
    ];
    expect(ids(roadmaps)[0]?.[1]).toEqual(['a-slug', 'b-slug']);
    expect(ids([...roadmaps].reverse())[0]?.[1]).toEqual(['a-slug', 'b-slug']);
  });

  it('sorts by the Welsh title, falling back to English', () => {
    const roadmaps = [
      roadmap('one', 'public-health-apps', { en: 'Apple', cy: 'Zebra' }),
      roadmap('two', 'public-health-apps', { en: 'Banana' }),
    ];
    expect(ids(roadmaps, 'en')[0]?.[1]).toEqual(['one', 'two']);
    expect(ids(roadmaps, 'cy')[0]?.[1]).toEqual(['two', 'one']);
  });
});

describe('matchesSearch', () => {
  const r = roadmap(
    'x',
    '',
    { en: 'Vaccine service', cy: 'Gwasanaeth brechu' },
    {
      family: { en: 'Single Record', cy: 'Cofnod' },
      serviceDescription: { en: 'Helps pharmacies', cy: '' },
    },
  );

  it('matches title, family and summary, ignoring case and accents', () => {
    expect(matchesSearch(r, '', 'en')).toBe(true);
    expect(matchesSearch(r, 'VACCINE', 'en')).toBe(true);
    expect(matchesSearch(r, 'single', 'en')).toBe(true);
    expect(matchesSearch(r, 'pharmácies', 'en')).toBe(true);
    expect(matchesSearch(r, 'record vaccine', 'en')).toBe(true);
    expect(matchesSearch(r, 'record dentist', 'en')).toBe(false);
  });

  it('searches the text shown in the current language', () => {
    expect(matchesSearch(r, 'brechu', 'cy')).toBe(true);
    expect(matchesSearch(r, 'cofnod gwasanaeth', 'cy')).toBe(true);
    expect(matchesSearch(r, 'brechu', 'en')).toBe(false);
    expect(matchesSearch(r, 'vaccine', 'cy')).toBe(false);
    // The summary has no Welsh, so the English shown is searched.
    expect(matchesSearch(r, 'pharmacies', 'cy')).toBe(true);
  });

  it('searches an English title shown on a Welsh page', () => {
    const english = roadmap('e', '', { en: 'Pathology' });
    expect(matchesSearch(english, 'patholog', 'cy')).toBe(true);
  });

  it('does not search the generic intro shown when there is no description', () => {
    const bare = roadmap(
      'b',
      '',
      { en: 'Pathology' },
      { serviceDescription: { en: '', cy: '' } },
    );
    for (const word of ['roadmap', 'working', 'direction', 'later']) {
      expect(matchesSearch(bare, word, 'en')).toBe(false);
      expect(matchesSearch(bare, word, 'cy')).toBe(false);
    }
  });

  it('ignores a family that has only Welsh, as the card hides it', () => {
    const welshFamily = roadmap(
      'w',
      '',
      { en: 'Pathology', cy: 'Patholeg' },
      { family: { en: '', cy: 'Cofnod' } },
    );
    expect(matchesSearch(welshFamily, 'cofnod', 'cy')).toBe(false);
  });
});

describe('filterGroups', () => {
  const roadmaps = [
    roadmap('a', 'public-health-apps', { en: 'Vaccines' }),
    roadmap('b', 'public-health-apps', { en: 'Screening' }),
    roadmap('c', 'national-systems-data', { en: 'Data' }),
    roadmap('d', '', { en: 'Misc vaccines' }),
  ];
  const groups = (query: string) =>
    filterGroups(roadmaps, query, 'en').map((g) => [
      g.category.id,
      g.roadmaps.map((r) => r.slug),
    ]);

  it('keeps every group for a blank query', () => {
    expect(groups(' ')).toEqual([
      ['public-health-apps', ['b', 'a']],
      ['national-systems-data', ['c']],
      ['other', ['d']],
    ]);
  });

  it('keeps only matching roadmaps and drops empty groups', () => {
    expect(groups('vaccines')).toEqual([
      ['public-health-apps', ['a']],
      ['other', ['d']],
    ]);
    expect(groups('nothing')).toEqual([]);
  });
});

describe('categoryTiles', () => {
  const roadmaps = [
    roadmap('a', 'public-health-apps', { en: 'Vaccines' }),
    roadmap('c', 'national-systems-data', { en: 'Data' }),
    roadmap('d', '', { en: 'Misc' }),
  ];
  const tiles = (query: string) =>
    categoryTiles(roadmaps, filterGroups(roadmaps, query, 'en')).map((tile) => [
      tile.category.id,
      tile.count,
    ]);

  it('has a tile per non-empty named category, never Other', () => {
    expect(tiles('')).toEqual([
      ['public-health-apps', 1],
      ['national-systems-data', 1],
    ]);
  });

  it('keeps every tile while searching, counting only the matches', () => {
    expect(tiles('data')).toEqual([
      ['public-health-apps', 0],
      ['national-systems-data', 1],
    ]);
    expect(tiles('misc')).toEqual([
      ['public-health-apps', 0],
      ['national-systems-data', 0],
    ]);
  });
});

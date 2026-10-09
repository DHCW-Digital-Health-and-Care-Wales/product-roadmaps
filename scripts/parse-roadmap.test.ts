import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseCsv } from './csv.ts';
import {
  checkTranslation,
  parseRoadmap,
  parseRoadmapList,
  slugify,
  toIsoDate,
  type Worksheet,
} from './parse-roadmap.ts';

const fixture = (name: string): Worksheet => ({
  name,
  rows: parseCsv(
    readFileSync(new URL(`../sheets/${name}.csv`, import.meta.url), 'utf8'),
  ),
});

let warnings: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warnings = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('slugify', () => {
  it('makes URL-safe slugs', () => {
    expect(slugify('  Product A: Roadmap! ')).toBe('product-a-roadmap');
  });

  it('keeps the base letter of Welsh and other accented letters', () => {
    expect(slugify('Ŵyl Ŷd Café')).toBe('wyl-yd-cafe');
  });

  it('returns an empty slug when nothing is left', () => {
    expect(slugify('日本語')).toBe('');
  });
});

describe('toIsoDate', () => {
  it('accepts ISO and UK dates', () => {
    expect(toIsoDate('Tab', '2026-10-01')).toBe('2026-10-01');
    expect(toIsoDate('Tab', '1/9/2026')).toBe('2026-09-01');
    expect(toIsoDate('Tab', '')).toBe('');
    expect(warnings).not.toHaveBeenCalled();
  });

  it.each(['31/02/2026', '2026-13-01', 'Sept 2026', '09/15/2026'])(
    'blanks and warns about %s',
    (value) => {
      expect(toIsoDate('Tab', value)).toBe('');
      expect(warnings).toHaveBeenCalledOnce();
    },
  );
});

describe('parseRoadmapList', () => {
  it('reads the fixture list', () => {
    const listings = parseRoadmapList(fixture('Roadmaps'));
    expect(listings.map((l) => l.sheet)).toEqual(['ProductA', 'ProductB']);
    expect(listings[1]?.meta.lastUpdated).toBe('2026-09-15');
    expect(listings[1]?.meta.colour).toBe('#006747');
    expect(warnings).not.toHaveBeenCalled();
  });

  it('replaces non-hex colours with the default', () => {
    const [listing] = parseRoadmapList({
      name: 'Roadmaps',
      rows: [
        ['Sheet', 'Colour'],
        ['X', 'red; background: url(x)'],
      ],
    });
    expect(listing?.meta.colour).toBe('#325083');
  });

  it('fails when a required column is missing', () => {
    expect(() =>
      parseRoadmapList({ name: 'Roadmaps', rows: [['Title']] }),
    ).toThrow(/missing required column\(s\): Sheet/);
  });
});

describe('parseRoadmap', () => {
  const listings = () => parseRoadmapList(fixture('Roadmaps'));

  it.each(['ProductA', 'ProductB'])('matches the %s snapshot', (name) => {
    const listing = listings().find((l) => l.sheet === name)!;
    expect(parseRoadmap(listing, fixture(name))).toMatchSnapshot();
    expect(warnings).not.toHaveBeenCalled();
  });

  it('matches the end-to-end test data in e2e/fixtures', () => {
    const parsed = listings().map((l) => parseRoadmap(l, fixture(l.sheet)));
    const e2e: unknown = JSON.parse(
      readFileSync(
        new URL('../e2e/fixtures/roadmaps.json', import.meta.url),
        'utf8',
      ),
    );
    expect(e2e).toEqual(parsed);
  });

  it('places cards and parses nested details', () => {
    const [listing] = listings();
    const roadmap = parseRoadmap(listing, fixture('ProductA'));
    expect(roadmap.slug).toBe('producta');
    expect(roadmap.items.now).toHaveLength(3);
    expect(roadmap.items['not-doing']).toHaveLength(1);
    expect(roadmap.items.now[0]?.details?.map((d) => d.level)).toEqual([
      0, 1, 2, 0,
    ]);
    expect(roadmap.items.now[0]?.labels).toEqual([
      { en: 'Service X', cy: 'Gwasanaeth X' },
      { en: 'Service Y', cy: 'Gwasanaeth Y' },
    ]);
  });

  it('reads Welsh columns and falls back to English when blank', () => {
    const [listing] = listings();
    const roadmap = parseRoadmap(listing, fixture('ProductA'));
    const [full, minimal] = roadmap.items.now;
    expect(full?.title).toEqual({
      en: 'Example card with every column',
      cy: 'Cerdyn enghreifftiol gyda phob colofn',
    });
    expect(full?.details?.[1]?.text.cy).toBe(
      'Dechreuwch linell gyda "-" i\'w nythu o dan y llinell uchod',
    );
    expect(minimal?.title.cy).toBe('');
    expect(roadmap.items.later[0]?.phase).toEqual({
      en: 'Discovery',
      cy: 'Darganfod',
    });
  });

  it('ignores Welsh lists that do not match the English', () => {
    const [listing] = listings();
    const roadmap = parseRoadmap(listing, {
      name: 'ProductA',
      rows: [
        [
          'Title',
          'Horizon',
          'Labels',
          'Labels (cy)',
          'Details',
          'Details (cy)',
        ],
        ['Card', 'Now', 'A, B', 'A', 'One\n- Two', 'Un\n- Dau\nTri'],
      ],
    });
    const [card] = roadmap.items.now;
    expect(card?.labels).toEqual([
      { en: 'A', cy: '' },
      { en: 'B', cy: '' },
    ]);
    expect(card?.details?.map((d) => d.text.cy)).toEqual(['', '']);
    expect(warnings).toHaveBeenCalledWith(
      expect.stringContaining('Labels of "Card" has 2 English and 1 Welsh'),
    );
    expect(warnings).toHaveBeenCalledWith(
      expect.stringContaining('Details of "Card" has 2 English and 3 Welsh'),
    );
  });

  it('warns when the Welsh and English lengths differ a lot', () => {
    const [listing] = listings();
    parseRoadmap(listing, {
      name: 'ProductA',
      rows: [
        ['Title', 'Horizon', 'Description', 'Description (cy)'],
        ['Card', 'Now', 'one two three four five six seven eight', 'un dau'],
      ],
    });
    expect(warnings).toHaveBeenCalledWith(
      expect.stringContaining(
        'Description of "Card" Welsh has 2 word(s) but English has 8',
      ),
    );
  });

  it('skips cards with an unknown horizon or no title', () => {
    const [listing] = listings();
    const roadmap = parseRoadmap(listing, {
      name: 'ProductA',
      rows: [
        ['Title', 'Horizon'],
        ['Kept', 'now'],
        ['Dropped', 'Someday'],
        ['', 'Now'],
      ],
    });
    expect(roadmap.items.now.map((i) => i.title.en)).toEqual(['Kept']);
    expect(warnings).toHaveBeenCalledWith(
      expect.stringContaining('unknown Horizon "Someday"'),
    );
    expect(warnings).toHaveBeenCalledWith(
      expect.stringContaining('A row has no Title'),
    );
  });

  it('fails when the tab name gives an empty slug', () => {
    const [listing] = listings();
    expect(() =>
      parseRoadmap(
        { ...listing, sheet: '日本語' },
        { name: '日本語', rows: [['Title', 'Horizon']] },
      ),
    ).toThrow(/no letters or digits/);
  });
});

describe('checkTranslation', () => {
  const words = (count: number) => Array(count).fill('gair').join(' ');

  it.each([
    ['no Welsh', words(30), ''],
    ['similar lengths', words(30), words(25)],
    ['short text', words(5), words(1)],
    ['a short phrase that grows in Welsh', words(3), words(7)],
    ['Welsh up to twice as long', words(10), words(20)],
  ])('accepts %s', (_, en, cy) => {
    expect(checkTranslation(en, cy)).toBeUndefined();
  });

  it.each([
    ['much shorter Welsh', words(30), words(5)],
    ['much longer Welsh', words(6), words(13)],
    ['Welsh with no English', '', words(1)],
    [
      'short Welsh padded by nesting dashes',
      words(8),
      `-- -- -- -- ${words(3)}`,
    ],
  ])('flags %s', (_, en, cy) => {
    expect(checkTranslation(en, cy)).toBeTruthy();
  });
});

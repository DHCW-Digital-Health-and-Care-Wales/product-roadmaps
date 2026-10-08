import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseCsv } from './csv.ts';
import {
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

  it('places cards and parses nested details', () => {
    const [listing] = listings();
    const roadmap = parseRoadmap(listing, fixture('ProductA'));
    expect(roadmap.slug).toBe('producta');
    expect(roadmap.items.now).toHaveLength(3);
    expect(roadmap.items['not-doing']).toHaveLength(1);
    expect(roadmap.items.now[0]?.details?.map((d) => d.level)).toEqual([
      0, 1, 2, 0,
    ]);
    expect(roadmap.items.now[0]?.labels).toEqual(['Service X', 'Service Y']);
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

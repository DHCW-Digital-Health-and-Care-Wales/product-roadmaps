import { describe, expect, it } from 'vitest';
import type { BacklogItem } from './backlog.ts';
import {
  buildSheets,
  CARD_HEADER,
  LIST_HEADER,
  tabFileName,
  toTabName,
} from './backlog-sheets.ts';

const item = (overrides: Partial<BacklogItem>): BacklogItem => ({
  domain: 'PATIENTS',
  title: 'Title',
  description: '',
  horizon: 'Now',
  labels: [],
  line: 2,
  ...overrides,
});

describe('toTabName', () => {
  it.each([
    ['TESTINGS & RESULTS', 'Testings & Results'],
    ['CORE EXPERIENCE (PLATFORM)', 'Core Experience (Platform)'],
    [
      'REFERRALS, APPOINTMENTS & PATHWAYS',
      'Referrals, Appointments & Pathways',
    ],
  ])('%s -> %s', (domain, name) => {
    expect(toTabName(domain)).toBe(name);
  });
});

describe('tabFileName', () => {
  it('adds .csv and replaces characters that are invalid in file names', () => {
    expect(tabFileName('Core (Platform)')).toBe('Core (Platform).csv');
    expect(tabFileName('A/B: C')).toBe('A-B- C.csv');
  });
});

describe('buildSheets', () => {
  it('writes a card row per item with the Horizon and Labels columns', () => {
    const { tabs } = buildSheets(
      [
        item({
          title: 'Radiology',
          description: 'Refer online',
          horizon: 'Recently delivered',
          labels: ['WCP', 'National'],
        }),
      ],
      '2026-10-12',
    );
    expect(tabs).toEqual([
      {
        name: 'Patients',
        rows: [
          CARD_HEADER,
          [
            'Radiology',
            'Refer online',
            '',
            'Recently delivered',
            '',
            'WCP, National',
            '',
          ],
        ],
      },
    ]);
  });

  it('makes one tab per domain, sorted by name, keeping item order', () => {
    const { tabs } = buildSheets(
      [
        item({ domain: 'PATIENTS', title: 'P1' }),
        item({ domain: 'PRODUCT OPS', title: 'O1' }),
        item({ domain: 'patients', title: 'P2' }),
        item({ domain: 'CORE', title: 'C1' }),
      ],
      '2026-10-12',
    );
    expect(tabs.map((t) => t.name)).toEqual([
      'Core',
      'Patients',
      'Product Ops',
    ]);
    expect(tabs[1].rows.slice(1).map((r) => r[0])).toEqual(['P1', 'P2']);
  });

  it('lists each roadmap on the first tab using the same columns', () => {
    const { list } = buildSheets(
      [item({ domain: 'PATIENTS' }), item({ domain: 'PRODUCT OPS' })],
      '2026-10-12',
    );
    expect(list[0]).toEqual(LIST_HEADER);
    expect(list.slice(1)).toEqual([
      ['Patients', 'Patients', '', '2026-10-12', '', '', '', '', '', ''],
      ['Product Ops', 'Product Ops', '', '2026-10-12', '', '', '', '', '', ''],
    ]);
    expect(list.every((r) => r.length === LIST_HEADER.length)).toBe(true);
  });

  it('has only headers for no items', () => {
    expect(buildSheets([], '2026-10-12')).toEqual({
      list: [LIST_HEADER],
      tabs: [],
    });
  });
});

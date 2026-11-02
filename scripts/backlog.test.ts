import { describe, expect, it } from 'vitest';
import { readBacklog, splitValues, toLabels } from './backlog.ts';

const HEADER = [
  'Internal ID',
  'Item (REQUIRED)',
  'Description',
  'PRODUCT DOMAINS',
  'Product',
  'Healthcare Pathways',
  'Now, Next, Later',
  'Strategic Programme',
  'Organisation',
  'Priority',
];

function row(fields: Partial<Record<string, string>>): string[] {
  return HEADER.map((name) => fields[name] ?? '');
}

const base = {
  'Item (REQUIRED)': 'Item',
  'PRODUCT DOMAINS': 'PATIENTS',
  'Now, Next, Later': 'Now',
};

describe('splitValues', () => {
  it('reads quoted multi-value cells', () => {
    expect(splitValues('"WCP","Mobile"')).toEqual(['WCP', 'Mobile']);
  });

  it('keeps a plain value whole, including commas', () => {
    expect(splitValues('Meds, Prescriptions & Shared Meds')).toEqual([
      'Meds, Prescriptions & Shared Meds',
    ]);
  });

  it('drops blank and N/A values in any case or position', () => {
    expect(splitValues('')).toEqual([]);
    expect(splitValues('N/a')).toEqual([]);
    expect(splitValues('N/A - Product')).toEqual([]);
    expect(splitValues('"WCP","n/a",""')).toEqual(['WCP']);
  });

  it('collapses extra whitespace', () => {
    expect(splitValues('  Adult   Ward ')).toEqual(['Adult Ward']);
  });
});

describe('toLabels', () => {
  it('combines columns in order and removes duplicates ignoring case', () => {
    expect(toLabels(['"WCP","Core"', 'core', '', 'National'])).toEqual([
      'WCP',
      'Core',
      'National',
    ]);
  });

  it('replaces commas, which separate labels in the sheet', () => {
    expect(
      toLabels(['Meds, Prescriptions & Shared Meds Record (ePMA)']),
    ).toEqual(['Meds / Prescriptions & Shared Meds Record (ePMA)']);
  });
});

describe('readBacklog', () => {
  it('maps Now, Next, Later and Done to horizons', () => {
    const { items } = readBacklog([
      HEADER,
      row({ ...base, 'Item (REQUIRED)': 'A', 'Now, Next, Later': 'Now' }),
      row({ ...base, 'Item (REQUIRED)': 'B', 'Now, Next, Later': 'Next' }),
      row({ ...base, 'Item (REQUIRED)': 'C', 'Now, Next, Later': 'Later' }),
      row({ ...base, 'Item (REQUIRED)': 'D', 'Now, Next, Later': 'Done' }),
    ]);
    expect(items.map((i) => [i.title, i.horizon])).toEqual([
      ['A', 'Now'],
      ['B', 'Next'],
      ['C', 'Later'],
      ['D', 'Recently delivered'],
    ]);
  });

  it('ignores other statuses, including blanks, without reporting them', () => {
    const result = readBacklog([
      HEADER,
      row({ ...base, 'Now, Next, Later': 'Ideas Backlog' }),
      row({ ...base, 'Now, Next, Later': 'Parked/Rejected Ideas' }),
      row({ ...base, 'Now, Next, Later': '' }),
      row({ 'Item (REQUIRED)': 'No status or domain' }),
    ]);
    expect(result).toEqual({ items: [], skipped: [] });
  });

  it('matches statuses ignoring case and spaces', () => {
    const { items } = readBacklog([
      HEADER,
      row({ ...base, 'Now, Next, Later': ' done ' }),
    ]);
    expect(items[0].horizon).toBe('Recently delivered');
  });

  it('takes the roadmap, title and plain-text description', () => {
    const { items } = readBacklog([
      HEADER,
      row({
        ...base,
        'Item (REQUIRED)': '  Result   notification ',
        'PRODUCT DOMAINS': 'TESTINGS & RESULTS',
        Description: '<div>Users can add&nbsp;comments</div><div>Second</div>',
      }),
    ]);
    expect(items[0]).toMatchObject({
      domain: 'TESTINGS & RESULTS',
      title: 'Result notification',
      description: 'Users can add comments\nSecond',
    });
  });

  it('builds labels from the four label columns only', () => {
    const { items } = readBacklog([
      HEADER,
      row({
        ...base,
        Product: '"WCP","WCWM"',
        'Healthcare Pathways': 'N/a',
        'Strategic Programme': 'Planned Care',
        Organisation: 'National',
        Priority: 'High',
      }),
    ]);
    expect(items[0].labels).toEqual([
      'WCP',
      'WCWM',
      'Planned Care',
      'National',
    ]);
  });

  it('skips used rows without a domain or title, and reports them', () => {
    const { items, skipped } = readBacklog([
      HEADER,
      row({ ...base, 'PRODUCT DOMAINS': '' }),
      row({ ...base, 'Item (REQUIRED)': ' ' }),
      row(base),
    ]);
    expect(items).toHaveLength(1);
    expect(skipped).toEqual([
      { line: 2, title: 'Item', reason: 'no PRODUCT DOMAINS value' },
      { line: 3, title: '', reason: 'no Item title' },
    ]);
  });

  it('rejects a backlog with missing columns', () => {
    expect(() => readBacklog([['Item (REQUIRED)'], ['x']])).toThrow(
      /missing column\(s\): Description, PRODUCT DOMAINS/,
    );
  });

  it('rejects an empty backlog', () => {
    expect(() => readBacklog([])).toThrow(/empty/);
  });

  it('matches column names ignoring case', () => {
    const header = HEADER.map((name) => name.toUpperCase());
    const { items } = readBacklog([header, row(base)]);
    expect(items).toHaveLength(1);
  });
});

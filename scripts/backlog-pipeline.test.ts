import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  convertBacklog,
  readRoadmaps,
  writeSheetFiles,
} from './backlog-pipeline.ts';
import { formatCsv, parseCsv } from './csv.ts';
import { takeWarnings } from './parse-roadmap.ts';

const HEADER = [
  'Item (REQUIRED)',
  'Description',
  'PRODUCT DOMAINS',
  'Product',
  'Healthcare Pathways',
  'Now, Next, Later',
  'Strategic Programme',
  'Organisation',
];

const BACKLOG = formatCsv([
  HEADER,
  [
    'Result comments',
    '<div>Add own comments</div>',
    'TESTINGS & RESULTS',
    '"WCP"',
    'N/a',
    'Done',
    'N/a - Product',
    'National',
  ],
  [
    'Middle name',
    '<div>Add a <b>middle</b> name</div><div>On label</div>',
    'TESTINGS & RESULTS',
    '"WCP","WCWM"',
    'Oncology (Cancer)',
    'Now',
    '',
    '',
  ],
  [
    'Idea',
    'Not planned',
    'TESTINGS & RESULTS',
    '',
    '',
    'Ideas Backlog',
    '',
    '',
  ],
  [
    'Mobile app',
    '',
    'CORE EXPERIENCE (MOBILE)',
    '"Mobile"',
    '',
    'Later',
    'Meds, Prescriptions & Shared Meds Record (ePMA)',
    '',
  ],
  ['No domain', '', '', '', '', 'Next', '', ''],
]);

const dirs: string[] = [];
const tempDir = () => {
  const dir = mkdtempSync(join(tmpdir(), 'backlog-'));
  dirs.push(dir);
  return dir;
};

afterEach(() => {
  for (const dir of dirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
  vi.restoreAllMocks();
  takeWarnings();
});

describe('convertBacklog', () => {
  it('converts a backlog CSV, ignoring a byte order mark', () => {
    const { items, skipped, sheets } = convertBacklog(
      `\uFEFF${BACKLOG}`,
      '2026-10-12',
    );
    expect(items.map((i) => i.title)).toEqual([
      'Result comments',
      'Middle name',
      'Mobile app',
    ]);
    expect(skipped).toEqual([
      { line: 6, title: 'No domain', reason: 'no PRODUCT DOMAINS value' },
    ]);
    expect(sheets.tabs.map((t) => t.name)).toEqual([
      'Core Experience (Mobile)',
      'Testings & Results',
    ]);
  });
});

describe('writeSheetFiles', () => {
  it('writes the roadmap list and one CSV per roadmap', () => {
    const dir = tempDir();
    const { sheets } = convertBacklog(BACKLOG, '2026-10-12');
    expect(writeSheetFiles(sheets, join(dir, 'nested'))).toEqual([
      'Roadmaps.csv',
      'Core Experience (Mobile).csv',
      'Testings & Results.csv',
    ]);
    const list = parseCsv(
      readFileSync(join(dir, 'nested', 'Roadmaps.csv'), 'utf8'),
    );
    expect(list.map((r) => r[0])).toEqual([
      'Sheet',
      'Core Experience (Mobile)',
      'Testings & Results',
    ]);
  });
});

describe('readRoadmaps', () => {
  it('builds roadmaps from the written CSVs', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const dir = tempDir();
    writeSheetFiles(convertBacklog(BACKLOG, '2026-10-12').sheets, dir);

    const roadmaps = await readRoadmaps(dir);

    expect(
      roadmaps.map((r) => [r.slug, r.meta.title.en, r.meta.lastUpdated]),
    ).toEqual([
      ['core-experience-mobile', 'Core Experience (Mobile)', '2026-10-12'],
      ['testings-results', 'Testings & Results', '2026-10-12'],
    ]);
    const [mobile, testing] = roadmaps;
    expect(mobile.items.later.map((i) => i.labels?.map((l) => l.en))).toEqual([
      ['Mobile', 'Meds / Prescriptions & Shared Meds Record (ePMA)'],
    ]);
    expect(testing.items.now.map((i) => i.title.en)).toEqual(['Middle name']);
    expect(testing.items.now[0]).toMatchObject({
      description: { en: 'Add a middle name\nOn label' },
      labels: [{ en: 'WCP' }, { en: 'WCWM' }, { en: 'Oncology (Cancer)' }],
    });
    expect(testing.items['recently-delivered']).toHaveLength(1);
    expect(testing.items['recently-delivered'][0].labels).toEqual([
      { en: 'WCP', cy: '' },
      { en: 'National', cy: '' },
    ]);
  });

  it('fails when there are no roadmaps', async () => {
    const dir = tempDir();
    writeSheetFiles(
      convertBacklog(BACKLOG.split('\n')[0] + '\n', '2026-10-12').sheets,
      dir,
    );
    await expect(readRoadmaps(dir)).rejects.toThrow(/No roadmaps found/);
  });
});

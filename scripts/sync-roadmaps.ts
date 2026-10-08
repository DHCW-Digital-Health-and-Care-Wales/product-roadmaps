/**
 * Downloads the roadmap Google Sheet and writes the parsed roadmaps to
 * src/data/roadmaps.json. Run with `npm run sync`; the nightly GitHub Action
 * commits the result if it changed.
 *
 * The first tab lists the roadmaps; each row's "Sheet" names the tab to load.
 */
import { writeFileSync } from 'node:fs';
import type { Roadmap } from '../src/lib/types.ts';
import { parseCsv } from './csv.ts';
import {
  hasColumn,
  parseRoadmap,
  parseRoadmapList,
  type Worksheet,
} from './parse-roadmap.ts';
import { validateSnapshot } from './roadmap-schema.ts';

// The spreadsheet must be shared as "Anyone with the link can view".
const SHEET_ID =
  process.env.SHEET_ID || '1wuk_pK1LpfLKmdbg6WsY_qKeBC5lcN4rlsjqkAxtflw';

const OUTPUT = new URL('../src/data/roadmaps.json', import.meta.url);

// The gviz CSV export can fetch a tab by name. An unknown name silently
// returns the first tab, which callers detect by its "Sheet" column.
async function fetchTab(name?: string): Promise<Worksheet> {
  const url = new URL(
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`,
  );
  url.searchParams.set('tqx', 'out:csv');
  url.searchParams.set('headers', '1');
  if (name) url.searchParams.set('sheet', name);

  const response = await fetch(url);
  const type = response.headers.get('content-type') ?? '';
  if (!response.ok || !type.includes('text/csv')) {
    throw new Error(
      `Unexpected ${response.status} (${type}) from ${url.href}; is the sheet shared as "Anyone with the link can view"?`,
    );
  }
  return {
    name: name ?? 'Roadmaps (first tab)',
    rows: parseCsv(await response.text()),
  };
}

const index = await fetchTab();
const roadmaps: Roadmap[] = [];

for (const listing of parseRoadmapList(index)) {
  const tab = await fetchTab(listing.sheet);
  if (hasColumn(tab, 'Sheet')) {
    throw new Error(`No tab named "${listing.sheet}"; check the Sheet column.`);
  }
  const roadmap = parseRoadmap(listing, tab);
  if (roadmaps.some((r) => r.slug === roadmap.slug)) {
    throw new Error(`Two roadmaps share the URL slug "${roadmap.slug}"`);
  }
  roadmaps.push(roadmap);
}

if (roadmaps.length === 0) {
  throw new Error('No roadmaps found; refusing to overwrite the snapshot.');
}

const json = `${JSON.stringify(roadmaps, null, 2)}\n`;
validateSnapshot(JSON.parse(json));
writeFileSync(OUTPUT, json);
console.log(
  `Wrote ${roadmaps.length} roadmaps: ${roadmaps.map((r) => r.sheetName).join(', ')}`,
);

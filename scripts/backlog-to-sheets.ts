/**
 * Converts a Single Record backlog export into roadmap sheet CSVs to upload to
 * Google Sheets, and writes a snapshot of them to preview the site.
 *
 *   npm run backlog -- [backlog.csv] [--out <dir>] [--snapshot <file>]
 *
 * Defaults: .data/SRBacklog.csv, .data/backlog and .data/roadmaps.json (which
 * replaces the synced snapshot until the next `npm run sync`). Roadmaps.csv in
 * the output folder holds the rows to add to the first sheet. See
 * backlog.ts for the column mapping.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import {
  convertBacklog,
  readRoadmaps,
  writeSheetFiles,
} from './backlog-pipeline.ts';
import { DEFAULT_SNAPSHOT, writeSnapshot } from './build-snapshot.ts';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    out: { type: 'string', default: '.data/backlog' },
    snapshot: { type: 'string', default: DEFAULT_SNAPSHOT },
  },
});

const input = resolve(positionals[0] ?? '.data/SRBacklog.csv');
const outDir = resolve(values.out);
const snapshot = resolve(values.snapshot);

const { items, skipped, sheets } = convertBacklog(
  readFileSync(input, 'utf8'),
  new Date().toISOString().slice(0, 10),
);

for (const { line, title, reason } of skipped) {
  console.warn(
    `Warning: row ${line}${title ? ` "${title}"` : ''}: ${reason}; skipped`,
  );
}

const files = writeSheetFiles(sheets, outDir);
const roadmaps = await readRoadmaps(outDir);
writeSnapshot(roadmaps, snapshot);

console.log(`Read ${items.length} items from ${input}`);
for (const { name, rows } of sheets.tabs) {
  console.log(`  ${name}: ${rows.length - 1}`);
}
console.log(`Wrote ${files.length} CSVs to ${outDir}`);
console.log(`Wrote ${roadmaps.length} roadmaps to ${snapshot}`);

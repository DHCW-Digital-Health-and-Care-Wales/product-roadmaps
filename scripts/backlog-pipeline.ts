/**
 * Backlog CSV -> sheet CSVs -> roadmap snapshot. The snapshot is built by
 * reading the written CSVs back, so it shows what the same files will give
 * once uploaded to Google Sheets and synced.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { readBacklog, type BacklogReadResult } from './backlog.ts';
import {
  buildSheets,
  tabFileName,
  type RoadmapSheets,
} from './backlog-sheets.ts';
import { buildRoadmaps } from './build-snapshot.ts';
import { formatCsv, parseCsv } from './csv.ts';
import type { Worksheet } from './parse-roadmap.ts';
import type { Roadmap } from '../src/lib/types.ts';

/** The first tab; its rows are added to the existing "Roadmaps" sheet. */
export const LIST_FILE = 'Roadmaps.csv';

export interface Conversion extends BacklogReadResult {
  sheets: RoadmapSheets;
}

/** `text` is the backlog CSV; `lastUpdated` an ISO date for the new roadmaps. */
export function convertBacklog(text: string, lastUpdated: string): Conversion {
  const backlog = readBacklog(parseCsv(text.replace(/^\uFEFF/, '')));
  return { ...backlog, sheets: buildSheets(backlog.items, lastUpdated) };
}

/** Writes the list tab and one CSV per roadmap tab; returns the file names. */
export function writeSheetFiles(sheets: RoadmapSheets, dir: string): string[] {
  mkdirSync(dir, { recursive: true });
  const files = [
    { file: LIST_FILE, rows: sheets.list },
    ...sheets.tabs.map((tab) => ({
      file: tabFileName(tab.name),
      rows: tab.rows,
    })),
  ];
  for (const { file, rows } of files) {
    writeFileSync(join(dir, file), formatCsv(rows));
  }
  return files.map(({ file }) => file);
}

const readWorksheet = (dir: string, file: string, name: string): Worksheet => ({
  name,
  rows: parseCsv(readFileSync(join(dir, file), 'utf8')),
});

/** Parses the CSVs written by writeSheetFiles, as the Google Sheet sync would. */
export function readRoadmaps(dir: string): Promise<Roadmap[]> {
  return buildRoadmaps(readWorksheet(dir, LIST_FILE, 'Roadmaps'), (name) =>
    Promise.resolve(readWorksheet(dir, tabFileName(name), name)),
  );
}

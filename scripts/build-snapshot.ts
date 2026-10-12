/**
 * Turns the roadmap list tab and its card tabs into the snapshot the site
 * loads (.data/roadmaps.json). Shared by the Google Sheet sync and the local
 * CSV scripts so both apply the same checks.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Roadmap } from '../src/lib/types.ts';
import {
  hasColumn,
  parseRoadmap,
  parseRoadmapList,
  type Worksheet,
} from './parse-roadmap.ts';
import { validateSnapshot } from './roadmap-schema.ts';

export const DEFAULT_SNAPSHOT = fileURLToPath(
  new URL('../.data/roadmaps.json', import.meta.url),
);

/**
 * Parses every roadmap named on the list tab. `loadTab` must return a
 * worksheet with the card columns; Google returns the first tab for an
 * unknown name, which is detected by its "Sheet" column.
 */
export async function buildRoadmaps(
  list: Worksheet,
  loadTab: (name: string) => Promise<Worksheet>,
): Promise<Roadmap[]> {
  const roadmaps: Roadmap[] = [];

  for (const listing of parseRoadmapList(list)) {
    const tab = await loadTab(listing.sheet);
    if (hasColumn(tab, 'Sheet')) {
      throw new Error(
        `No tab named "${listing.sheet}"; check the Sheet column.`,
      );
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
  return roadmaps;
}

/** Validates the roadmaps and writes them as the snapshot JSON. */
export function writeSnapshot(
  roadmaps: Roadmap[],
  output: string = DEFAULT_SNAPSHOT,
) {
  const json = `${JSON.stringify(roadmaps, null, 2)}\n`;
  validateSnapshot(JSON.parse(json));
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, json);
}

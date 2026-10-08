/**
 * Turns Google Sheet tabs into roadmaps. Used by sync-roadmaps.ts at build
 * time. The first tab lists the roadmaps, one per row, and its "Sheet" column
 * names the tab holding that roadmap's cards. See README.md for the columns.
 */
import type {
  DetailLine,
  Localised,
  Placement,
  Roadmap,
  RoadmapItem,
  RoadmapMeta,
} from '../src/lib/types.ts';

export interface Worksheet {
  name: string;
  rows: string[][];
}

export interface Listing {
  sheet: string;
  meta: RoadmapMeta;
}

// Values accepted in a card's "Horizon" column, compared case-insensitively.
const PLACEMENTS: Record<string, Placement> = {
  now: 'now',
  next: 'next',
  later: 'later',
  recentlydelivered: 'recently-delivered',
  deliveredthisyear: 'delivered-this-year',
  notdoing: 'not-doing',
};

const DEFAULT_COLOUR = '#325083';

// Missing required columns fail the sync; missing optional ones only warn.
const LIST_COLUMNS = {
  required: ['Sheet'],
  optional: [
    'Title',
    'Status label',
    'Last updated',
    'Colour',
    'Vision',
    'Service description',
  ],
};

const CARD_COLUMNS = {
  required: ['Title', 'Horizon'],
  optional: ['Description', 'Outcome', 'Status', 'Phase', 'Labels', 'Details'],
};

const key = (value = '') => value.toLowerCase().replace(/[^a-z0-9]/g, '');

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const loc = (en = ''): Localised => ({ en: en.trim(), cy: '' });

// Printed as GitHub Actions annotations so editors can spot sheet mistakes.
function warn(sheet: string, message: string) {
  console.warn(`::warning title=${sheet}::${message}`);
}

export const hasColumn = (sheet: Worksheet, name: string) =>
  (sheet.rows[0] ?? []).some((cell) => key(cell) === key(name));

function checkColumns(sheet: Worksheet, columns: typeof CARD_COLUMNS) {
  const missing = (names: string[]) =>
    names.filter((name) => !hasColumn(sheet, name));
  const required = missing(columns.required);
  if (required.length > 0) {
    throw new Error(
      `Tab "${sheet.name}" is missing required column(s): ${required.join(', ')}`,
    );
  }
  for (const name of missing(columns.optional)) {
    warn(sheet.name, `Missing column "${name}"; its values will be blank`);
  }
}

/** Row 1 is the header; returns the other rows keyed by normalised header. */
function readTable(sheet: Worksheet): Record<string, string>[] {
  const [header = [], ...rows] = sheet.rows;
  const columns = header.map((cell) => key(cell));
  return rows
    .map((cells) =>
      Object.fromEntries(
        columns.map((column, index) => [column, cells[index]?.trim() ?? '']),
      ),
    )
    .filter((row) => Object.values(row).some(Boolean));
}

/** Accepts YYYY-MM-DD or the UK display format DD/MM/YYYY. */
function toIsoDate(value: string): string {
  const uk = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (uk) {
    const [, day, month, year] = uk;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return value;
}

/** Only allow plain hex colours so sheet content can't inject CSS. */
function safeColour(sheet: string, value: string): string {
  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value)) return value;
  if (value) warn(sheet, `Colour "${value}" is not a hex colour like #325083`);
  return DEFAULT_COLOUR;
}

/** One list entry per line; leading "-" characters nest an entry. */
function parseDetails(text: string): DetailLine[] | undefined {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return undefined;

  return lines.map((line) => ({
    level: line.match(/^-*/)?.[0].length ?? 0,
    text: loc(line.replace(/^-+\s*/, '')),
  }));
}

function toItem(row: Record<string, string>): RoadmapItem {
  const labels = (row.labels ?? '')
    .split(/[,\n]/)
    .map((label) => label.trim())
    .filter(Boolean);

  return {
    title: loc(row.title),
    description: loc(row.description),
    outcome: row.outcome ? loc(row.outcome) : undefined,
    status: row.status?.toLowerCase().replace(/\s+/g, '-') || undefined,
    phase: row.phase || undefined,
    labels: labels.length > 0 ? labels : undefined,
    details: parseDetails(row.details ?? ''),
  };
}

/** Reads the first tab: one roadmap per row, settings as columns. */
export function parseRoadmapList(sheet: Worksheet): Listing[] {
  checkColumns(sheet, LIST_COLUMNS);
  return readTable(sheet)
    .filter((row) => row.sheet)
    .map((row) => ({
      sheet: row.sheet,
      meta: {
        title: loc(row.title || row.sheet),
        statusLabel: loc(row.statuslabel),
        lastUpdated: toIsoDate(row.lastupdated ?? ''),
        colour: safeColour(row.sheet, row.colour ?? ''),
        vision: loc(row.vision),
        serviceDescription: loc(row.servicedescription),
      },
    }));
}

/** Reads a roadmap tab: one card per row. */
export function parseRoadmap(listing: Listing, sheet: Worksheet): Roadmap {
  checkColumns(sheet, CARD_COLUMNS);
  const items = Object.fromEntries(
    Object.values(PLACEMENTS).map((placement) => [placement, []]),
  ) as unknown as Roadmap['items'];

  for (const row of readTable(sheet)) {
    if (!row.title) {
      warn(sheet.name, 'A row has no Title; skipped');
      continue;
    }
    const placement = PLACEMENTS[key(row.horizon)];
    if (!placement) {
      warn(
        sheet.name,
        `"${row.title}" has unknown Horizon "${row.horizon ?? ''}"; skipped`,
      );
      continue;
    }
    items[placement].push(toItem(row));
  }

  return {
    slug: slugify(listing.sheet),
    sheetName: listing.sheet,
    meta: listing.meta,
    items,
  };
}

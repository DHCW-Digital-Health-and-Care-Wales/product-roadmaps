/**
 * Turns Google Sheet tabs into roadmaps. Used by sync-roadmaps.ts at build
 * time. The first tab lists the roadmaps, one per row, and its "Sheet" column
 * names the tab holding that roadmap's cards. See README.md for the columns.
 */
import {
  PLACEMENT_IDS,
  type DetailLine,
  type Localised,
  type Placement,
  type Roadmap,
  type RoadmapItem,
  type RoadmapMeta,
} from '../src/lib/types.ts';

export interface Worksheet {
  name: string;
  rows: string[][];
}

export interface Listing {
  sheet: string;
  meta: RoadmapMeta;
}

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
  optional: ['Description', 'Outcome', 'Phase', 'Labels', 'Details'],
};

const key = (value = '') => value.toLowerCase().replace(/[^a-z0-9]/g, '');

// Values accepted in a card's "Horizon" column, so "Recently delivered" matches
// 'recently-delivered'.
const PLACEMENTS = new Map<string, Placement>(
  PLACEMENT_IDS.map((placement) => [key(placement), placement]),
);

// Folds accents first so Welsh letters such as ŵ and ŷ keep their base letter.
export const slugify = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Printed as GitHub Actions annotations so editors can spot sheet mistakes.
function warn(sheet: string, message: string) {
  console.warn(`::warning title=${sheet}::${message}`);
}

// Welsh is optional: "Title (cy)" holds the Welsh for "Title", and a missing
// column or blank cell falls back to English.
const welshKey = (column: string) => key(`${column} (cy)`);

// A gap in word count bigger than 2x usually means a missing or misplaced
// translation. Short text is skipped as Welsh phrases often run longer.
const MIN_WORDS_TO_COMPARE = 8;
const MIN_LENGTH_RATIO = 0.5;

const countWords = (text: string) =>
  text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;

/** Describes a likely translation mistake, or returns undefined. */
export function checkTranslation(en: string, cy: string): string | undefined {
  if (!cy) return undefined;
  if (!en) return 'has Welsh but no English, so the Welsh is not shown';
  const enWords = countWords(en);
  const cyWords = countWords(cy);
  const longer = Math.max(enWords, cyWords);
  if (longer < MIN_WORDS_TO_COMPARE) return undefined;
  if (Math.min(enWords, cyWords) / longer >= MIN_LENGTH_RATIO) return undefined;
  return `Welsh has ${cyWords} word(s) but English has ${enWords}; check the translation`;
}

type Row = Record<string, string>;

/** Reads a column and its optional Welsh column, warning about likely mistakes. */
function readText(
  sheet: string,
  row: Row,
  column: string,
  label: string,
): Localised {
  const en = row[key(column)] ?? '';
  const cy = row[welshKey(column)] ?? '';
  const problem = checkTranslation(en, cy);
  if (problem) warn(sheet, `${column} of "${label}" ${problem}`);
  return { en, cy };
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
function readTable(sheet: Worksheet): Row[] {
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

/** Accepts YYYY-MM-DD or UK DD/MM/YYYY; invalid dates warn and are blanked. */
export function toIsoDate(sheet: string, value: string): string {
  if (!value) return '';
  const match =
    /^(?<year>\d{4})-(?<month>\d{1,2})-(?<day>\d{1,2})$/.exec(value) ??
    /^(?<day>\d{1,2})\/(?<month>\d{1,2})\/(?<year>\d{4})$/.exec(value);
  const { year, month, day } = match?.groups ?? {};
  if (year && month && day) {
    const date = new Date(Date.UTC(+year, +month - 1, +day));
    if (
      date.getUTCFullYear() === +year &&
      date.getUTCMonth() === +month - 1 &&
      date.getUTCDate() === +day
    ) {
      return date.toISOString().slice(0, 10);
    }
  }
  warn(
    sheet,
    `Date "${value}" is not a real date like 2026-10-01 or 01/10/2026`,
  );
  return '';
}

/** Only allow plain hex colours so sheet content can't inject CSS. */
function safeColour(sheet: string, value: string): string {
  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value)) return value;
  if (value) warn(sheet, `Colour "${value}" is not a hex colour like #325083`);
  return DEFAULT_COLOUR;
}

/**
 * Pairs English and Welsh list entries by position. If the counts differ the
 * Welsh can't be matched up, so it is ignored with a warning.
 */
function pairLists(
  sheet: string,
  column: string,
  label: string,
  en: string[],
  cy: string[],
): Localised[] {
  if (cy.length > 0 && cy.length !== en.length) {
    warn(
      sheet,
      `${column} of "${label}" has ${en.length} English and ${cy.length} Welsh entries; the Welsh is ignored`,
    );
    cy = [];
  }
  return en.map((text, index) => ({ en: text, cy: cy[index] ?? '' }));
}

const splitLabels = (text: string) =>
  text
    .split(/[,\n]/)
    .map((label) => label.trim())
    .filter(Boolean);

const splitLines = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const stripDashes = (line: string) => line.replace(/^-+\s*/, '');

/**
 * One list entry per line; leading "-" characters nest an entry. Welsh lines
 * take their nesting from the English line in the same position.
 */
function parseDetails(
  sheet: string,
  row: Row,
  label: string,
): DetailLine[] | undefined {
  const { en, cy } = readText(sheet, row, 'Details', label);
  const lines = splitLines(en);
  if (lines.length === 0) return undefined;

  const texts = pairLists(
    sheet,
    'Details',
    label,
    lines.map(stripDashes),
    splitLines(cy).map(stripDashes),
  );
  return lines.map((line, index) => ({
    level: /^-*/.exec(line)?.[0].length ?? 0,
    text: texts[index],
  }));
}

function toItem(sheet: string, row: Row): RoadmapItem {
  const label = row.title ?? '';
  const text = (column: string) => readText(sheet, row, column, label);
  const outcome = text('Outcome');
  const phase = text('Phase');
  const labels = pairLists(
    sheet,
    'Labels',
    label,
    splitLabels(row.labels ?? ''),
    splitLabels(row[welshKey('Labels')] ?? ''),
  );

  return {
    title: text('Title'),
    description: text('Description'),
    outcome: outcome.en ? outcome : undefined,
    phase: phase.en ? phase : undefined,
    labels: labels.length > 0 ? labels : undefined,
    details: parseDetails(sheet, row, label),
  };
}

/** Reads the first tab: one roadmap per row, settings as columns. */
export function parseRoadmapList(sheet: Worksheet): Listing[] {
  checkColumns(sheet, LIST_COLUMNS);
  return readTable(sheet)
    .filter((row) => row.sheet)
    .map((row) => {
      const text = (column: string) =>
        readText(sheet.name, row, column, row.sheet);
      const title = text('Title');
      return {
        sheet: row.sheet,
        meta: {
          title: { ...title, en: title.en || row.sheet },
          statusLabel: text('Status label'),
          lastUpdated: toIsoDate(row.sheet, row.lastupdated ?? ''),
          colour: safeColour(row.sheet, row.colour ?? ''),
          vision: text('Vision'),
          serviceDescription: text('Service description'),
        },
      };
    });
}

/** Reads a roadmap tab: one card per row. */
export function parseRoadmap(listing: Listing, sheet: Worksheet): Roadmap {
  checkColumns(sheet, CARD_COLUMNS);
  const slug = slugify(listing.sheet);
  if (!slug) {
    throw new Error(
      `Tab "${listing.sheet}" has no letters or digits to use in its URL; rename the tab.`,
    );
  }
  const items = Object.fromEntries(
    PLACEMENT_IDS.map((placement) => [placement, []]),
  ) as unknown as Roadmap['items'];

  for (const row of readTable(sheet)) {
    if (!row.title) {
      warn(sheet.name, 'A row has no Title; skipped');
      continue;
    }
    const placement = PLACEMENTS.get(key(row.horizon));
    if (!placement) {
      warn(
        sheet.name,
        `"${row.title}" has unknown Horizon "${row.horizon ?? ''}"; skipped`,
      );
      continue;
    }
    items[placement].push(toItem(sheet.name, row));
  }

  return {
    slug,
    sheetName: listing.sheet,
    meta: listing.meta,
    items,
  };
}

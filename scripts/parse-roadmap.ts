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

/** A sheet problem, shown in the sync log and the workflow run summary. */
export interface SheetWarning {
  sheet: string;
  /** Spreadsheet row number, when the problem is in one row. */
  row?: number;
  message: string;
}

const DEFAULT_COLOUR = '#325083';

// Missing required columns fail the sync; missing optional ones only warn.
// `welsh` columns may also have a "<Column> (cy)" column.
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
  welsh: ['Title', 'Status label', 'Vision', 'Service description'],
};

const CARD_COLUMNS = {
  required: ['Title', 'Horizon'],
  optional: ['Description', 'Outcome', 'Phase', 'Labels', 'Details'],
  welsh: ['Title', 'Description', 'Outcome', 'Phase', 'Labels', 'Details'],
};

type Columns = typeof CARD_COLUMNS;

// Folds accents first so Welsh letters such as ŵ and ŷ keep their base letter.
const fold = (value: string) =>
  value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase();

const key = (value = '') => fold(value).replace(/[^a-z0-9]/g, '');

// Values accepted in a card's "Horizon" column, so "Recently delivered" matches
// 'recently-delivered'.
const PLACEMENTS = new Map<string, Placement>(
  PLACEMENT_IDS.map((placement) => [key(placement), placement]),
);

export const slugify = (value: string) =>
  fold(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const collected: SheetWarning[] = [];

/** Returns and clears the warnings collected so far. */
export const takeWarnings = () => collected.splice(0);

export const formatWarning = ({ sheet, row, message }: SheetWarning) =>
  `Warning: ${sheet}${row ? `, row ${row}` : ''}: ${message}`;

// Sheet text can contain newlines; one line per warning stops a line starting
// with "::" being run as a GitHub Actions workflow command.
const oneLine = (text: string) => text.replace(/\s*[\r\n]+\s*/g, ' ');

function warn(sheet: string, message: string, row?: number) {
  const warning = { sheet: oneLine(sheet), row, message: oneLine(message) };
  collected.push(warning);
  console.warn(formatWarning(warning));
}

// Welsh is optional: "Title (cy)" holds the Welsh for "Title", and a missing
// column or blank cell falls back to English. The ":" can't come from key().
const welshKey = (column: string) => `${key(column)}:cy`;

// Matches "Title (cy)", "Title(CY)", "Title - Cymraeg", "Title (Welsh)" etc.
const WELSH_HEADER = /^(.+?)[\s([\-_]+(?:cy|cym|cymraeg|welsh)[\s)\]]*$/i;

// Welsh usually runs about as long as English, or up to a third longer, so a
// gap of more than 2x in words suggests a missing or misplaced translation.
// Short text is only checked for being untranslated or a placeholder.
export const TRANSLATION_CHECK = {
  minWordsToCompare: 8,
  minLengthRatio: 0.5,
  minWordsIfSame: 3,
};

const PLACEHOLDER = /^(?:todo|tbc|tbd|x+|\?+|n\/?a)$/i;

const countWords = (text: string) =>
  text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;

const sameText = (a: string, b: string) =>
  a.toLowerCase().replace(/\s+/g, ' ') === b.toLowerCase().replace(/\s+/g, ' ');

// Names such as "NHS App" are the same in both languages, so short text is exempt.
const isUntranslated = (en: string, cy: string) =>
  countWords(en) >= TRANSLATION_CHECK.minWordsIfSame && sameText(en, cy);

/** Describes a likely translation mistake, or returns undefined. */
export function checkTranslation(en: string, cy: string): string | undefined {
  if (!cy) return undefined;
  if (!en) return 'has Welsh but no English, so the Welsh is not shown';
  if (PLACEHOLDER.test(cy)) return `Welsh "${cy}" looks like a placeholder`;
  if (isUntranslated(en, cy)) {
    return 'Welsh is the same as the English; translate it or leave the Welsh blank';
  }
  const enWords = countWords(en);
  const cyWords = countWords(cy);
  const longer = Math.max(enWords, cyWords);
  if (longer < TRANSLATION_CHECK.minWordsToCompare) return undefined;
  if (Math.min(enWords, cyWords) / longer >= TRANSLATION_CHECK.minLengthRatio) {
    return undefined;
  }
  return `Welsh has ${cyWords} word(s) but English has ${enWords}; check the translation`;
}

type Row = Record<string, string>;

/** Where a value comes from, for warnings. */
interface RowContext {
  sheet: string;
  line: number;
  label: string;
  cells: Row;
}

/**
 * Reads a column and its optional Welsh column, warning about likely mistakes.
 * Welsh with no English is dropped, as it would never be shown.
 */
function readText(ctx: RowContext, column: string, fallback = ''): Localised {
  const en = ctx.cells[key(column)] || fallback;
  const cy = ctx.cells[welshKey(column)] ?? '';
  const problem = checkTranslation(en, cy);
  if (problem)
    warn(ctx.sheet, `${column} of "${ctx.label}": ${problem}`, ctx.line);
  return { en, cy: en ? cy : '' };
}

export const hasColumn = (sheet: Worksheet, name: string) =>
  (sheet.rows[0] ?? []).some((cell) => key(cell) === key(name));

function checkColumns(sheet: Worksheet, columns: Columns) {
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

/**
 * Maps each header cell to a column key, or undefined if it is ignored: a
 * repeat of an earlier column, or Welsh for a column that has no Welsh.
 */
function readHeader(
  sheet: Worksheet,
  columns: Columns,
): (string | undefined)[] {
  const translatable = new Set(columns.welsh.map((name) => key(name)));
  const seen = new Map<string, string>();
  return (sheet.rows[0] ?? []).map((cell) => {
    const base = WELSH_HEADER.exec(cell.trim())?.[1];
    let column = key(cell);
    if (base !== undefined) {
      if (!translatable.has(key(base))) {
        warn(
          sheet.name,
          `Column "${cell}" looks like Welsh, but "${base}" can't have a Welsh version; ignored`,
        );
        return undefined;
      }
      column = welshKey(base);
    }
    if (!column) return undefined;
    const earlier = seen.get(column);
    if (earlier !== undefined) {
      warn(
        sheet.name,
        `Columns "${earlier}" and "${cell}" are the same column; only "${earlier}" is used`,
      );
      return undefined;
    }
    seen.set(column, cell);
    return column;
  });
}

/** Row 1 is the header; returns the other rows keyed by column key. */
function readTable(
  sheet: Worksheet,
  columns: Columns,
): { line: number; cells: Row }[] {
  const header = readHeader(sheet, columns);
  return sheet.rows
    .slice(1)
    .map((cells, index) => ({
      line: index + 2,
      cells: Object.fromEntries(
        header.flatMap((column, i) =>
          column ? [[column, cells[i]?.trim() ?? '']] : [],
        ),
      ),
    }))
    .filter(({ cells }) => Object.values(cells).some(Boolean));
}

/** Accepts YYYY-MM-DD or UK DD/MM/YYYY; invalid dates warn and are blanked. */
export function toIsoDate(sheet: string, value: string, row?: number): string {
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
    row,
  );
  return '';
}

/** Only allow plain hex colours so sheet content can't inject CSS. */
function safeColour(sheet: string, value: string, row: number): string {
  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value)) return value;
  if (value) {
    warn(sheet, `Colour "${value}" is not a hex colour like #325083`, row);
  }
  return DEFAULT_COLOUR;
}

/**
 * Pairs English and Welsh list entries by position; a blank Welsh entry falls
 * back to English. If the counts differ the Welsh can't be matched up, so it
 * is ignored with a warning.
 */
function pairLists(
  ctx: RowContext,
  column: string,
  en: string[],
  cy: string[],
): Localised[] {
  if (cy.length > 0 && cy.length !== en.length) {
    warn(
      ctx.sheet,
      `${column} of "${ctx.label}" has ${en.length} English and ${cy.length} Welsh entries, so the Welsh is ignored. English: ${en.join(' | ')}. Welsh: ${cy.join(' | ')}`,
      ctx.line,
    );
    cy = [];
  }
  return en.map((text, index) => ({ en: text, cy: cy[index] ?? '' }));
}

// Blank entries keep their place so they line up with the other language;
// only trailing blanks (such as a trailing comma) are dropped.
function splitEntries(text: string, separator: RegExp): string[] {
  const entries = text.split(separator).map((entry) => entry.trim());
  while (entries.at(-1) === '') entries.pop();
  return entries;
}

// A Welsh entry of just "-" means "use the English here".
const orBlank = (text: string) => (/^-*$/.test(text) ? '' : text);

const levelOf = (line: string) => /^-*/.exec(line)?.[0].length ?? 0;

/**
 * Strips nesting dashes from a Welsh line: any dashes followed by a space, or
 * up to as many as the English line has, so "-5 gradd" keeps its dash.
 */
const stripWelshDashes = (line: string, level: number) =>
  orBlank(
    /^-+\s/.test(line)
      ? line.replace(/^-+\s+/, '')
      : line.slice(Math.min(level, levelOf(line))),
  );

/**
 * One list entry per line; leading "-" characters nest an entry. Welsh lines
 * take their nesting from the English line in the same position.
 */
function parseDetails(ctx: RowContext): DetailLine[] | undefined {
  const { en, cy } = readText(ctx, 'Details');
  const lines = splitEntries(en, /\r?\n/);
  const levels = lines.map(levelOf);
  const texts = pairLists(
    ctx,
    'Details',
    lines.map((line) => line.replace(/^-+\s*/, '')),
    splitEntries(cy, /\r?\n/).map((line, index) =>
      stripWelshDashes(line, levels[index] ?? 0),
    ),
  );
  if (!isUntranslated(en, cy)) {
    texts.forEach((text, index) => {
      if (isUntranslated(text.en, text.cy)) {
        warn(
          ctx.sheet,
          `Details line ${index + 1} of "${ctx.label}": Welsh is the same as the English`,
          ctx.line,
        );
      }
    });
  }
  const details = texts.flatMap((text, index) =>
    text.en ? [{ level: levels[index] ?? 0, text }] : [],
  );
  return details.length > 0 ? details : undefined;
}

function parseLabels(ctx: RowContext): Localised[] | undefined {
  const { en, cy } = readText(ctx, 'Labels');
  const seen = new Set<string>();
  const labels = pairLists(
    ctx,
    'Labels',
    splitEntries(en, /[,\n]/),
    splitEntries(cy, /[,\n]/).map(orBlank),
  ).filter((label) => {
    if (!label.en || seen.has(label.en)) return false;
    seen.add(label.en);
    return true;
  });
  return labels.length > 0 ? labels : undefined;
}

function toItem(ctx: RowContext): RoadmapItem {
  const outcome = readText(ctx, 'Outcome');
  const phase = readText(ctx, 'Phase');
  return {
    title: readText(ctx, 'Title'),
    description: readText(ctx, 'Description'),
    outcome: outcome.en ? outcome : undefined,
    phase: phase.en ? phase : undefined,
    labels: parseLabels(ctx),
    details: parseDetails(ctx),
  };
}

/** Reads the first tab: one roadmap per row, settings as columns. */
export function parseRoadmapList(sheet: Worksheet): Listing[] {
  checkColumns(sheet, LIST_COLUMNS);
  return readTable(sheet, LIST_COLUMNS)
    .filter(({ cells }) => cells.sheet)
    .map(({ line, cells }) => {
      const ctx = { sheet: sheet.name, line, label: cells.sheet, cells };
      return {
        sheet: cells.sheet,
        meta: {
          title: readText(ctx, 'Title', cells.sheet),
          statusLabel: readText(ctx, 'Status label'),
          lastUpdated: toIsoDate(sheet.name, cells.lastupdated ?? '', line),
          colour: safeColour(sheet.name, cells.colour ?? '', line),
          vision: readText(ctx, 'Vision'),
          serviceDescription: readText(ctx, 'Service description'),
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

  for (const { line, cells } of readTable(sheet, CARD_COLUMNS)) {
    if (!cells.title) {
      warn(sheet.name, 'A row has no Title; skipped', line);
      continue;
    }
    const placement = PLACEMENTS.get(key(cells.horizon));
    if (!placement) {
      warn(
        sheet.name,
        `"${cells.title}" has unknown Horizon "${cells.horizon ?? ''}"; skipped`,
        line,
      );
      continue;
    }
    items[placement].push(
      toItem({ sheet: sheet.name, line, label: cells.title, cells }),
    );
  }

  return {
    slug,
    sheetName: listing.sheet,
    meta: listing.meta,
    items,
  };
}

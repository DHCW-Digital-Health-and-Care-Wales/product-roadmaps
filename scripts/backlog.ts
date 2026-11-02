/**
 * Reads a Single Record backlog export (SRBacklog.csv) into roadmap items.
 * Only rows with a "Now, Next, Later" value of Now, Next, Later or Done are
 * used; every other row and column is ignored. See backlog-sheets.ts for the
 * sheet layout built from the result.
 */
import { htmlToText } from './html-to-text.ts';

/** Horizon values for the roadmap sheet's `Horizon` column, by backlog status. */
const HORIZON_BY_STATUS = new Map([
  ['now', 'Now'],
  ['next', 'Next'],
  ['later', 'Later'],
  ['done', 'Recently delivered'],
]);

export const BACKLOG_COLUMNS = {
  title: 'Item (REQUIRED)',
  description: 'Description',
  domain: 'PRODUCT DOMAINS',
  status: 'Now, Next, Later',
  // In label order; each non-blank, non-"N/A" value becomes a label.
  labels: [
    'Product',
    'Healthcare Pathways',
    'Strategic Programme',
    'Organisation',
  ],
} as const;

export interface BacklogItem {
  /** Roadmap name as written in the backlog, e.g. "TESTINGS & RESULTS". */
  domain: string;
  title: string;
  /** Plain text; the backlog holds HTML. */
  description: string;
  horizon: string;
  labels: string[];
  /** Spreadsheet row number, for messages. */
  line: number;
}

/** A row in a used status that could not become an item. */
export interface SkippedRow {
  line: number;
  title: string;
  reason: string;
}

export interface BacklogReadResult {
  items: BacklogItem[];
  skipped: SkippedRow[];
}

const normalise = (text: string) => text.replace(/\s+/g, ' ').trim();

const columnKey = (header: string) => normalise(header).toLowerCase();

/**
 * Splits a multi-value cell. Multiple values are exported as `"WCP","Mobile"`
 * with the quotes in the text; otherwise the whole cell is one value, since
 * values such as "Meds, Prescriptions & Shared Meds Record (ePMA)" contain commas.
 */
export function splitValues(cell: string): string[] {
  const quoted = Array.from(cell.matchAll(/"([^"]*)"/g), (match) => match[1]);
  return (quoted.length > 0 ? quoted : [cell])
    .map(normalise)
    .filter((value) => value !== '' && !/n\/a/i.test(value));
}

/**
 * Sheet labels are comma separated, so commas inside a label become " / ".
 * Duplicates (ignoring case) are dropped.
 */
export function toLabels(cells: string[]): string[] {
  const seen = new Set<string>();
  return cells
    .flatMap(splitValues)
    .map((value) => value.replace(/\s*,\s*/g, ' / '))
    .filter((label) => {
      const id = label.toLowerCase();
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
}

function findColumns(header: string[]) {
  const indexes = new Map(header.map((name, i) => [columnKey(name), i]));
  const find = (name: string) => indexes.get(columnKey(name));
  const wanted = [
    BACKLOG_COLUMNS.title,
    BACKLOG_COLUMNS.description,
    BACKLOG_COLUMNS.domain,
    BACKLOG_COLUMNS.status,
    ...BACKLOG_COLUMNS.labels,
  ];
  const missing = wanted.filter((name) => find(name) === undefined);
  if (missing.length > 0) {
    throw new Error(`Backlog is missing column(s): ${missing.join(', ')}`);
  }
  const at = (name: string) => find(name)!;
  return {
    title: at(BACKLOG_COLUMNS.title),
    description: at(BACKLOG_COLUMNS.description),
    domain: at(BACKLOG_COLUMNS.domain),
    status: at(BACKLOG_COLUMNS.status),
    labels: BACKLOG_COLUMNS.labels.map(at),
  };
}

/** `rows` is the parsed CSV, header first. */
export function readBacklog(rows: string[][]): BacklogReadResult {
  const [header, ...body] = rows;
  if (!header) throw new Error('Backlog is empty');
  const columns = findColumns(header);
  const items: BacklogItem[] = [];
  const skipped: SkippedRow[] = [];

  body.forEach((cells, index) => {
    const line = index + 2;
    const horizon = HORIZON_BY_STATUS.get(
      normalise(cells[columns.status] ?? '').toLowerCase(),
    );
    if (!horizon) return;

    const title = normalise(cells[columns.title] ?? '');
    const domain = normalise(cells[columns.domain] ?? '');
    if (!title || !domain) {
      skipped.push({
        line,
        title,
        reason: title ? 'no PRODUCT DOMAINS value' : 'no Item title',
      });
      return;
    }
    items.push({
      domain,
      title,
      description: htmlToText(cells[columns.description] ?? ''),
      horizon,
      labels: toLabels(columns.labels.map((i) => cells[i] ?? '')),
      line,
    });
  });

  return { items, skipped };
}

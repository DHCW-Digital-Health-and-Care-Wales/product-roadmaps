/**
 * Reads a Single Record backlog export (SRBacklog.csv) into roadmap items.
 * Only rows with a "Now, Next, Later" value of Now, Next, Later or Done are
 * used; every other row and column is ignored. See backlog-sheets.ts for the
 * sheet layout built from the result.
 */
import { htmlToText } from './html-to-text.ts';

/** A column name, or `{ value }` for the same text on every row. */
export type Field = string | { value: string };

/** Keeps rows whose column includes `includes` among its values, or is blank. */
export type RowFilter =
  { column: string; includes: string } | { column: string; blank: true };

/** Which backlog columns feed each roadmap item field. */
export interface BacklogMapping {
  title: string;
  description: string;
  /** The roadmap name. */
  domain: Field;
  /** The status, translated to a horizon by `statuses`. */
  status: Field;
  /**
   * Status value (any case) -> Horizon; rows with other values are ignored.
   * Without it, any non-blank status is used as the horizon as it is.
   */
  statuses?: Record<string, string>;
  /** Only rows passing this filter are used. */
  only?: RowFilter;
  /** In label order; each non-blank, non-"N/A" value becomes a label. */
  labels: readonly string[];
}

export const DEFAULT_MAPPING: BacklogMapping = {
  title: 'Item (REQUIRED)',
  description: 'Description',
  domain: 'PRODUCT DOMAINS',
  status: 'Now, Next, Later',
  statuses: {
    now: 'Now',
    next: 'Next',
    later: 'Later',
    done: 'Recently delivered',
  },
  labels: [
    'Product',
    'Healthcare Pathways',
    'Strategic Programme',
    'Organisation',
  ],
};

export interface BacklogItem {
  /** Roadmap name as written in the backlog, e.g. "TESTINGS & RESULTS". */
  domain: string;
  /** Tab name to use as written, instead of title-casing the domain. */
  tabName?: string;
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

function findColumns(header: string[], mapping: BacklogMapping) {
  const indexes = new Map(header.map((name, i) => [columnKey(name), i]));
  const find = (name: string) => indexes.get(columnKey(name));
  const wanted = [
    mapping.title,
    mapping.description,
    ...[mapping.domain, mapping.status].filter((f) => typeof f === 'string'),
    ...(mapping.only ? [mapping.only.column] : []),
    ...mapping.labels,
  ];
  const missing = wanted.filter((name) => find(name) === undefined);
  if (missing.length > 0) {
    throw new Error(`Backlog is missing column(s): ${missing.join(', ')}`);
  }
  const at = (name: string) => find(name)!;
  const reader = (field: Field) => {
    if (typeof field !== 'string') return () => field.value;
    const index = at(field);
    return (cells: string[]) => cells[index] ?? '';
  };
  const only = mapping.only;
  const onlyIndex = only && at(only.column);
  return {
    title: at(mapping.title),
    description: at(mapping.description),
    domain: reader(mapping.domain),
    status: reader(mapping.status),
    labels: mapping.labels.map(at),
    keep: (cells: string[]) => {
      if (!only || onlyIndex === undefined) return true;
      const values = splitValues(cells[onlyIndex] ?? '');
      return 'blank' in only
        ? values.length === 0
        : values.map(columnKey).includes(columnKey(only.includes));
    },
  };
}

/** `rows` is the parsed CSV, header first. */
export function readBacklog(
  rows: string[][],
  mapping: BacklogMapping = DEFAULT_MAPPING,
): BacklogReadResult {
  const [header, ...body] = rows;
  if (!header) throw new Error('Backlog is empty');
  const columns = findColumns(header, mapping);
  const horizons =
    mapping.statuses &&
    new Map(
      Object.entries(mapping.statuses).map(([k, v]) => [columnKey(k), v]),
    );
  const items: BacklogItem[] = [];
  const skipped: SkippedRow[] = [];

  body.forEach((cells, index) => {
    const line = index + 2;
    if (!columns.keep(cells)) return;
    const status = normalise(columns.status(cells));
    const horizon = horizons ? horizons.get(columnKey(status)) : status;
    if (!horizon) return;

    const title = normalise(cells[columns.title] ?? '');
    const domain = normalise(columns.domain(cells));
    if (!title || !domain) {
      skipped.push({
        line,
        title,
        reason: title
          ? `no ${typeof mapping.domain === 'string' ? mapping.domain : 'roadmap name'} value`
          : 'no Item title',
      });
      return;
    }
    items.push({
      domain,
      tabName: typeof mapping.domain === 'string' ? undefined : domain,
      title,
      description: htmlToText(cells[columns.description] ?? ''),
      horizon,
      labels: toLabels(columns.labels.map((i) => cells[i] ?? '')),
      line,
    });
  });

  return { items, skipped };
}

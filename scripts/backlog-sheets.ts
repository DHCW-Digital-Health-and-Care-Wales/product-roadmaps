/**
 * Lays backlog items out as Google Sheet tabs in the format described in the
 * README: one row per roadmap for the first ("Roadmaps") tab, and one tab of
 * cards per roadmap.
 */
import type { BacklogItem } from './backlog.ts';

// Same columns as sheets/Roadmaps.csv, so rows can be pasted under its header.
export const LIST_HEADER = [
  'Sheet',
  'Title',
  'Status label',
  'Last updated',
  'Colour',
  'Vision',
  'Service description',
  'Title (cy)',
  'Status label (cy)',
  'Service description (cy)',
];

export const CARD_HEADER = [
  'Title',
  'Description',
  'Outcome',
  'Horizon',
  'Phase',
  'Labels',
  'Details',
];

export interface RoadmapTab {
  /** Tab name; also the `Sheet` value on the first tab. */
  name: string;
  /** Header row first. */
  rows: string[][];
}

export interface RoadmapSheets {
  /** The first tab, header row first. */
  list: string[][];
  tabs: RoadmapTab[];
}

/** "TESTINGS & RESULTS" -> "Testings & Results". */
export const toTabName = (domain: string) =>
  domain
    .toLowerCase()
    .replace(/(^|[\s(/-])(\p{L})/gu, (_, before: string, letter: string) => {
      return before + letter.toUpperCase();
    });

const domainKey = (domain: string) => domain.toLowerCase();

/** A file name for a tab's CSV: its name without characters invalid in paths. */
export const tabFileName = (name: string) =>
  `${name.replace(/[\\/:*?"<>|]/g, '-')}.csv`;

const toCardRow = (item: BacklogItem): string[] => [
  item.title,
  item.description,
  '',
  item.horizon,
  '',
  item.labels.join(', '),
  '',
];

/**
 * Groups items into one roadmap per domain, sorted by name. Items stay in
 * backlog order within each roadmap. `lastUpdated` is an ISO date.
 */
export function buildSheets(
  items: BacklogItem[],
  lastUpdated: string,
): RoadmapSheets {
  const groups = new Map<string, { name: string; items: BacklogItem[] }>();
  for (const item of items) {
    const key = domainKey(item.domain);
    const group = groups.get(key) ?? {
      name: toTabName(item.domain),
      items: [],
    };
    group.items.push(item);
    groups.set(key, group);
  }

  const tabs = [...groups.values()]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ name, items: group }) => ({
      name,
      rows: [CARD_HEADER, ...group.map(toCardRow)],
    }));

  const list = [
    LIST_HEADER,
    ...tabs.map(({ name }) =>
      LIST_HEADER.map((column) => {
        if (column === 'Sheet' || column === 'Title') return name;
        return column === 'Last updated' ? lastUpdated : '';
      }),
    ),
  ];
  return { list, tabs };
}

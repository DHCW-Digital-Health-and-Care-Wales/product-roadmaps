/**
 * Presentation helpers for the roadmap.
 */
import {
  CATEGORIES,
  HORIZONS,
  ORGANISATIONS,
  OTHER_CATEGORY,
  ROADMAP_INTRO,
  SECTIONS,
  organisation,
  type Category,
} from './content';
import { fill, t, type Lang } from './i18n';
import { UI } from './strings';
import { compareText, fold } from './text';
import {
  HORIZON_IDS,
  PLACEMENT_IDS,
  type CategoryId,
  type Localised,
  type OrganisationId,
  type Placement,
  type Roadmap,
  type RoadmapItem,
  type RoadmapMeta,
  NO_ORG_FILTER,
  type OrgFilter,
} from './types';

// Not Intl: some browsers lack Welsh locale data, which would also break hydration.
const MONTHS = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  cy: [
    'Ionawr',
    'Chwefror',
    'Mawrth',
    'Ebrill',
    'Mai',
    'Mehefin',
    'Gorffennaf',
    'Awst',
    'Medi',
    'Hydref',
    'Tachwedd',
    'Rhagfyr',
  ],
};

/**
 * Format an ISO date (YYYY-MM-DD) as a readable day-month-year string in the
 * active language, for example "26 June 2026", or return the raw value if it
 * isn't one. Used only for "last updated"; roadmap items never show dates.
 */
export function formatDate(iso: string, lang: 'cy' | 'en'): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const month = match ? MONTHS[lang][Number(match[2]) - 1] : undefined;
  if (!match || !month) return iso;
  return `${Number(match[3])} ${month} ${match[1]}`;
}

/** Whether an item has an outcome or details to reveal. */
export const isExpandable = (item: RoadmapItem) =>
  Boolean(item.outcome ?? item.details);

/**
 * The roadmap title prefixed with its family, e.g. "Single Record: Nursing
 * Healthcare", for the page title. Each part falls back to English on its own.
 */
export function titleWithFamily({
  title,
  family,
}: Pick<RoadmapMeta, 'title' | 'family'>): Localised {
  const join = (lang: Lang) => {
    const name = t(title, lang);
    // Like the landing page card, a family needs English to be shown.
    const prefix = family.en ? t(family, lang) : '';
    return prefix ? `${prefix}: ${name}` : name;
  };
  return {
    en: join('en'),
    cy: title.cy || family.cy ? join('cy') : '',
  };
}

/** The id of a horizon's or section's heading, the same in both layouts. */
export function placementHeadingId(id: Placement): string {
  return (HORIZON_IDS as readonly Placement[]).includes(id)
    ? `horizon-${id}`
    : `section-${id}`;
}

/**
 * Whether an item is for the filter's organisation. All-Wales items are for
 * every organisation, so they match too unless `includeNational` is false.
 * Filtering on all of Wales itself matches only all-Wales items.
 */
export function itemMatches(
  item: RoadmapItem,
  { org, includeNational }: OrgFilter,
): boolean {
  if (!org) return true;
  const orgs = item.organisations ?? [];
  return orgs.includes(org) || (includeNational && orgs.includes('national'));
}

/** Whether the filter is for one organisation and takes in all-Wales work. */
export const includesAllWales = ({ org, includeNational }: OrgFilter) =>
  org !== null && org !== 'national' && includeNational;

/** An item with its place in the unfiltered list, which keys it while filtering. */
export interface ShownItem {
  item: RoadmapItem;
  index: number;
}

/** The items that match the filter, in order. */
export const filterItems = (
  items: RoadmapItem[],
  filter: OrgFilter,
): ShownItem[] =>
  items.flatMap((item, index) =>
    itemMatches(item, filter) ? [{ item, index }] : [],
  );

export interface ItemCount {
  shown: number;
  total: number;
}

/** How many of a roadmap's items, in every section and horizon, match. */
export function countItems(roadmap: Roadmap, filter: OrgFilter): ItemCount {
  const items = PLACEMENT_IDS.flatMap((id) => roadmap.items[id]);
  return {
    shown: items.filter((item) => itemMatches(item, filter)).length,
    total: items.length,
  };
}

const countVars = ({ shown, total }: ItemCount) => ({
  shown: String(shown),
  total: String(total),
});

/** "2 of 5". */
export const countOf = (count: ItemCount): Localised =>
  fill(UI.countOf, countVars(count));

/** "2 of 5" while some items are hidden, otherwise just "5". */
export const countText = (count: ItemCount): Localised =>
  count.shown === count.total
    ? { en: String(count.total), cy: String(count.total) }
    : countOf(count);

/** A roadmap heading's count, e.g. "(2)" or "(2 of 5)". */
export const countInParentheses = (count: ItemCount): Localised =>
  fill(UI.countInParentheses, { count: countText(count) });

/** How many of an empty section's `total` items the filter hides. */
export const hiddenCount = ({ org }: OrgFilter, total: number): number =>
  org ? total : 0;

/**
 * What an empty section or horizon says: naming the filter's organisation when
 * the filter hides its items, otherwise that there's nothing yet.
 */
export const emptyText = (filter: OrgFilter, total: number): Localised =>
  filter.org && hiddenCount(filter, total) > 0
    ? fill(UI.nothingFor, { organisation: organisation(filter.org).short })
    : UI.nothingYet;

/** The button that shows the items the filter hides in an empty section. */
export const showHiddenItems = (count: number): Localised =>
  count === 1
    ? UI.showHiddenItemsOne
    : fill(UI.showHiddenItems, { count: String(count) });

/** Organisations that any item is for, in display order. */
export function organisationsWithWork(roadmaps: Roadmap[]): OrganisationId[] {
  const used = new Set(
    roadmaps.flatMap((roadmap) =>
      PLACEMENT_IDS.flatMap((id) =>
        roadmap.items[id].flatMap((item) => item.organisations ?? []),
      ),
    ),
  );
  return ORGANISATIONS.filter((o) => used.has(o.id)).map((o) => o.id);
}

/**
 * A filtered roadmap's summary, e.g. "Showing 5 of 9 items for Cardiff and
 * Vale University Health Board", adding ", including all-Wales work" if
 * `withAllWales` and the filter takes it in. "Showing all 9 items" without a
 * filter.
 */
export function itemsStatus(
  count: ItemCount,
  filter: OrgFilter,
  { withAllWales = true } = {},
): Localised {
  if (!filter.org) {
    return fill(UI.showingAllItems, { total: String(count.total) });
  }
  return fill(
    withAllWales && includesAllWales(filter)
      ? UI.showingItemsForWithNational
      : UI.showingItemsFor,
    { ...countVars(count), organisation: organisation(filter.org).name },
  );
}

export interface PlacementGroup {
  id: Placement;
  heading: Localised;
  /** The items that match the filter. */
  items: ShownItem[];
  /** The number of items before filtering. */
  total: number;
  /** Counted in the list view's "At a glance" summary. */
  glance: boolean;
}

/** Every section and horizon in page order, with the items that match. */
export function roadmapGroups(
  roadmap: Roadmap,
  filter: OrgFilter = NO_ORG_FILTER,
): PlacementGroup[] {
  const group = (id: Placement, heading: Localised, glance: boolean) => ({
    id,
    heading,
    items: filterItems(roadmap.items[id], filter),
    total: roadmap.items[id].length,
    glance,
  });
  const sectionGroups = (placement: 'before' | 'after') =>
    SECTIONS.filter((s) => s.placement === placement).map((s) =>
      group(s.id, s.heading, placement === 'before'),
    );
  return [
    ...sectionGroups('before'),
    ...HORIZONS.map((h) => group(h.id, h.label, true)),
    ...sectionGroups('after'),
  ];
}

/** The landing page card summary: the service description, or the intro. */
export const roadmapSummary = (roadmap: Roadmap): Localised =>
  roadmap.meta.serviceDescription.en
    ? roadmap.meta.serviceDescription
    : ROADMAP_INTRO;

export const categorySectionId = (category: Category) =>
  `category-${category.id}`;

/** "1 roadmap" or "{count} roadmaps", in both languages. */
export const roadmapCount = (count: number): Localised =>
  count === 1
    ? UI.roadmapCountOne
    : fill(UI.roadmapCount, { count: String(count) });

export interface CategoryGroup {
  category: Category;
  roadmaps: Roadmap[];
}

/** A landing page jump link: a named category and its number of matches. */
export interface CategoryTile {
  category: Category<CategoryId>;
  count: number;
}

/**
 * Groups roadmaps by category in display order, leaving out empty categories.
 * Roadmaps with no category come last under "Other roadmaps". Within a group,
 * roadmaps are sorted by title in `lang` (falling back to English), ignoring
 * case and accents, then by slug.
 */
export function groupByCategory(
  roadmaps: Roadmap[],
  lang: Lang,
): CategoryGroup[] {
  const sorted = roadmaps
    .map((roadmap) => ({ roadmap, title: fold(t(roadmap.meta.title, lang)) }))
    .sort(
      (a, b) =>
        compareText(a.title, b.title) ||
        compareText(a.roadmap.slug, b.roadmap.slug),
    )
    .map(({ roadmap }) => roadmap);
  const groups: CategoryGroup[] = CATEGORIES.map((category) => ({
    category,
    roadmaps: sorted.filter((r) => r.meta.category === category.id),
  }));
  groups.push({
    category: OTHER_CATEGORY,
    roadmaps: sorted.filter((r) => !r.meta.category),
  });
  return groups.filter((group) => group.roadmaps.length > 0);
}

/**
 * Whether a roadmap's title, family or description, as shown in `lang`, contains
 * every word of the query, ignoring case and accents. A blank query matches
 * everything.
 */
export function matchesSearch(
  roadmap: Roadmap,
  query: string,
  lang: Lang,
): boolean {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const { title, family, serviceDescription } = roadmap.meta;
  // Not roadmapSummary(): its generic fallback text would match every roadmap
  // without a description. A family needs English to be shown, so to match.
  const fields = family.en
    ? [title, family, serviceDescription]
    : [title, serviceDescription];
  const text = fold(fields.map((v) => t(v, lang)).join(' '));
  return words.every((word) => text.includes(word));
}

/**
 * The roadmaps that match the search query and have work for the filter's
 * organisation.
 */
export const filterRoadmaps = (
  roadmaps: Roadmap[],
  query: string,
  lang: Lang,
  filter: OrgFilter = NO_ORG_FILTER,
): Roadmap[] =>
  roadmaps.filter(
    (roadmap) =>
      matchesSearch(roadmap, query, lang) &&
      (!filter.org || countItems(roadmap, filter).shown > 0),
  );

/** The groups of roadmaps that match the search query and the filter. */
export const filterGroups = (
  roadmaps: Roadmap[],
  query: string,
  lang: Lang,
  filter: OrgFilter = NO_ORG_FILTER,
): CategoryGroup[] =>
  groupByCategory(filterRoadmaps(roadmaps, query, lang, filter), lang);

/**
 * The landing page's result count: the total, or how many match the search
 * and filter, e.g. "Showing 12 of 14 roadmaps for Cardiff and Vale, including
 * all-Wales work".
 */
export function roadmapsStatus(
  shown: number,
  total: number,
  query: string,
  filter: OrgFilter,
): Localised {
  const counts = countVars({ shown, total });
  if (filter.org) {
    return fill(
      includesAllWales(filter)
        ? UI.showingRoadmapsForWithNational
        : UI.showingRoadmapsFor,
      { ...counts, organisation: organisation(filter.org).short },
    );
  }
  return query.trim() ? fill(UI.showingRoadmaps, counts) : roadmapCount(total);
}

/**
 * One tile per named category that has any roadmaps, so the tiles stay put
 * while searching, counting the matches in `shown` (the search results).
 * "Other roadmaps" never has a tile.
 */
export const categoryTiles = (
  roadmaps: Roadmap[],
  shown: CategoryGroup[],
): CategoryTile[] =>
  CATEGORIES.filter((category) =>
    roadmaps.some((r) => r.meta.category === category.id),
  ).map((category) => ({
    category,
    count:
      shown.find((group) => group.category.id === category.id)?.roadmaps
        .length ?? 0,
  }));

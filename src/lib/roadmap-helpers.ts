/**
 * Presentation helpers for the roadmap.
 */
import {
  CATEGORIES,
  HORIZONS,
  OTHER_CATEGORY,
  ROADMAP_INTRO,
  SECTIONS,
  type Category,
} from './content';
import { fill, t, type Lang } from './i18n';
import { UI } from './strings';
import { compareText, fold } from './text';
import {
  HORIZON_IDS,
  type Localised,
  type Placement,
  type Roadmap,
  type RoadmapItem,
  type RoadmapMeta,
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

/** The id of a horizon's or section's heading, the same in both layouts. */
/**
 * The roadmap title prefixed with its family, e.g. "Single Record | Nursing
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
    return prefix ? `${prefix} | ${name}` : name;
  };
  return {
    en: join('en'),
    cy: title.cy || family.cy ? join('cy') : '',
  };
}

export function placementHeadingId(id: Placement): string {
  return (HORIZON_IDS as readonly Placement[]).includes(id)
    ? `horizon-${id}`
    : `section-${id}`;
}

export interface PlacementGroup {
  id: Placement;
  heading: Localised;
  items: RoadmapItem[];
  /** Counted in the list view's "At a glance" summary. */
  glance: boolean;
}

/** Every section and horizon in page order. */
export function roadmapGroups(roadmap: Roadmap): PlacementGroup[] {
  const sectionGroups = (placement: 'before' | 'after') =>
    SECTIONS.filter((s) => s.placement === placement).map((s) => ({
      id: s.id,
      heading: s.heading,
      items: roadmap.items[s.id],
      glance: placement === 'before',
    }));
  return [
    ...sectionGroups('before'),
    ...HORIZONS.map((h) => ({
      id: h.id,
      heading: h.label,
      items: roadmap.items[h.id],
      glance: true,
    })),
    ...sectionGroups('after'),
  ];
}

/** The landing page card summary: the service description, or the intro. */
export const roadmapSummary = (roadmap: Roadmap): Localised =>
  roadmap.meta.serviceDescription.en
    ? roadmap.meta.serviceDescription
    : ROADMAP_INTRO;

/** Id of the landing page's category links, which sections link back to. */
export const CATEGORY_NAV_ID = 'categories';

export const categorySectionId = (category: Category) =>
  `category-${category.id}`;

/** "1 roadmap" or "{count} roadmaps", in both languages. */
export const roadmapCount = (count: number): Localised =>
  count === 1
    ? UI.roadmapCountOne
    : fill(UI.roadmapCount, { count: String(count) });

export interface CategoryGroup {
  category: Category;
  /** True for the "Other roadmaps" group, which has no jump-link tile. */
  isOther: boolean;
  roadmaps: Roadmap[];
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
    isOther: false,
    roadmaps: sorted.filter((r) => r.meta.category === category.id),
  }));
  groups.push({
    category: OTHER_CATEGORY,
    isOther: true,
    roadmaps: sorted.filter((r) => !r.meta.category),
  });
  return groups.filter((group) => group.roadmaps.length > 0);
}

/**
 * Whether a roadmap's title, family or summary, as shown in `lang`, contains
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
  const { title, family } = roadmap.meta;
  const text = fold(
    [title, family, roadmapSummary(roadmap)].map((v) => t(v, lang)).join(' '),
  );
  return words.every((word) => text.includes(word));
}

/** The groups of roadmaps that match the search query. */
export const filterGroups = (
  roadmaps: Roadmap[],
  query: string,
  lang: Lang,
): CategoryGroup[] =>
  groupByCategory(
    roadmaps.filter((roadmap) => matchesSearch(roadmap, query, lang)),
    lang,
  );

/**
 * Presentation helpers for the roadmap.
 */
import { HORIZONS, SECTIONS } from './content';
import {
  HORIZON_IDS,
  type Localised,
  type Placement,
  type Roadmap,
  type RoadmapItem,
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

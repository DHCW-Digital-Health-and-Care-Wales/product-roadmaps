/**
 * Roadmap content model. Content comes from a Google Sheet snapshot made at
 * build time in .data/roadmaps.json (see scripts/sync-roadmaps.ts); text shared by
 * every roadmap lives in src/lib/content.ts. Display text is language-keyed so
 * Welsh can be added later; empty Welsh falls back to English (src/lib/i18n.ts).
 */

// The single source of truth for where a card can appear. The sheet parser,
// the snapshot schema and the page content are all built from these lists.
export const HORIZON_IDS = ['now', 'next', 'later'] as const;

/** The fixed sections shown around the horizons (see src/lib/content.ts). */
export const SECTION_IDS = [
  'recently-delivered',
  'delivered-this-year',
  'not-doing',
] as const;

export const PLACEMENT_IDS = [...HORIZON_IDS, ...SECTION_IDS] as const;

export type Horizon = (typeof HORIZON_IDS)[number];

export type SectionId = (typeof SECTION_IDS)[number];

/** Where a card appears: one of the horizons or one of the sections. */
export type Placement = (typeof PLACEMENT_IDS)[number];

export interface Localised {
  cy: string;
  en: string;
}

/** `level` > 0 nests the line under the previous shallower line. */
export interface DetailLine {
  text: Localised;
  level: number;
}

export interface RoadmapItem {
  title: Localised;
  description: Localised;
  outcome?: Localised;
  phase?: string;
  labels?: string[];
  details?: DetailLine[];
}

export interface RoadmapMeta {
  title: Localised;
  statusLabel: Localised;
  lastUpdated: string;
  /** Hex highlight colour for this roadmap. */
  colour: string;
  vision: Localised;
  serviceDescription: Localised;
}

export interface Roadmap {
  slug: string;
  sheetName: string;
  meta: RoadmapMeta;
  items: Record<Placement, RoadmapItem[]>;
}

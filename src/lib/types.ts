/**
 * Roadmap content model. Content comes from the nightly Google Sheet snapshot
 * in src/data/roadmaps.json (see scripts/sync-roadmaps.ts); text shared by
 * every roadmap lives in src/lib/content.ts. Display text is language-keyed so
 * Welsh can be added later; empty Welsh falls back to English (src/lib/i18n.ts).
 */

export type Horizon = 'now' | 'next' | 'later';

/** The fixed sections shown around the horizons (see src/lib/content.ts). */
export type SectionId =
  | 'recently-delivered'
  | 'delivered-this-year'
  | 'not-doing';

/** Where a card appears: one of the horizons or one of the sections. */
export type Placement = Horizon | SectionId;

/** Known statuses get a translated label; anything else is shown as typed. */
export type ItemStatus = string;

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
  status?: ItemStatus;
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

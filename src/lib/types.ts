/**
 * Roadmap content model. Content comes from a Google Sheet snapshot made at
 * build time in .data/roadmaps.json (see scripts/sync-roadmaps.ts); text shared by
 * every roadmap lives in src/lib/content.ts. Display text is language-keyed;
 * Welsh comes from optional "(cy)" sheet columns and empty Welsh falls back to
 * English (src/lib/i18n.ts).
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

/**
 * Landing page categories, in display order. Each id is the kebab-case of the
 * English name the sheet's "Category" dropdown uses (CATEGORY_SHEET_VALUES).
 * Display names and descriptions are in src/lib/content.ts.
 */
export const CATEGORY_IDS = [
  'public-health-apps',
  'gp-community-services',
  'tests-scans-results',
  'urgent-emergency-care',
  'hospital-specialist-care',
  'national-systems-data',
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

/** The allowed values of the sheet's "Category" column. */
export const CATEGORY_SHEET_VALUES: Record<CategoryId, string> = {
  'public-health-apps': 'Public Health & Apps',
  'gp-community-services': 'GP & Community Services',
  'tests-scans-results': 'Tests, Scans & Results',
  'urgent-emergency-care': 'Urgent & Emergency Care',
  'hospital-specialist-care': 'Hospital & Specialist Care',
  'national-systems-data': 'National Systems & Data',
};

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
  phase?: Localised;
  labels?: Localised[];
  details?: DetailLine[];
}

export interface RoadmapMeta {
  title: Localised;
  /** Landing page group; '' puts the roadmap under "Other roadmaps". */
  category: CategoryId | '';
  /**
   * Optional programme or family name, shown above the landing page card title
   * and as "Family | Title" on the roadmap page.
   */
  family: Localised;
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

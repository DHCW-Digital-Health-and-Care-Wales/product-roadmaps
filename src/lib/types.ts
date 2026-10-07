/**
 * Roadmap content model. Content is loaded at runtime from the Google Sheet
 * (see src/lib/sheet.ts); every piece of display text is language-keyed so
 * Welsh and English are both supported, falling back to English when Welsh is
 * empty (see src/lib/i18n.ts).
 */

export type Horizon = 'now' | 'next' | 'later';

/** Known statuses get a translated label; anything else is shown as typed. */
export type ItemStatus = string;

export interface Localised {
  cy: string;
  en: string;
}

export interface Category {
  id: string;
  /** Short label shown above the headline. */
  label: string;
  headline: Localised;
  description: Localised;
  accent: string;
}

export interface Capabilities {
  label: Localised;
  /** `level` > 0 nests the line under the previous shallower line. */
  items: { text: Localised; level: number }[];
}

export interface RoadmapItem {
  id: string;
  title: Localised;
  summary: Localised;
  outcome?: Localised;
  categoryId: string;
  horizon?: Horizon;
  status?: ItemStatus;
  phase?: string;
  metric?: string;
  capabilities?: Capabilities;
  services?: string[];
}

/** A delivered/out-of-scope section shown before or after the horizons. */
export interface DeliveredSectionData {
  id: string;
  placement: 'before' | 'after';
  heading: Localised;
  description: Localised;
  items: RoadmapItem[];
}

export interface RoadmapMeta {
  title: Localised;
  vision: Localised;
  serviceDescription: Localised;
  intro: Localised;
  horizonNote: Localised;
  lastUpdated: string;
  statusLabel: Localised;
}

export interface Roadmap {
  slug: string;
  sheetName: string;
  meta: RoadmapMeta;
  horizons: { id: Horizon; label: Localised; definition: Localised }[];
  categories: Category[];
  items: RoadmapItem[];
  sections: DeliveredSectionData[];
}

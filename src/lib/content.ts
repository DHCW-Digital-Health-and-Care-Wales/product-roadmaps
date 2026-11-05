/**
 * Text shared by every roadmap, and the landing page categories. Product
 * managers only fill in what differs per product in the Google Sheet;
 * everything here is the same on every page.
 */
import {
  Ambulance,
  Database,
  FlaskConical,
  Hospital,
  House,
  LayoutGrid,
  ShieldPlus,
  type LucideIcon,
} from 'lucide-react';
import {
  CATEGORY_IDS,
  CATEGORY_SHEET_VALUES,
  HORIZON_IDS,
  SECTION_IDS,
  type CategoryId,
  type Horizon,
  type Localised,
  type SectionId,
} from './types';

export const ROADMAP_INTRO: Localised = {
  en: "This roadmap shows what we're working on now, what's coming next and the direction we expect to take later.",
  cy: '',
};

export const HORIZON_NOTE: Localised = {
  en: "Now is what we are actively working on. Next is what we expect to pick up soon. Later is the direction we're setting as we learn more with users and partners. We don't put dates on this work, and the order isn't a priority list.",
  cy: '',
};

export const ROADMAP_HEADING: Localised = {
  en: 'The roadmap',
  cy: 'Y trywydd',
};

export const ROADMAP_DESCRIPTION: Localised = {
  en: "Each card shows a change we're working on now, planning to take on next, or working towards later.",
  cy: '',
};

export const DETAILS_HEADING: Localised = {
  en: 'What this covers',
  cy: '',
};

const HORIZON_TEXT: Record<
  Horizon,
  { label: Localised; definition: Localised }
> = {
  now: {
    label: { en: 'Now', cy: 'Nawr' },
    definition: {
      en: 'Work that is underway now and shaping the next changes to the service.',
      cy: '',
    },
  },
  next: {
    label: { en: 'Next', cy: 'Nesaf' },
    definition: {
      en: 'Work we expect to pick up soon as current delivery moves forward.',
      cy: '',
    },
  },
  later: {
    label: { en: 'Later', cy: 'Hwyrach' },
    definition: {
      en: 'Longer-term direction that will keep evolving as we learn more.',
      cy: '',
    },
  },
};

export const HORIZONS = HORIZON_IDS.map((id) => ({ id, ...HORIZON_TEXT[id] }));

const SECTION_TEXT: Record<
  SectionId,
  {
    placement: 'before' | 'after';
    heading: Localised;
    description: Localised;
  }
> = {
  'recently-delivered': {
    placement: 'before',
    heading: { en: 'Recently delivered', cy: '' },
    description: {
      en: "Work we've completed recently and that is now live in the service.",
      cy: '',
    },
  },
  'delivered-this-year': {
    placement: 'after',
    heading: { en: 'Other work we have delivered this year', cy: '' },
    description: {
      en: 'A broader view of the delivery this year that sits outside the main roadmap horizons.',
      cy: '',
    },
  },
  'not-doing': {
    placement: 'after',
    heading: { en: 'Not doing right now', cy: '' },
    description: {
      en: 'Being clear about what we’re not doing keeps the focus where it matters.',
      cy: '',
    },
  },
};

export const SECTIONS = SECTION_IDS.map((id) => ({ id, ...SECTION_TEXT[id] }));

/** Id of the "Other roadmaps" group, for roadmaps with no Category. */
export type CategoryKey = CategoryId | 'other';

/** A landing page group of roadmaps. */
export interface Category<Id extends CategoryKey = CategoryKey> {
  id: Id;
  label: Localised;
  description: Localised;
  /** Icon background, at least 3:1 contrast against white. */
  colour: string;
  icon: LucideIcon;
}

// The English label is the sheet's Category value (CATEGORY_SHEET_VALUES).
const CATEGORY_DETAILS: Record<
  CategoryId,
  Omit<Category, 'id' | 'label'> & { cy: string }
> = {
  'public-health-apps': {
    cy: 'Iechyd y Cyhoedd ac Apiau',
    description: {
      en: 'Vaccination, screening and digital services for the public',
      cy: 'Brechu, sgrinio a gwasanaethau digidol i’r cyhoedd',
    },
    colour: '#0b7a5a',
    icon: ShieldPlus,
  },
  'gp-community-services': {
    cy: 'Meddygon Teulu a Gwasanaethau Cymunedol',
    description: {
      en: 'GP practices, community pharmacies and care closer to home',
      cy: 'Meddygfeydd, fferyllfeydd cymunedol a gofal yn nes at adref',
    },
    colour: '#325083',
    icon: House,
  },
  'tests-scans-results': {
    cy: 'Profion, Sganiau a Chanlyniadau',
    description: {
      en: 'Requesting tests, laboratory systems and reporting results',
      cy: 'Gwneud cais am brofion, systemau labordy ac adrodd ar ganlyniadau',
    },
    colour: '#0e7189',
    icon: FlaskConical,
  },
  'urgent-emergency-care': {
    cy: 'Gofal Brys ac Argyfwng',
    description: {
      en: 'Emergency departments and unscheduled care',
      cy: 'Adrannau achosion brys a gofal heb ei drefnu',
    },
    colour: '#b3261e',
    icon: Ambulance,
  },
  'hospital-specialist-care': {
    cy: 'Gofal Ysbyty ac Arbenigol',
    description: {
      en: 'Hospital records, nursing, pharmacy and specialist services',
      cy: 'Cofnodion ysbyty, nyrsio, fferylliaeth a gwasanaethau arbenigol',
    },
    colour: '#6b3fa0',
    icon: Hospital,
  },
  'national-systems-data': {
    cy: 'Systemau a Data Cenedlaethol',
    description: {
      en: 'Shared records, national data and connecting systems',
      cy: 'Cofnodion a rennir, data cenedlaethol a systemau cysylltu',
    },
    colour: '#7a4a00',
    icon: Database,
  },
};

/** Landing page categories in display order. */
export const CATEGORIES: Category<CategoryId>[] = CATEGORY_IDS.map((id) => {
  const { cy, ...details } = CATEGORY_DETAILS[id];
  return { id, label: { en: CATEGORY_SHEET_VALUES[id], cy }, ...details };
});

/** The last landing page group, for roadmaps with no Category. */
export const OTHER_CATEGORY: Category<'other'> = {
  id: 'other',
  label: { en: 'Other roadmaps', cy: 'Trywyddion eraill' },
  description: {
    en: 'Roadmaps not yet in a category',
    cy: 'Trywyddion nad ydynt mewn categori eto',
  },
  colour: '#5a6675',
  icon: LayoutGrid,
};

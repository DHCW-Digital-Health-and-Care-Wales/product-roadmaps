/**
 * Text shared by every roadmap. Product managers only fill in what differs per
 * product in the Google Sheet; everything here is the same on every page.
 */
import type { Horizon, Localised, SectionId } from './types';

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

export const HORIZONS: {
  id: Horizon;
  label: Localised;
  definition: Localised;
}[] = [
  {
    id: 'now',
    label: { en: 'Now', cy: 'Nawr' },
    definition: {
      en: 'Work that is underway now and shaping the next changes to the service.',
      cy: '',
    },
  },
  {
    id: 'next',
    label: { en: 'Next', cy: 'Nesaf' },
    definition: {
      en: 'Work we expect to pick up soon as current delivery moves forward.',
      cy: '',
    },
  },
  {
    id: 'later',
    label: { en: 'Later', cy: 'Hwyrach' },
    definition: {
      en: 'Longer-term direction that will keep evolving as we learn more.',
      cy: '',
    },
  },
];

export const SECTIONS: {
  id: SectionId;
  placement: 'before' | 'after';
  heading: Localised;
  description: Localised;
}[] = [
  {
    id: 'recently-delivered',
    placement: 'before',
    heading: { en: 'Recently delivered', cy: '' },
    description: {
      en: "Work we've completed recently and that is now live in the service.",
      cy: '',
    },
  },
  {
    id: 'delivered-this-year',
    placement: 'after',
    heading: { en: 'Other work we have delivered this year', cy: '' },
    description: {
      en: 'A broader view of the delivery this year that sits outside the main roadmap horizons.',
      cy: '',
    },
  },
  {
    id: 'not-doing',
    placement: 'after',
    heading: { en: 'Not doing right now', cy: '' },
    description: {
      en: 'Being clear about what we’re not doing keeps the focus where it matters.',
      cy: '',
    },
  },
];

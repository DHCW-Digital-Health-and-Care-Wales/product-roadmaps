import { describe, expect, it } from 'vitest';
import {
  CATEGORIES,
  DETAILS_HEADING,
  HORIZON_NOTE,
  HORIZONS,
  ORGANISATION_GROUPS,
  ORGANISATIONS,
  OTHER_CATEGORY,
  ROADMAP_DESCRIPTION,
  ROADMAP_HEADING,
  ROADMAP_INTRO,
  SECTIONS,
} from './content';
import { fill, resolve } from './i18n';
import { UI } from './strings';
import type { Localised } from './types';

const SHARED_TEXT: [string, Localised][] = [
  ['ROADMAP_INTRO', ROADMAP_INTRO],
  ['HORIZON_NOTE', HORIZON_NOTE],
  ['ROADMAP_HEADING', ROADMAP_HEADING],
  ['ROADMAP_DESCRIPTION', ROADMAP_DESCRIPTION],
  ['DETAILS_HEADING', DETAILS_HEADING],
  ...HORIZONS.flatMap(({ id, label, definition }): [string, Localised][] => [
    [`horizon ${id} label`, label],
    [`horizon ${id} definition`, definition],
  ]),
  ...SECTIONS.flatMap(({ id, heading, description }): [string, Localised][] => [
    [`section ${id} heading`, heading],
    [`section ${id} description`, description],
  ]),
  ...[...CATEGORIES, OTHER_CATEGORY].flatMap(
    ({ id, label, description }): [string, Localised][] => [
      [`category ${id} label`, label],
      [`category ${id} description`, description],
    ],
  ),
  ...Object.entries(ORGANISATION_GROUPS).map(
    ([id, value]): [string, Localised] => [`organisation group ${id}`, value],
  ),
  ...ORGANISATIONS.flatMap(({ id, name, short }): [string, Localised][] => [
    [`organisation ${id} name`, name],
    [`organisation ${id} short name`, short],
  ]),
];

describe.each([
  ['UI strings', Object.entries(UI)],
  ['Shared roadmap text', SHARED_TEXT],
])('%s', (_, entries) => {
  it.each(entries)('%s has English and Welsh', (_, value) => {
    expect(value.en.trim()).not.toBe('');
    expect(value.cy.trim()).not.toBe('');
  });
});

describe('resolve', () => {
  it('reports when it falls back to English', () => {
    expect(resolve({ en: 'Hello', cy: '' }, 'cy')).toEqual({
      text: 'Hello',
      lang: 'en',
    });
    expect(resolve({ en: 'Hello', cy: 'Helo' }, 'cy')).toEqual({
      text: 'Helo',
      lang: 'cy',
    });
  });
});

describe('fill', () => {
  it('replaces placeholders in both languages', () => {
    expect(
      fill({ en: 'Hi {name}', cy: 'Helo {name}' }, { name: 'Ann' }),
    ).toEqual({ en: 'Hi Ann', cy: 'Helo Ann' });
  });

  it('fills each language from a localised value, falling back to English', () => {
    const value = { en: 'For {org}', cy: 'Ar gyfer {org}' };
    expect(fill(value, { org: { en: 'Powys', cy: 'Powys (cy)' } })).toEqual({
      en: 'For Powys',
      cy: 'Ar gyfer Powys (cy)',
    });
    expect(fill(value, { org: { en: 'HEIW', cy: '' } }).cy).toBe(
      'Ar gyfer HEIW',
    );
  });
});

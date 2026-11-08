import { describe, expect, it } from 'vitest';
import { fill, resolve } from './i18n';
import { UI } from './strings';

describe('UI strings', () => {
  it.each(Object.entries(UI))('%s has English and Welsh', (_, value) => {
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

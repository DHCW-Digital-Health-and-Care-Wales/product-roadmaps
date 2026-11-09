import { describe, expect, it } from 'vitest';
import { NO_ORG_FILTER } from './types';
import {
  dataPathFor,
  orgFilterFromSearch,
  pathFor,
  routeFromPath,
  viewFromSearch,
  withOrgFilter,
} from './router';

describe('routeFromPath', () => {
  it.each([
    ['/product-roadmaps/', null, null],
    ['/product-roadmaps/index.html', null, null],
    ['/product-roadmaps', null, null],
    ['/elsewhere/en/producta/', null, null],
    ['/product-roadmaps/en/', 'en', null],
    ['/product-roadmaps/cy', 'cy', null],
    ['/product-roadmaps/cy/index.html', 'cy', null],
    ['/product-roadmaps/en/producta/', 'en', 'producta'],
    ['/product-roadmaps/cy/producta', 'cy', 'producta'],
    ['/product-roadmaps/en/producta/index.html', 'en', 'producta'],
    ['/product-roadmaps/en/cy/', 'en', 'cy'],
    ['/product-roadmaps/en/%E0/', 'en', '%E0'],
    ['/product-roadmaps/producta/', null, 'producta'],
  ])('%s gives %s and %s', (path, lang, slug) => {
    expect(routeFromPath(path)).toEqual({ lang, slug });
  });
});

describe('viewFromSearch', () => {
  it.each([
    ['', 'cards'],
    ['?view=cards', 'cards'],
    ['?view=LIST', 'cards'],
    ['?view=list', 'list'],
    ['?x=1&view=list', 'list'],
  ])('%s gives %s', (search, view) => {
    expect(viewFromSearch(search)).toBe(view);
  });
});

describe('pathFor', () => {
  it('puts every page under its language', () => {
    expect(pathFor('en', null)).toBe('/product-roadmaps/en/');
    expect(pathFor('cy', 'producta')).toBe('/product-roadmaps/cy/producta/');
  });

  it('publishes data once for both languages', () => {
    expect(dataPathFor('producta')).toBe(
      '/product-roadmaps/producta/roadmap.json',
    );
  });
});

describe('orgFilterFromSearch', () => {
  it.each([
    ['', NO_ORG_FILTER],
    ['?org=cavuhb', { org: 'cavuhb', includeNational: true }],
    ['?view=list&org=cavuhb&all=no', { org: 'cavuhb', includeNational: false }],
    ['?org=cavuhb&all=yes', { org: 'cavuhb', includeNational: true }],
    ['?org=national&all=no', { org: 'national', includeNational: true }],
    ['?org=CAVUHB', NO_ORG_FILTER],
    ['?org=nowhere&all=no', NO_ORG_FILTER],
    ['?all=no', NO_ORG_FILTER],
  ])('%s gives %o', (search, filter) => {
    expect(orgFilterFromSearch(search)).toEqual(filter);
  });
});

describe('withOrgFilter', () => {
  const page = '/product-roadmaps/en/producta/';

  it('adds the filter, keeping other params and the hash', () => {
    expect(
      withOrgFilter(`${page}?view=list#roadmap`, {
        org: 'cavuhb',
        includeNational: false,
      }),
    ).toBe(`${page}?view=list&org=cavuhb&all=no#roadmap`);
    expect(
      withOrgFilter(page, { org: 'national', includeNational: false }),
    ).toBe(`${page}?org=national`);
  });

  it('replaces or removes a filter already there', () => {
    expect(
      withOrgFilter(`${page}?org=cavuhb&all=no`, {
        org: 'sbuhb',
        includeNational: true,
      }),
    ).toBe(`${page}?org=sbuhb`);
    expect(withOrgFilter(`${page}?org=cavuhb&all=no`, NO_ORG_FILTER)).toBe(
      page,
    );
  });

  it('round-trips through orgFilterFromSearch', () => {
    const filter = { org: 'wast', includeNational: false } as const;
    const href = withOrgFilter(page, filter);
    expect(orgFilterFromSearch(href.slice(href.indexOf('?')))).toEqual(filter);
  });
});

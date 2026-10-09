import { describe, expect, it } from 'vitest';
import { dataPathFor, pathFor, routeFromPath } from './router';

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

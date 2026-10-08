// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { pathFor, productHref, slugFromPath } from './router';

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('slugFromPath', () => {
  it.each([
    ['/product-roadmaps/', null],
    ['/product-roadmaps/index.html', null],
    ['/product-roadmaps', null],
    ['/elsewhere/producta/', null],
    ['/product-roadmaps/producta/', 'producta'],
    ['/product-roadmaps/producta', 'producta'],
    ['/product-roadmaps/producta/index.html', 'producta'],
    ['/product-roadmaps/%E0/', '%E0'],
  ])('%s gives %s', (path, slug) => {
    expect(slugFromPath(path)).toBe(slug);
  });
});

describe('productHref', () => {
  it('links to the product path', () => {
    expect(pathFor(null)).toBe('/product-roadmaps/');
    expect(productHref('producta')).toBe('/product-roadmaps/producta/');
  });

  it('keeps only the language parameter', () => {
    window.history.replaceState(null, '', '/product-roadmaps/?lang=cy&x=1');
    expect(productHref('producta')).toBe('/product-roadmaps/producta/?lang=cy');
  });
});

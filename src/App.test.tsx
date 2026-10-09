// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { LanguageProvider } from './components/LanguageProvider';
import snapshot from '../e2e/fixtures/roadmaps.json';

const [first] = snapshot;

const renderAt = (url: string) => {
  window.history.replaceState(null, '', url);
  return render(
    <LanguageProvider>
      <App />
    </LanguageProvider>,
  );
};

// jsdom can't compute colours, so contrast is left to manual and browser checks.
async function axeViolations() {
  const results = await axe.run(document, {
    rules: { 'color-contrast': { enabled: false } },
  });
  return results.violations.map((v) => `${v.id}: ${v.help}`);
}

beforeEach(() => {
  window.localStorage.clear();
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('App routing', () => {
  it('shows the landing page without a product', () => {
    renderAt('/product-roadmaps/');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Product roadmaps' }),
    ).toBeTruthy();
    expect(document.title).toBe('DHCW roadmaps');
  });

  it('shows a product roadmap', () => {
    renderAt(`/product-roadmaps/${first.slug}/`);
    expect(
      screen.getByRole('heading', { level: 1, name: first.meta.title.en }),
    ).toBeTruthy();
    expect(document.title).toBe(`${first.meta.title.en} – DHCW roadmaps`);
  });

  it('links to a roadmap’s JSON only on its own page', () => {
    renderAt(`/product-roadmaps/${first.slug}/`);
    const link = screen.getByRole('link', { name: 'Roadmap data (JSON)' });
    expect(link.getAttribute('href')).toBe(
      `/product-roadmaps/${first.slug}/roadmap.json`,
    );
    cleanup();
    renderAt('/product-roadmaps/');
    expect(
      screen.queryByRole('link', { name: 'Roadmap data (JSON)' }),
    ).toBeNull();
  });

  it('shows not found for an unknown product', () => {
    renderAt('/product-roadmaps/nope/');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Roadmap not found' }),
    ).toBeTruthy();
    expect(screen.getByText(/called “nope”/)).toBeTruthy();
    expect(document.title).toBe('Roadmap not found – DHCW roadmaps');
  });

  it('moves focus to the new heading after client-side navigation', () => {
    renderAt('/product-roadmaps/');
    fireEvent.click(screen.getByRole('link', { name: first.meta.title.en }));

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toBe(first.meta.title.en);
    expect(document.activeElement).toBe(heading);
    expect(document.title).toContain(first.meta.title.en);
  });

  it('does not steal focus on the first render', () => {
    renderAt(`/product-roadmaps/${first.slug}/`);
    expect(document.activeElement).toBe(document.body);
  });
});

describe('Welsh', () => {
  it('translates interface text and accessible names', () => {
    renderAt(`/product-roadmaps/${first.slug}/?lang=cy`);
    expect(document.documentElement.lang).toBe('cy');
    expect(screen.getByRole('link', { name: /Pob trywydd/ })).toBeTruthy();
    expect(
      screen.getByRole('navigation', { name: 'Dolenni troedyn' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', {
        name: 'Hafan trywyddion Iechyd a Gofal Digidol Cymru',
      }),
    ).toBeTruthy();
  });

  it('marks English fallbacks with lang="en"', () => {
    renderAt(`/product-roadmaps/${first.slug}/?lang=cy`);
    const title = screen.getByRole('heading', { level: 1 });
    expect(title.querySelector('[lang="en"]')?.textContent).toBe(
      first.meta.title.en,
    );
    const roadmapHeading = screen.getByRole('heading', { name: 'Y trywydd' });
    expect(roadmapHeading.querySelector('[lang]')).toBeNull();
  });

  it('shows Welsh sheet content where there is some', () => {
    renderAt('/product-roadmaps/?lang=cy');
    const welshTitle = screen.getByRole('link', { name: /Trywydd Cynnyrch B/ });
    expect(welshTitle.querySelector('[lang]')).toBeNull();
    cleanup();

    renderAt(`/product-roadmaps/${first.slug}/?lang=cy`);
    expect(screen.getByText('Darganfod').closest('[lang="en"]')).toBeNull();
    expect(
      screen.getByRole('heading', { name: 'Cerdyn darganfod' }),
    ).toBeTruthy();
    expect(screen.getByText('Minimal card').getAttribute('lang')).toBe('en');
  });
});

describe('accessibility (axe)', () => {
  const pages = {
    landing: '/product-roadmaps/',
    product: `/product-roadmaps/${first.slug}/`,
    'not found': '/product-roadmaps/nope/',
  };

  for (const lang of ['en', 'cy']) {
    for (const [name, url] of Object.entries(pages)) {
      it(`has no violations on the ${name} page in ${lang}`, async () => {
        renderAt(`${url}${url.includes('?') ? '&' : '?'}lang=${lang}`);
        expect(await axeViolations()).toEqual([]);
      });
    }
  }
});

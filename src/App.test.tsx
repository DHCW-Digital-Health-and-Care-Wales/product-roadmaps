// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
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
  it('shows the English landing page at the site root', () => {
    renderAt('/product-roadmaps/');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Product roadmaps' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Cymraeg' }).getAttribute('href'),
    ).toBe('/product-roadmaps/cy/');
  });

  it('shows the landing page without a product', () => {
    renderAt('/product-roadmaps/en/');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Product roadmaps' }),
    ).toBeTruthy();
    expect(document.title).toBe('DHCW roadmaps');
  });

  it('shows a product roadmap', () => {
    renderAt(`/product-roadmaps/en/${first.slug}/`);
    expect(
      screen.getByRole('heading', { level: 1, name: first.meta.title.en }),
    ).toBeTruthy();
    expect(document.title).toBe(`${first.meta.title.en} – DHCW roadmaps`);
  });

  it('links to a roadmap’s JSON only on its own page', () => {
    renderAt(`/product-roadmaps/cy/${first.slug}/`);
    const link = screen.getByRole('link', { name: 'Data’r trywydd (JSON)' });
    expect(link.getAttribute('href')).toBe(
      `/product-roadmaps/${first.slug}/roadmap.json`,
    );
    cleanup();
    renderAt('/product-roadmaps/en/');
    expect(
      screen.queryByRole('link', { name: 'Roadmap data (JSON)' }),
    ).toBeNull();
  });

  it('shows not found for an unknown product', () => {
    renderAt('/product-roadmaps/en/nope/');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Roadmap not found' }),
    ).toBeTruthy();
    expect(screen.getByText(/called “nope”/)).toBeTruthy();
    expect(document.title).toBe('Roadmap not found – DHCW roadmaps');
  });

  it('moves focus to the new heading after client-side navigation', () => {
    renderAt('/product-roadmaps/cy/');
    fireEvent.click(screen.getByRole('link', { name: first.meta.title.en }));

    expect(window.location.pathname).toBe(
      `/product-roadmaps/cy/${first.slug}/`,
    );
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toBe(first.meta.title.en);
    expect(document.activeElement).toBe(heading);
    expect(document.title).toContain(first.meta.title.en);
  });

  it('does not steal focus on the first render', () => {
    renderAt(`/product-roadmaps/en/${first.slug}/`);
    expect(document.activeElement).toBe(document.body);
  });
});

describe('Welsh', () => {
  it('translates interface text and accessible names', () => {
    renderAt(`/product-roadmaps/cy/${first.slug}/`);
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
    renderAt(`/product-roadmaps/cy/${first.slug}/`);
    const title = screen.getByRole('heading', { level: 1 });
    expect(title.querySelector('[lang="en"]')?.textContent).toBe(
      first.meta.title.en,
    );
    const roadmapHeading = screen.getByRole('heading', { name: 'Y trywydd' });
    expect(roadmapHeading.querySelector('[lang]')).toBeNull();
  });

  it('shows Welsh sheet content where there is some', () => {
    renderAt('/product-roadmaps/cy/');
    const welshTitle = screen.getByRole('link', { name: /Trywydd Cynnyrch B/ });
    expect(welshTitle.querySelector('[lang]')).toBeNull();
    cleanup();

    renderAt(`/product-roadmaps/cy/${first.slug}/`);
    expect(screen.getByText('Darganfod').closest('[lang="en"]')).toBeNull();
    expect(
      screen.getByRole('heading', { name: 'Cerdyn darganfod' }),
    ).toBeTruthy();
    expect(screen.getByText('Minimal card').getAttribute('lang')).toBe('en');
  });
});

describe('list view', () => {
  it('explains the horizons as a list, after the note', () => {
    renderAt(`/product-roadmaps/en/${first.slug}/?view=list`);
    const section = screen
      .getByRole('heading', { name: 'Now, Next and Later' })
      .closest('section');
    const note = screen.getByText(/^Now is what we are actively working on/);
    const list = section?.querySelector('dl') ?? null;
    expect(list?.querySelectorAll('dt')).toHaveLength(3);
    expect(
      list &&
        note.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(section?.querySelector('.rounded-card')).toBeNull();
  });
  it('links each horizon in the explainer to its section', () => {
    for (const view of ['', '?view=list']) {
      renderAt(`/product-roadmaps/en/${first.slug}/${view}`);
      for (const [name, id] of [
        ['Now', 'horizon-now'],
        ['Next', 'horizon-next'],
        ['Later', 'horizon-later'],
      ]) {
        const section = screen
          .getByRole('heading', { name: 'Now, Next and Later' })
          .closest('section');
        const link = section?.querySelector(`a[href="#${id}"]`);
        expect(link?.textContent).toBe(name);
        expect(document.getElementById(id)).toBeTruthy();
      }
      cleanup();
    }
  });
  it('follows the URL on back and forward', () => {
    renderAt(`/product-roadmaps/en/${first.slug}/`);
    act(() => {
      window.history.pushState({}, '', '?view=list');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(
      screen.getByRole('navigation', { name: 'At a glance' }),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Card view' })).toBeTruthy();
  });

  it('shows cards unless the URL asks for the list', () => {
    renderAt(`/product-roadmaps/en/${first.slug}/`);
    expect(screen.getByRole('heading', { name: 'The roadmap' })).toBeTruthy();
    expect(
      screen.queryByRole('navigation', { name: 'At a glance' }),
    ).toBeNull();
  });

  it('shows the list with ?view=list', () => {
    renderAt(`/product-roadmaps/en/${first.slug}/?view=list`);
    expect(screen.queryByRole('heading', { name: 'The roadmap' })).toBeNull();
    expect(
      screen.getByRole('navigation', { name: 'At a glance' }),
    ).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: 'Now' })).toBeTruthy();
  });

  it('keeps the list when switching language', () => {
    renderAt(`/product-roadmaps/en/${first.slug}/?view=list`);
    fireEvent.click(screen.getByRole('link', { name: 'Cymraeg' }));
    expect(window.location.search).toBe('?view=list');
    expect(screen.getByRole('navigation', { name: 'Cipolwg' })).toBeTruthy();
  });

  it('switches layout from the footer link', () => {
    renderAt(`/product-roadmaps/en/${first.slug}/`);
    fireEvent.click(screen.getByRole('link', { name: 'List view' }));
    expect(window.location.search).toBe('?view=list');
    expect(
      screen.getByRole('navigation', { name: 'At a glance' }),
    ).toBeTruthy();

    fireEvent.click(screen.getByRole('link', { name: 'Card view' }));
    expect(window.location.search).toBe('');
    expect(screen.getByRole('heading', { name: 'The roadmap' })).toBeTruthy();
  });

  it('has no layout link off roadmap pages', () => {
    renderAt('/product-roadmaps/en/');
    expect(screen.queryByRole('link', { name: 'List view' })).toBeNull();
  });

  it('opens and closes every row', () => {
    renderAt(`/product-roadmaps/en/${first.slug}/?view=list`);
    const rows = [
      ...document.querySelectorAll('#roadmap button[aria-expanded]'),
    ];
    expect(rows.length).toBeGreaterThan(1);

    fireEvent.click(screen.getByRole('button', { name: 'Open all' }));
    for (const row of rows) {
      expect(row.getAttribute('aria-expanded')).toBe('true');
    }
    fireEvent.click(screen.getByRole('button', { name: 'Close all' }));
    for (const row of rows) {
      expect(row.getAttribute('aria-expanded')).toBe('false');
    }
  });
});

describe('accessibility (axe)', () => {
  const pages = {
    landing: '',
    product: `${first.slug}/`,
    'product list': `${first.slug}/?view=list`,
    'not found': 'nope/',
  };

  for (const lang of ['en', 'cy']) {
    for (const [name, path] of Object.entries(pages)) {
      it(`has no violations on the ${name} page in ${lang}`, async () => {
        renderAt(`/product-roadmaps/${lang}/${path}`);
        expect(await axeViolations()).toEqual([]);
      });
    }
  }
});

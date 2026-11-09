// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import axe from 'axe-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { LanguageProvider } from './components/LanguageProvider';
import { titleWithFamily } from './lib/roadmap-helpers';
import type { Roadmap } from './lib/types';
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

  it('shows a product roadmap, titled with its family', () => {
    const fullTitle = `${first.meta.family.en} | ${first.meta.title.en}`;
    expect(first.meta.family.en).not.toBe('');
    renderAt(`/product-roadmaps/en/${first.slug}/`);
    expect(
      screen.getByRole('heading', { level: 1, name: fullTitle }),
    ).toBeTruthy();
    expect(document.title).toBe(`${fullTitle} – DHCW roadmaps`);
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
    expect(heading.textContent).toBe(
      `${first.meta.family.en} | ${first.meta.title.en}`,
    );
    expect(document.activeElement).toBe(heading);
    expect(document.title).toContain(first.meta.title.en);
  });

  it('does not steal focus on the first render', () => {
    renderAt(`/product-roadmaps/en/${first.slug}/`);
    expect(document.activeElement).toBe(document.body);
  });
});

describe('Roadmap page title', () => {
  // The h1 renders the family and title separately (to mark English fallbacks),
  // so check it never drifts from the shared "Family | Title" text.
  it.each(
    (snapshot as Roadmap[]).flatMap((roadmap) =>
      (['en', 'cy'] as const).map(
        (lang) => [roadmap.slug, lang, roadmap] as const,
      ),
    ),
  )('the %s heading in %s matches the page title', (slug, lang, roadmap) => {
    renderAt(`/product-roadmaps/${lang}/${slug}/`);
    const expected =
      titleWithFamily(roadmap.meta)[lang] || titleWithFamily(roadmap.meta).en;
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      expected,
    );
    expect(document.title.startsWith(`${expected} – `)).toBe(true);
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
    expect(
      [...title.querySelectorAll('[lang="en"]')].map((el) => el.textContent),
    ).toEqual([first.meta.family.en, first.meta.title.en]);
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

describe('organisation filter', () => {
  const productPage = `/product-roadmaps/en/${first.slug}/`;
  const header = () => within(screen.getByRole('banner'));
  const status = () => screen.getByText(/^Showing \d+ of \d+ roadmaps/);
  const cardTitles = () =>
    screen
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);

  it('filters the landing page from the dropdown and tick box', () => {
    renderAt('/product-roadmaps/en/');
    fireEvent.click(screen.getByText('Filter by organisation'));
    fireEvent.change(screen.getByLabelText('Organisation'), {
      target: { value: 'cavuhb' },
    });
    expect(window.location.search).toBe('?org=cavuhb');
    expect(status().textContent).toBe(
      'Showing 2 of 2 roadmaps for Cardiff and Vale, including all-Wales work',
    );
    expect(screen.getByText('5 of 9')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('Include all-Wales work'));
    expect(window.location.search).toBe('?org=cavuhb&all=no');
    expect(status().textContent).toBe(
      'Showing 1 of 2 roadmaps for Cardiff and Vale',
    );
    expect(cardTitles()).toHaveLength(1);

    fireEvent.click(
      within(screen.getByRole('main')).getByRole('button', {
        name: 'Clear filter',
      }),
    );
    expect(window.location.search).toBe('');
    expect(document.activeElement).toBe(screen.getByLabelText('Organisation'));
    expect(screen.getByRole('status').textContent).toBe('2 roadmaps');
  });

  it('opens the filter and keeps it in links when the URL has one', () => {
    renderAt('/product-roadmaps/en/?org=cavuhb&all=no');
    expect(document.querySelector('details')?.open).toBe(true);
    expect(
      screen
        .getByRole('link', { name: first.meta.title.en })
        .getAttribute('href'),
    ).toBe(`${productPage}?org=cavuhb&all=no`);
    expect(
      screen.getByRole('link', { name: 'Cymraeg' }).getAttribute('href'),
    ).toBe('/product-roadmaps/cy/?org=cavuhb&all=no');
  });

  it('leaves the filter out of the header on a missing page', () => {
    renderAt('/product-roadmaps/en/nope/?org=cavuhb');
    expect(header().queryByRole('button', { name: 'Clear filter' })).toBeNull();
  });

  it('shows how many items match on a roadmap, and clears from the banner', () => {
    renderAt(`${productPage}?org=cavuhb&all=no`);
    expect(screen.getByRole('link', { name: '← All roadmaps' })).toHaveProperty(
      'href',
      `${window.location.origin}/product-roadmaps/en/?org=cavuhb&all=no`,
    );
    expect(
      screen.getByText(
        'Showing 2 of 9 items for Cardiff and Vale University Health Board',
      ),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', { level: 3, name: /^Now/ }).textContent,
    ).toContain('1 of 3');

    fireEvent.click(screen.getByRole('button', { name: 'Show all items' }));
    expect(window.location.search).toBe('');
    expect(document.activeElement?.id).toBe('roadmap-title');
    expect(screen.queryByRole('button', { name: 'Show all items' })).toBeNull();
  });

  it('toggles the filter from a pill, keeping focus on it and announcing it', () => {
    renderAt(productPage);
    const announcer = screen
      .getAllByRole('status')
      .find((region) => region.classList.contains('sr-only'));
    expect(announcer?.textContent).toBe('');

    const [pill] = screen.getAllByRole('button', {
      name: 'Filter by Swansea Bay',
    });
    expect(pill.getAttribute('aria-pressed')).toBe('false');
    fireEvent.click(pill);
    expect(window.location.search).toBe('?org=sbuhb');
    expect(pill.getAttribute('aria-pressed')).toBe('true');
    expect(document.activeElement).toBe(pill);
    expect(announcer?.textContent).toBe(
      'Showing 5 of 9 items for Swansea Bay University Health Board, including all-Wales work',
    );
    expect(
      screen
        .getAllByRole('button', { name: 'Filter by All Wales' })
        .every((button) => button.getAttribute('aria-pressed') === 'false'),
    ).toBe(true);

    fireEvent.click(pill);
    expect(window.location.search).toBe('');
    expect(pill.getAttribute('aria-pressed')).toBe('false');
    expect(announcer?.textContent).toBe('Showing all 9 items');
  });

  it('shows the filter in the header, opening or clearing it', () => {
    // jsdom has no scrollIntoView.
    Element.prototype.scrollIntoView = vi.fn();
    renderAt(`${productPage}?org=cavuhb`);
    fireEvent.click(
      header().getByRole('button', {
        name: 'Filtered by organisation: Cardiff and Vale',
      }),
    );
    expect(document.querySelector('details')?.open).toBe(true);
    expect(document.activeElement).toBe(screen.getByLabelText('Organisation'));
    expect(header().getByText('Filtered by: Cardiff and Vale')).toBeTruthy();

    const [clear] = header().getAllByRole('button', { name: 'Clear filter' });
    fireEvent.click(clear);
    expect(window.location.search).toBe('');
    expect(header().queryByRole('button', { name: 'Clear filter' })).toBeNull();
    // Focus moves into the first card on screen.
    expect(document.activeElement?.closest('[data-filter-card]')).toBeTruthy();
  });

  it.each(['', '&view=list'])(
    'shows the items the filter hides from an empty section%s',
    (view) => {
      renderAt(`${productPage}?org=cavuhb${view}`);
      const next = within(screen.getByRole('region', { name: /^Next/ }));
      expect(next.getByText('Nothing for Cardiff and Vale here.')).toBeTruthy();

      fireEvent.click(next.getByRole('button', { name: 'Show 1 hidden item' }));
      expect(window.location.search).toBe(view.replace('&', '?'));
      // Focus moves to the item that takes the button's place.
      expect(document.activeElement).toBe(
        next.getByRole('heading', { name: 'Card being explored' }),
      );
    },
  );

  it('offers nothing to show in a section with no items', () => {
    renderAt(`/product-roadmaps/en/${snapshot[1].slug}/?org=cavuhb`);
    const delivered = within(
      screen.getByRole('region', { name: /^Recently delivered/ }),
    );
    expect(delivered.getByText('Nothing to show here yet.')).toBeTruthy();
    expect(delivered.queryByRole('button')).toBeNull();
  });

  it('follows the URL on back and forward', () => {
    renderAt(productPage);
    act(() => {
      window.history.pushState({}, '', '?org=bcuhb&all=no');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    // In the banner, and announced.
    expect(
      screen.getAllByText(
        'Showing 1 of 9 items for Betsi Cadwaladr University Health Board',
      ),
    ).toHaveLength(2);
  });

  it('filters the list view, keeping the filter when changing layout', () => {
    renderAt(`${productPage}?view=list&org=cavuhb&all=no`);
    const glance = screen.getByRole('navigation', { name: 'At a glance' });
    expect(within(glance).getByRole('link', { name: /Now/ }).textContent).toBe(
      '1 of 3Now',
    );
    expect(
      screen.getByRole('heading', { level: 2, name: /^Now ?1 of 3$/ }),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Card view' }).getAttribute('href'),
    ).toBe(`${productPage}?org=cavuhb&all=no`);
  });
});

describe('accessibility (axe)', () => {
  const pages = {
    landing: '',
    'filtered landing': '?org=cavuhb',
    product: `${first.slug}/`,
    'filtered product': `${first.slug}/?org=cavuhb&all=no`,
    'product list': `${first.slug}/?view=list`,
    'filtered product list': `${first.slug}/?view=list&org=sbuhb`,
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

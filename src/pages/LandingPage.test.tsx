// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../components/LanguageProvider';
import { ANNOUNCE_DELAY_MS } from '../components/SearchBar';
import {
  type CategoryId,
  type Roadmap,
  NO_ORG_FILTER,
  type OrgFilter,
} from '../lib/types';
import { LandingPage } from './LandingPage';
import fixture from '../../e2e/fixtures/roadmaps.json';

const [base, withoutCardiff] = fixture as Roadmap[];
const loc = (en: string, cy = '') => ({ en, cy });

const roadmap = (
  slug: string,
  category: CategoryId | '',
  title: string,
  family = '',
  welshTitle = '',
): Roadmap => ({
  ...base,
  slug,
  meta: {
    ...base.meta,
    title: loc(title, welshTitle),
    category,
    family: loc(family),
    serviceDescription: loc(`About ${title}`),
  },
});

const welshSummary = (r: Roadmap): Roadmap => ({
  ...r,
  meta: {
    ...r.meta,
    serviceDescription: { ...r.meta.serviceDescription, cy: 'Am y trywydd' },
  },
});

const categorised = [
  roadmap('vaccines', 'public-health-apps', 'Vaccines'),
  roadmap('patients', 'hospital-specialist-care', 'Patients', 'Single Record'),
  roadmap('core', 'hospital-specialist-care', 'Core Experience'),
  roadmap('pharmacy', 'gp-community-services', 'Choose Pharmacy'),
];
const uncategorised = roadmap('misc', '', 'Miscellany');

const renderLanding = (
  roadmaps: Roadmap[],
  lang = 'en',
  filter = NO_ORG_FILTER,
) => {
  window.history.replaceState(null, '', `/product-roadmaps/${lang}/`);
  return render(
    <LanguageProvider>
      <LandingPage roadmaps={roadmaps} filter={filter} />
    </LanguageProvider>,
  );
};

const tiles = () => {
  const nav = screen.queryByRole('navigation', { name: 'Browse by category' });
  return nav
    ? within(nav)
        .queryAllByRole('link')
        .map((link) => link.getAttribute('href'))
    : [];
};

const sectionHeadings = () =>
  screen
    .queryAllByRole('heading', { level: 2 })
    .filter((h) => !h.closest('nav'))
    .map((h) => h.textContent);

const cardTitles = (section: string) =>
  within(screen.getByRole('region', { name: section }))
    .getAllByRole('heading', { level: 3 })
    .map((h) => h.textContent);

const search = (value: string) =>
  fireEvent.change(screen.getByRole('searchbox'), {
    target: { value },
  });

// Lets the result count be announced, as after a pause in typing.
const pause = () =>
  act(() => {
    vi.advanceTimersByTime(ANNOUNCE_DELAY_MS);
  });

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
  window.history.replaceState(null, '', '/');
});

describe('LandingPage', () => {
  it('links to each non-empty category in order, with counts', () => {
    renderLanding(categorised);
    expect(tiles()).toEqual([
      '#category-public-health-apps',
      '#category-gp-community-services',
      '#category-hospital-specialist-care',
    ]);
    const hospital = screen.getByRole('link', {
      name: /Hospital & Specialist Care/,
    });
    expect(hospital.textContent).toContain('2 roadmaps');
    expect(
      screen.getByRole('link', { name: /Public Health & Apps/ }).textContent,
    ).toContain('1 roadmap');
  });

  it('shows one section per non-empty category, cards sorted by title', () => {
    renderLanding(categorised);
    expect(sectionHeadings()).toEqual([
      'Public Health & Apps',
      'GP & Community Services',
      'Hospital & Specialist Care',
    ]);
    expect(cardTitles('Hospital & Specialist Care')).toEqual([
      'Core Experience',
      'Patients',
    ]);
    expect(
      screen.getByRole('region', { name: 'Hospital & Specialist Care' }).id,
    ).toBe('category-hospital-specialist-care');
  });

  it('has no Other section when every roadmap has a category', () => {
    renderLanding(categorised);
    expect(
      screen.queryByRole('heading', { name: 'Other roadmaps' }),
    ).toBeNull();
    expect(document.getElementById('category-other')).toBeNull();
  });

  it('lists uncategorised roadmaps last, under Other, with no tile', () => {
    renderLanding([uncategorised, ...categorised]);
    expect(sectionHeadings().slice(-1)[0]).toBe('Other roadmaps');
    expect(cardTitles('Other roadmaps')).toEqual(['Miscellany']);
    expect(tiles()).not.toContain('#category-other');
    expect(tiles()).toHaveLength(3);
  });

  it('never has an Other tile, even when nothing has a category', () => {
    renderLanding([uncategorised]);
    expect(sectionHeadings()).toEqual(['Other roadmaps']);
    expect(tiles()).toEqual([]);
    expect(
      screen.queryByRole('navigation', { name: 'Browse by category' }),
    ).toBeNull();
  });

  it('shows the family above the title', () => {
    renderLanding(categorised);
    const heading = screen.getByRole('heading', { level: 3, name: 'Patients' });
    expect(heading.previousElementSibling?.textContent).toBe('Single Record');
    const core = screen.getByRole('heading', {
      level: 3,
      name: 'Core Experience',
    });
    const coreCard = core.closest('li');
    expect(coreCard?.textContent).toContain('About Core Experience');
    expect(coreCard?.textContent).not.toContain('Single Record');
  });

  it('filters cards and sections, announcing the count', () => {
    renderLanding([uncategorised, ...categorised]);
    const status = screen.getByRole('status');
    expect(status.textContent).toBe('5 roadmaps');

    search('  record ');
    expect(sectionHeadings()).toEqual(['Hospital & Specialist Care']);
    expect(cardTitles('Hospital & Specialist Care')).toEqual(['Patients']);
    pause();
    expect(status.textContent).toBe('Showing 1 of 5 roadmaps');

    search('about MISC');
    expect(sectionHeadings()).toEqual(['Other roadmaps']);

    search('');
    expect(sectionHeadings()).toHaveLength(4);
    pause();
    expect(status.textContent).toBe('5 roadmaps');
  });

  it('keeps every category tile while searching, updating the counts', () => {
    renderLanding([uncategorised, ...categorised]);
    const nav = screen.getByRole('navigation', { name: 'Browse by category' });
    const tile = (name: string) =>
      within(nav)
        .getAllByRole('listitem')
        .find((item) => item.textContent?.includes(name))!;
    const names = [
      'Public Health & Apps',
      'GP & Community Services',
      'Hospital & Specialist Care',
    ];
    expect(within(nav).getAllByRole('listitem')).toHaveLength(3);

    search('record');
    expect(within(nav).getAllByRole('listitem')).toHaveLength(3);
    expect(tile('Hospital & Specialist Care').textContent).toContain(
      '1 roadmap',
    );
    expect(
      within(tile('Hospital & Specialist Care'))
        .getByRole('link')
        .getAttribute('href'),
    ).toBe('#category-hospital-specialist-care');
    // A category with no matches has no section, so its tile is plain text.
    for (const name of ['Public Health & Apps', 'GP & Community Services']) {
      expect(tile(name).textContent).toContain('0 roadmaps');
      expect(within(tile(name)).queryByRole('link')).toBeNull();
    }

    search('about MISC');
    expect(within(nav).getAllByRole('listitem')).toHaveLength(3);
    expect(tiles()).toEqual([]);

    search('');
    for (const name of names) {
      expect(within(tile(name)).getByRole('link')).toBeTruthy();
    }
  });

  it('describes the search with hint text', () => {
    renderLanding(categorised);
    const box = screen.getByRole('searchbox', { name: 'Find a product' });
    const hint = document.getElementById(box.getAttribute('aria-describedby')!);
    expect(hint?.textContent).toBe(
      'Search by name, product family or description',
    );
  });

  it('does not match the generic intro shown on cards with no description', () => {
    const bare: Roadmap = {
      ...uncategorised,
      meta: { ...uncategorised.meta, serviceDescription: loc('') },
    };
    renderLanding([bare, ...categorised]);
    // The card shows the intro, which mentions "direction".
    expect(
      screen.getByRole('link', { name: 'Miscellany' }).closest('li')
        ?.textContent,
    ).toContain('direction');
    search('direction');
    expect(screen.getByText(/No roadmaps match your search/)).toBeTruthy();
  });

  it('says when nothing matches', () => {
    renderLanding(categorised);
    expect(screen.queryByText(/No roadmaps match/)).toBeNull();
    search('dentistry');
    expect(screen.getByText(/No roadmaps match your search/)).toBeTruthy();
    expect(sectionHeadings()).toEqual([]);
    pause();
    expect(screen.getByRole('status').textContent).toBe(
      'Showing 0 of 4 roadmaps',
    );
  });

  it('is in Welsh', () => {
    renderLanding([uncategorised, ...categorised], 'cy');
    expect(
      screen.getByRole('navigation', { name: 'Pori yn ôl categori' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('searchbox', { name: 'Dod o hyd i gynnyrch' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Trywyddion eraill' }),
    ).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('5 trywydd');
  });

  it('announces the count only once typing pauses', () => {
    renderLanding(categorised);
    const status = screen.getByRole('status');
    search('v');
    expect(sectionHeadings()).toEqual(['Public Health & Apps']);
    expect(status.textContent).toBe('4 roadmaps');
    act(() => {
      vi.advanceTimersByTime(ANNOUNCE_DELAY_MS - 100);
    });
    search('va');
    act(() => {
      vi.advanceTimersByTime(ANNOUNCE_DELAY_MS - 100);
    });
    expect(status.textContent).toBe('4 roadmaps');
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(status.textContent).toBe('Showing 1 of 4 roadmaps');
  });

  it('searches and sorts by the Welsh text', () => {
    renderLanding(
      [
        welshSummary(
          roadmap(
            'vaccines',
            'public-health-apps',
            'Vaccines',
            '',
            'Brechlynnau',
          ),
        ),
        roadmap('apps', 'public-health-apps', 'Apps', '', 'Ystafell apiau'),
        roadmap('screening', 'public-health-apps', 'Screening'),
      ],
      'cy',
    );
    expect(cardTitles('Iechyd y Cyhoedd ac Apiau')).toEqual([
      'Brechlynnau',
      'Screening',
      'Ystafell apiau',
    ]);
    search('brechlyn');
    expect(cardTitles('Iechyd y Cyhoedd ac Apiau')).toEqual(['Brechlynnau']);
    search('vaccines');
    expect(sectionHeadings()).toEqual([]);
    // No Welsh title, so the English one shown is searched.
    search('screen');
    expect(cardTitles('Iechyd y Cyhoedd ac Apiau')).toEqual(['Screening']);
    pause();
    expect(screen.getByRole('status').textContent).toBe(
      'Yn dangos 1 o 3 trywydd',
    );
  });

  it('says when there are no roadmaps', () => {
    renderLanding([]);
    expect(
      screen.getByText('No roadmaps have been published yet.'),
    ).toBeTruthy();
    expect(screen.queryByRole('search')).toBeNull();
  });

  describe('filtered by organisation', () => {
    // The fixture's first roadmap has 2 of its 9 items for Cardiff and Vale
    // alone; its second has none.
    const cardiffOnly: OrgFilter = { org: 'cavuhb', includeNational: false };
    const roadmaps = [
      ...categorised,
      {
        ...roadmap('dental', 'public-health-apps', 'Dental'),
        items: withoutCardiff.items,
      },
    ];

    it('hides roadmaps without matching items, recounting the tiles', () => {
      renderLanding(roadmaps, 'en', cardiffOnly);
      expect(screen.queryByRole('link', { name: 'Dental' })).toBeNull();
      expect(
        screen.getByRole('link', { name: /Public Health & Apps/ }).textContent,
      ).toContain('1 roadmap');
      expect(screen.getByRole('status').textContent).toBe(
        'Showing 4 of 5 roadmaps for Cardiff and Vale',
      );
    });

    it('counts only the matching items on each card', () => {
      renderLanding([categorised[0]], 'en', cardiffOnly);
      const card = screen
        .getByRole('link', { name: categorised[0].meta.title.en })
        .closest('li')!;
      expect(card.textContent).toContain('2 of 9 items for Cardiff and Vale');
      const now = within(card).getByText('Now').closest('div');
      expect(now?.textContent).toBe('Now1');
    });

    it('offers to show every organisation when nothing matches', () => {
      renderLanding([withoutCardiff], 'en', cardiffOnly);
      expect(
        screen.getByText('No roadmaps have work for Cardiff and Vale yet.'),
      ).toBeTruthy();
      expect(
        screen.getByRole('button', { name: 'Show all organisations' }),
      ).toBeTruthy();

      cleanup();
      renderLanding(roadmaps, 'en', cardiffOnly);
      search('dentistry');
      expect(
        screen.getByText(
          'No roadmaps match your search for Cardiff and Vale. Try a different word.',
        ),
      ).toBeTruthy();
    });
  });
});

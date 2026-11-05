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
import type { CategoryId, Roadmap } from '../lib/types';
import { LandingPage } from './LandingPage';
import fixture from '../../e2e/fixtures/roadmaps.json';

const [base] = fixture as Roadmap[];
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

const renderLanding = (roadmaps: Roadmap[], lang = 'en') => {
  window.history.replaceState(null, '', `/product-roadmaps/${lang}/`);
  return render(
    <LanguageProvider>
      <LandingPage roadmaps={roadmaps} />
    </LanguageProvider>,
  );
};

const tiles = () => {
  const nav = screen.queryByRole('navigation', { name: 'Browse by category' });
  return nav
    ? within(nav)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href'))
    : [];
};

const sectionHeadings = () =>
  screen
    .queryAllByRole('heading', { level: 2 })
    .map((h) => h.textContent)
    .filter((text) => text !== 'Browse by category');

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

  it('filters cards, tiles and sections, announcing the count', () => {
    renderLanding([uncategorised, ...categorised]);
    const status = screen.getByRole('status');
    expect(status.textContent).toBe('5 roadmaps');

    search('  record ');
    expect(sectionHeadings()).toEqual(['Hospital & Specialist Care']);
    expect(cardTitles('Hospital & Specialist Care')).toEqual(['Patients']);
    expect(tiles()).toEqual(['#category-hospital-specialist-care']);
    expect(
      screen.getByRole('link', { name: /Hospital & Specialist Care/ })
        .textContent,
    ).toContain('1 roadmap');
    pause();
    expect(status.textContent).toBe('Showing 1 of 5 roadmaps');

    search('about MISC');
    expect(sectionHeadings()).toEqual(['Other roadmaps']);
    expect(tiles()).toEqual([]);

    search('');
    expect(sectionHeadings()).toHaveLength(4);
    pause();
    expect(status.textContent).toBe('5 roadmaps');
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
});

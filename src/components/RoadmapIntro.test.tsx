// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { ROADMAP_INTRO } from '../lib/content';
import { NO_ORG_FILTER, type Roadmap, type RoadmapMeta } from '../lib/types';
import { LanguageProvider } from './LanguageProvider';
import { RoadmapIntro } from './RoadmapIntro';
import fixture from '../../e2e/fixtures/roadmaps.json';

const [base] = fixture as Roadmap[];
const loc = (en: string, cy = '') => ({ en, cy });

const renderIntro = (
  meta: Partial<RoadmapMeta>,
  url = '/product-roadmaps/en/x/',
) => {
  window.history.replaceState(null, '', url);
  return render(
    <LanguageProvider>
      <RoadmapIntro
        meta={{ ...base.meta, ...meta }}
        filter={NO_ORG_FILTER}
        controls={<button type="button">Filter</button>}
      >
        <p>Banner</p>
      </RoadmapIntro>
    </LanguageProvider>,
  );
};

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/');
});

describe('RoadmapIntro', () => {
  it('keeps the family inside the h1', () => {
    renderIntro({ family: loc('Single Record'), title: loc('Nursing') });
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
      'Single Record: Nursing',
    );
  });

  it('shows the status, date and product lead on one line', () => {
    renderIntro({
      statusLabel: loc('Beta'),
      lastUpdated: '2026-10-01',
      productLead: 'Alex Jones',
    });
    const line = screen.getByText('Beta').parentElement!;
    expect(line.textContent).toBe(
      'BetaLast updated: 1 October 2026·Product lead: Alex Jones',
    );
    const hidden = [...line.querySelectorAll('[aria-hidden="true"]')];
    expect(hidden.map((el) => el.textContent)).toEqual(['·']);
  });

  it('shows the same product lead name in Welsh, with a Welsh label', () => {
    renderIntro({ productLead: 'Alex Jones' }, '/product-roadmaps/cy/x/');
    expect(screen.getByText(/Arweinydd cynnyrch: Alex Jones/)).toBeTruthy();
  });

  it('hides the product lead and its separator when blank', () => {
    const { container } = renderIntro({
      statusLabel: loc('Beta'),
      lastUpdated: '2026-10-01',
      productLead: '',
    });
    expect(screen.queryByText(/Product lead/)).toBeNull();
    expect(container.textContent).not.toContain('·');
  });

  it('leaves out the metadata line when nothing is set', () => {
    const { container } = renderIntro({
      statusLabel: loc(''),
      lastUpdated: '',
      productLead: '',
    });
    expect(container.querySelector('time')).toBeNull();
    expect(container.textContent).not.toContain('Last updated');
  });

  it('shows the vision under an "Our vision" heading', () => {
    renderIntro({ vision: loc('Where we are heading') });
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).toBe('Our vision');
    expect(heading.parentElement?.id).toBe('vision');
    expect(screen.getByText('Where we are heading')).toBeTruthy();
    expect(screen.queryByText(ROADMAP_INTRO.en)).toBeNull();
  });

  it('falls back to the generic intro, with no heading, when there is no vision', () => {
    renderIntro({ vision: loc('') });
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull();
    expect(screen.getByText(ROADMAP_INTRO.en)).toBeTruthy();
  });

  it('keeps the back link, controls, title, vision and children in that order', () => {
    renderIntro({ vision: loc('Where we are heading') });
    const inOrder = [
      screen.getByRole('link', { name: /All roadmaps/ }),
      screen.getByRole('button', { name: 'Filter' }),
      screen.getByRole('heading', { level: 1 }),
      screen.getByText('Where we are heading'),
      screen.getByText('Banner'),
    ];
    inOrder.slice(1).forEach((element, index) => {
      expect(
        inOrder[index].compareDocumentPosition(element) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });
});

// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { RoadmapItem } from '../lib/types';
import { LanguageProvider } from './LanguageProvider';
import { RoadmapCard } from './RoadmapCard';

const loc = (en: string) => ({ en, cy: '' });

const renderCard = (item: RoadmapItem) =>
  render(
    <LanguageProvider>
      <RoadmapCard item={item} />
    </LanguageProvider>,
  );

afterEach(() => {
  cleanup();
  window.history.replaceState(null, '', '/');
});

describe('RoadmapCard', () => {
  it('shows only the title when optional fields are missing', () => {
    const { container } = renderCard({
      title: loc('Bare card'),
      description: loc(''),
    });
    expect(screen.getByRole('heading', { level: 4 }).textContent).toBe(
      'Bare card',
    );
    expect(container.querySelectorAll('p')).toHaveLength(0);
    expect(container.querySelector('details')).toBeNull();
  });

  it('shows the description, outcome, phase and labels', () => {
    renderCard({
      title: loc('Full card'),
      description: loc('What it is'),
      outcome: loc('Why it matters'),
      phase: loc('Discovery'),
      labels: [loc('Web'), loc('App')],
    });
    expect(screen.getByText('What it is')).toBeTruthy();
    expect(screen.getByText('Outcome:')).toBeTruthy();
    expect(screen.getByText('Why it matters')).toBeTruthy();
    expect(screen.getByText('Discovery')).toBeTruthy();
    expect(screen.getByText('Web')).toBeTruthy();
    expect(screen.getByText('App')).toBeTruthy();
  });

  it('shows Welsh phase and labels, marking English fallbacks', () => {
    window.history.replaceState(null, '', '/product-roadmaps/cy/');
    renderCard({
      title: loc('Untranslated'),
      description: loc(''),
      phase: { en: 'Discovery', cy: 'Darganfod' },
      labels: [{ en: 'Web', cy: 'Gwe' }, loc('App')],
    });
    expect(screen.getByText('Darganfod')).toBeTruthy();
    expect(screen.getByText('Gwe').getAttribute('lang')).toBeNull();
    expect(screen.getByText('App').getAttribute('lang')).toBe('en');
    expect(screen.getByText('Untranslated').getAttribute('lang')).toBe('en');
  });

  it('nests detail lines under the line above', () => {
    const { container } = renderCard({
      title: loc('Details'),
      description: loc(''),
      details: [
        { text: loc('Parent'), level: 0 },
        { text: loc('Child'), level: 1 },
        { text: loc('Sibling'), level: 0 },
      ],
    });
    const top = container.querySelector('details > ul');
    expect(top?.children).toHaveLength(2);
    expect(top?.querySelector('li > ul > li')?.textContent).toBe('Child');
  });
});

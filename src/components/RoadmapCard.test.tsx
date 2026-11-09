// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
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

  it('shows the phase eyebrow, description and outcome box', () => {
    const { container } = renderCard({
      title: loc('Full card'),
      description: loc('What it is'),
      outcome: loc('Why it matters'),
      phase: loc('Discovery'),
    });
    const heading = screen.getByRole('heading', { level: 4 });
    const eyebrow = screen.getByText('Discovery');
    expect(eyebrow.tagName).toBe('P');
    expect(eyebrow.querySelector('svg')?.getAttribute('aria-hidden')).toBe(
      'true',
    );
    expect(
      eyebrow.compareDocumentPosition(heading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText('What it is')).toBeTruthy();
    const label = screen.getByText('Outcome');
    expect(screen.queryByText('Outcome:')).toBeNull();
    expect(label.parentElement?.textContent).toBe('OutcomeWhy it matters');
    expect(container.querySelectorAll('ul')).toHaveLength(0);
  });

  it('renders bullet lines in the description and outcome as lists', () => {
    const { container } = renderCard({
      title: loc('Bullets'),
      description: loc(
        'This will:\n- add search,\n- add filters, and\n- go live',
      ),
      outcome: loc('Staff can:\n• find results'),
    });
    const lists = container.querySelectorAll('ul');
    expect(lists).toHaveLength(2);
    expect(
      within(lists[0] as HTMLElement)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual(['add search', 'add filters', 'go live']);
    expect(lists[1].textContent).toBe('find results');
    expect(screen.getByText('This will:').tagName).toBe('P');
  });

  it('keeps line breaks from the sheet as separate paragraphs', () => {
    renderCard({
      title: loc('Story'),
      description: loc('AS A nurse\nI WANT a list\nSO THAT I can plan'),
    });
    expect(screen.getByText('AS A nurse').tagName).toBe('P');
    expect(screen.getByText('I WANT a list').tagName).toBe('P');
    expect(screen.getByText('SO THAT I can plan').tagName).toBe('P');
  });

  it('reads the labels as "Tags:" then a comma-separated list', () => {
    renderCard({
      title: loc('Labels'),
      description: loc(''),
      labels: [loc('Web'), loc('App'), loc('Data')],
    });
    const line = screen.getByText('Tags:').closest('p');
    const spoken = line?.cloneNode(true) as HTMLElement;
    spoken.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
    expect(spoken.textContent.replace(/\s+/g, ' ').trim()).toBe(
      'Tags: Web, App, Data',
    );
    const dots = Array.from(
      line?.querySelectorAll('[aria-hidden="true"]') ?? [],
    ).filter((n) => n.textContent === '•');
    expect(dots).toHaveLength(2);
  });

  it('names each details summary after the card title', () => {
    const { container } = renderCard({
      title: loc('Search tool'),
      description: loc(''),
      details: [{ text: loc('One'), level: 0 }],
    });
    expect(container.querySelector('summary')?.textContent).toBe(
      'What this covers: Search tool',
    );
  });

  it('puts the details, then labels, then organisations in the footer', () => {
    const { container } = renderCard({
      title: loc('Footer'),
      description: loc('Text'),
      outcome: loc('Result'),
      details: [{ text: loc('One'), level: 0 }],
      labels: [loc('Web')],
      organisations: ['national'],
    });
    const footer = container.querySelector('details')?.parentElement;
    const children = Array.from(footer?.children ?? []);
    expect(children).toHaveLength(3);
    expect(children[0].tagName).toBe('DETAILS');
    expect(children[1].textContent).toContain('Web');
    expect(children[2].textContent).toContain('All Wales');
  });

  it('shows Welsh text, marking English fallbacks', () => {
    window.history.replaceState(null, '', '/product-roadmaps/cy/');
    renderCard({
      title: loc('Untranslated'),
      description: loc('English only'),
      outcome: { en: 'Result', cy: 'Canlyniad da' },
      phase: { en: 'Discovery', cy: 'Darganfod' },
      labels: [{ en: 'Web', cy: 'Gwe' }, loc('App')],
    });
    expect(screen.getByText('Darganfod')).toBeTruthy();
    expect(screen.getByText('Gwe').getAttribute('lang')).toBeNull();
    expect(screen.getByText('App').getAttribute('lang')).toBe('en');
    expect(screen.getByText('Untranslated').getAttribute('lang')).toBe('en');
    expect(
      screen.getByText('English only').closest('[lang]')?.getAttribute('lang'),
    ).toBe('en');
    expect(screen.getByText('Canlyniad da').closest('[lang="en"]')).toBeNull();
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

  it('shows the organisations as toggle buttons, marking the filtered one', () => {
    window.history.replaceState(null, '', '/product-roadmaps/en/x/?org=cavuhb');
    renderCard({
      title: loc('Card'),
      description: loc(''),
      organisations: ['national', 'cavuhb', 'sbuhb'],
    });
    const card = within(screen.getByRole('article'));
    const pressed = (name: string) =>
      card.getByRole('button', { name }).getAttribute('aria-pressed');
    expect(pressed('Filter by All Wales')).toBe('false');
    expect(pressed('Filter by Cardiff and Vale')).toBe('true');
    expect(pressed('Filter by Swansea Bay')).toBe('false');
  });
});

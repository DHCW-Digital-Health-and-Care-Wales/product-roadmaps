// @vitest-environment jsdom
import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { RoadmapItem } from '../lib/types';
import { LanguageProvider } from './LanguageProvider';
import { RoadmapListItem } from './RoadmapListItem';

const loc = (en: string) => ({ en, cy: '' });

function Harness({ item }: { item: RoadmapItem }) {
  const [open, setOpen] = useState(false);
  return (
    <ul>
      <RoadmapListItem
        item={item}
        open={open}
        onToggle={() => setOpen((current) => !current)}
      />
    </ul>
  );
}

const renderItem = (item: RoadmapItem) =>
  render(
    <LanguageProvider>
      <Harness item={item} />
    </LanguageProvider>,
  );

afterEach(cleanup);

describe('RoadmapListItem', () => {
  it('is a plain heading when there is nothing more to show', () => {
    renderItem({
      title: loc('Bare item'),
      description: loc('What it is'),
      phase: loc('Alpha'),
    });
    expect(
      screen.getByRole('heading', { level: 3, name: 'Bare item' }),
    ).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('What it is')).toBeTruthy();
  });

  it('opens and closes its panel', () => {
    renderItem({
      title: loc('Full item'),
      description: loc(''),
      outcome: loc('Why it matters'),
    });
    const button = screen.getByRole('button', { name: 'Full item' });
    const panel = document.getElementById(
      button.getAttribute('aria-controls') ?? '',
    );
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(panel?.hidden).toBe(true);

    fireEvent.click(button);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(panel?.hidden).toBe(false);

    fireEvent.click(button);
    expect(panel?.hidden).toBe(true);
  });

  it('shows the outcome on one line and details under their heading', () => {
    renderItem({
      title: loc('Full item'),
      description: loc(''),
      outcome: loc('Why it matters'),
      details: [
        { text: loc('Parent'), level: 0 },
        { text: loc('Child'), level: 1 },
      ],
    });
    expect(screen.getByText('Outcome:').parentElement?.textContent).toBe(
      'Outcome: Why it matters',
    );
    const heading = screen.getByText('What this covers');
    const list = screen.getByText('Parent').closest('ul');
    expect(heading.nextElementSibling).toBe(list);
    expect(
      screen.getByText('Child').closest('ul')?.parentElement?.closest('ul'),
    ).toBe(list);
  });

  it('puts the panel between the description and the labels', () => {
    renderItem({
      title: loc('Full item'),
      description: loc('What it is'),
      outcome: loc('Why it matters'),
      labels: [loc('Web')],
    });
    const panel = screen.getByText('Why it matters').parentElement;
    const follows = (a: Node | null, b: Node | null) =>
      Boolean(
        a &&
        b &&
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING,
      );
    expect(follows(screen.getByText('What it is'), panel)).toBe(true);
    expect(follows(panel, screen.getByText('Web'))).toBe(true);
  });
});

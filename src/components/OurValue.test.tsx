// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { Roadmap } from '../lib/types';
import { LanguageProvider } from './LanguageProvider';
import { OurValue } from './OurValue';
import fixture from '../../e2e/fixtures/roadmaps.json';

const [base] = fixture as Roadmap[];

const renderValue = (en: string) =>
  render(
    <LanguageProvider>
      <OurValue
        meta={{
          ...base.meta,
          vision: { en: 'Not shown here', cy: '' },
          serviceDescription: { en, cy: '' },
        }}
      />
    </LanguageProvider>,
  );

afterEach(cleanup);

describe('OurValue', () => {
  it('shows the service description under "Our value", without the vision', () => {
    renderValue('What it does');
    expect(screen.getByRole('region', { name: 'Our value' })).toBeTruthy();
    expect(screen.getByText('What it does')).toBeTruthy();
    expect(screen.queryByText('Not shown here')).toBeNull();
  });

  it('renders nothing when the service description is blank', () => {
    const { container } = renderValue('');
    expect(container.innerHTML).toBe('');
  });
});

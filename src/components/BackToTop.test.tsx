// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { BackToTop } from './BackToTop';
import { LanguageProvider } from './LanguageProvider';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test('scrolls to the top explicitly when clicked', () => {
  const scrollTo = vi.fn();
  vi.stubGlobal('scrollTo', scrollTo);
  render(
    <LanguageProvider>
      <span id="top" tabIndex={-1} />
      <BackToTop />
    </LanguageProvider>,
  );
  Object.defineProperty(window, 'scrollY', { value: 500, configurable: true });
  fireEvent.scroll(window);
  fireEvent.click(screen.getByRole('link', { name: /back to top/i }));
  expect(document.activeElement?.id).toBe('top');
  expect(scrollTo).toHaveBeenCalledWith({ top: 0, left: 0 });
});

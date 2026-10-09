// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LANG_STORAGE_KEY, preferredLang, useLanguage } from '../lib/i18n';
import { LanguageProvider } from './LanguageProvider';
import { LanguageToggle } from './LanguageToggle';

function Probe() {
  const { lang, route } = useLanguage();
  return (
    <p>
      {lang} {route.slug}
    </p>
  );
}

const renderAt = (url: string) => {
  window.history.replaceState(null, '', url);
  return render(
    <LanguageProvider>
      <Probe />
      <LanguageToggle />
    </LanguageProvider>,
  );
};

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('LanguageProvider', () => {
  it('takes the language from the path', () => {
    renderAt('/product-roadmaps/cy/a/');
    expect(screen.getByText('cy a')).toBeTruthy();
    expect(document.documentElement.lang).toBe('cy');
  });

  it('uses the default outside a language folder', () => {
    renderAt('/product-roadmaps/a/');
    expect(screen.getByText('en a')).toBeTruthy();
  });
});

describe('LanguageToggle', () => {
  it('links to the same page in each language', () => {
    renderAt('/product-roadmaps/en/a/');
    const welsh = screen.getByRole('link', { name: 'Cymraeg' });
    const english = screen.getByRole('link', { name: 'English' });
    expect(welsh.getAttribute('href')).toBe('/product-roadmaps/cy/a/');
    expect(welsh.getAttribute('aria-current')).toBeNull();
    expect(english.getAttribute('aria-current')).toBe('page');
  });

  it('switches without a reload, keeping the place on the page', () => {
    const scrollTo = vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => undefined);
    renderAt('/product-roadmaps/en/a/#roadmap');
    fireEvent.click(screen.getByRole('link', { name: 'Cymraeg' }));

    expect(window.location.pathname).toBe('/product-roadmaps/cy/a/');
    expect(window.location.hash).toBe('#roadmap');
    expect(scrollTo).not.toHaveBeenCalled();
    expect(screen.getByText('cy a')).toBeTruthy();
    expect(document.documentElement.lang).toBe('cy');
    expect(window.localStorage.getItem(LANG_STORAGE_KEY)).toBe('cy');
  });

  it('adds no history entry for the current language', () => {
    renderAt('/product-roadmaps/en/a/');
    const before = window.history.length;
    fireEvent.click(screen.getByRole('link', { name: 'English' }));
    expect(window.history.length).toBe(before);
  });
});

describe('preferredLang', () => {
  it('prefers the stored choice, then a Welsh browser, then the default', () => {
    const languages = vi.spyOn(navigator, 'languages', 'get');
    languages.mockReturnValue(['cy-GB', 'en']);
    window.localStorage.setItem(LANG_STORAGE_KEY, 'en');
    expect(preferredLang()).toBe('en');

    window.localStorage.clear();
    expect(preferredLang()).toBe('cy');

    languages.mockReturnValue(['en-GB', 'cym']);
    expect(preferredLang()).toBe('en');
  });
});

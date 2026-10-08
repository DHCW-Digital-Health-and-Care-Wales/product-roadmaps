// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LANG_STORAGE_KEY, useLanguage } from '../lib/i18n';
import { LanguageProvider } from './LanguageProvider';

function Probe() {
  const { lang, setLang } = useLanguage();
  return (
    <button type="button" onClick={() => setLang('cy')}>
      {lang}
    </button>
  );
}

const renderApp = () =>
  render(
    <LanguageProvider>
      <Probe />
    </LanguageProvider>,
  );

beforeEach(() => {
  window.localStorage.clear();
  window.history.replaceState(null, '', '/product-roadmaps/a/');
});

afterEach(cleanup);

describe('LanguageProvider', () => {
  it('keeps URLs clean for a first-time and returning visitor', () => {
    renderApp();
    expect(screen.getByRole('button').textContent).toBe('en');
    expect(window.localStorage.getItem(LANG_STORAGE_KEY)).toBeNull();
    cleanup();

    renderApp();
    expect(window.location.search).toBe('');
  });

  it('remembers an explicit choice in storage and the URL', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button'));

    expect(document.documentElement.lang).toBe('cy');
    expect(window.localStorage.getItem(LANG_STORAGE_KEY)).toBe('cy');
    expect(window.location.search).toBe('?lang=cy');
  });

  it('prefers the URL over the stored choice', () => {
    window.localStorage.setItem(LANG_STORAGE_KEY, 'en');
    window.history.replaceState(null, '', '/?lang=cy');
    renderApp();
    expect(screen.getByRole('button').textContent).toBe('cy');
  });
});

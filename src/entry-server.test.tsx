// @vitest-environment jsdom
import { act } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { describe, expect, it, vi } from 'vitest';
import App from './App';
import { LanguageProvider } from './components/LanguageProvider';
import snapshot from '../e2e/fixtures/roadmaps.json';
import { renderDataFiles, renderPages } from './entry-server';

const SITE = 'https://example.org/product-roadmaps/';
const pages = await renderPages(SITE);
const [first] = snapshot;

describe('prerender', () => {
  it('renders the site root, every page in each language and a 404 page', () => {
    expect(pages.map((page) => page.file)).toEqual([
      'index.html',
      ...['cy', 'en'].flatMap((lang) => [
        `${lang}/index.html`,
        ...snapshot.map((roadmap) => `${lang}/${roadmap.slug}/index.html`),
      ]),
      '404.html',
    ]);
  });

  it('sends the site root to the English landing page without JavaScript', () => {
    const [root] = pages;
    const english = pages.find((p) => p.file === 'en/index.html');
    expect(root.route).toBeNull();
    expect(root.html).toBe(english?.html);
    expect(root.url).toBe(`${SITE}en/`);
    expect(root.head).toContain(
      '<noscript><meta http-equiv="refresh" content="0; url=/product-roadmaps/en/" /></noscript>',
    );
    expect(english?.head).toContain(
      `<link rel="alternate" hreflang="x-default" href="${SITE}" />`,
    );
  });

  it('gives each product its own title, description and canonical URL', () => {
    const page = pages.find((p) => p.file === `en/${first.slug}/index.html`);
    expect(page?.html).toContain(first.meta.title.en);
    expect(page?.head).toContain(
      `<title>${first.meta.title.en} – DHCW roadmaps</title>`,
    );
    expect(page?.head).toContain(
      `<link rel="canonical" href="${SITE}en/${first.slug}/" />`,
    );
    expect(page?.head).toContain('property="og:description"');
  });

  it('links each page to itself in the other language', () => {
    const page = pages.find((p) => p.file === `cy/${first.slug}/index.html`);
    for (const lang of ['cy', 'en']) {
      expect(page?.head).toContain(
        `<link rel="alternate" hreflang="${lang}" href="${SITE}${lang}/${first.slug}/" />`,
      );
    }
    expect(page?.head).toContain(
      '<meta property="og:locale" content="cy_GB" />',
    );
    expect(page?.html).toContain(`href="/product-roadmaps/en/${first.slug}/"`);
  });

  it('publishes each roadmap’s data once as JSON and links to it', () => {
    for (const lang of ['cy', 'en']) {
      const page = pages.find(
        (p) => p.file === `${lang}/${first.slug}/index.html`,
      );
      expect(page?.head).toContain(
        `<link rel="alternate" type="application/json" href="${SITE}${first.slug}/roadmap.json" />`,
      );
    }
    const files = renderDataFiles();
    expect(files.map((f) => f.file)).toEqual(
      snapshot.map((roadmap) => `${roadmap.slug}/roadmap.json`),
    );
    expect(JSON.parse(files[0].content)).toEqual(first);
  });

  it('prerenders each language', () => {
    const second = snapshot[1];
    const english = pages.find(
      (p) => p.file === `en/${second.slug}/index.html`,
    );
    const welsh = pages.find((p) => p.file === `cy/${second.slug}/index.html`);
    expect(second.meta.title.cy).not.toBe('');
    expect(english?.lang).toBe('en');
    expect(english?.html).toContain(second.meta.title.en);
    expect(english?.html).not.toContain(second.meta.title.cy);
    expect(welsh?.lang).toBe('cy');
    expect(welsh?.route).toEqual({ lang: 'cy', slug: second.slug });
    expect(welsh?.html).toContain(second.meta.title.cy);
    expect(welsh?.head).toContain(`<title>${second.meta.title.cy} – `);
  });

  it('keeps 404.html out of search results', () => {
    const page = pages[pages.length - 1];
    expect(page?.head).toContain('<meta name="robots" content="noindex" />');
    expect(page?.head).not.toContain('canonical');
    expect(page?.html).toContain('We couldn’t find that page.');
  });

  it.each(['en', 'cy'])('hydrates in %s without mismatches', async (lang) => {
    const path = `${lang}/${first.slug}/`;
    const page = pages.find((p) => p.file === `${path}index.html`);
    window.history.replaceState(null, '', `/product-roadmaps/${path}`);
    document.body.innerHTML = `<div id="root">${page?.html ?? ''}</div>`;
    const onRecoverableError = vi.fn();
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const root = await act(() =>
      hydrateRoot(
        document.getElementById('root')!,
        <LanguageProvider>
          <App />
        </LanguageProvider>,
        { onRecoverableError },
      ),
    );

    expect(onRecoverableError.mock.calls).toEqual([]);
    // Server and client renderers share one context object only in this test.
    expect(
      consoleError.mock.calls.filter(
        ([message]) => !String(message).includes('multiple renderers'),
      ),
    ).toEqual([]);
    act(() => root.unmount());
    consoleError.mockRestore();
  });
});

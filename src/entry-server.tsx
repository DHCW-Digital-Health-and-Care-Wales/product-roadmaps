/**
 * Build-time entry for scripts/prerender.ts: renders the language choice at the
 * site root and every page in each language to static HTML, with per-page meta,
 * Open Graph and hreflang tags.
 */
import { StrictMode } from 'react';
import { prerender } from 'react-dom/static';
import App from './App';
import { LanguageProvider } from './components/LanguageProvider';
import { ROADMAP_INTRO } from './lib/content';
import { DEFAULT_LANGUAGE, LANGUAGES, t, type Lang } from './lib/i18n';
import { roadmaps } from './lib/roadmaps';
import { dataPathFor, pathFor, type Route } from './lib/router';
import { UI } from './lib/strings';
import type { Localised } from './lib/types';

export interface Page {
  /** Output file relative to the build directory. */
  file: string;
  /** Canonical URL, or null for 404.html. */
  url: string | null;
  /** The `lang` attribute for `<html>`. */
  lang: Lang;
  /** `data-lang` and `data-slug` for #root, or null when the page can't hydrate. */
  route: { lang: Lang; slug: string } | null;
  head: string;
  html: string;
}

const BASE = import.meta.env.BASE_URL;

/** Each roadmap's data is published once, at `<slug>/roadmap.json`. */
const JSON_FILE = 'roadmap.json';

const LOCALES: Record<Lang, string> = { en: 'en_GB', cy: 'cy_GB' };

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function head(
  siteUrl: string,
  page: {
    lang: Lang;
    title: string;
    description: string;
    url: string | null;
    alternates?: [hreflang: string, href: string][];
    json?: string;
  },
) {
  const otherLang = page.lang === 'en' ? 'cy' : 'en';
  const meta: [string, string, string][] = [
    ['name', 'description', page.description],
    ['property', 'og:type', 'website'],
    ['property', 'og:site_name', t(UI.siteTitle, page.lang)],
    ['property', 'og:title', page.title],
    ['property', 'og:description', page.description],
    ['property', 'og:image', new URL('Timeline.png', siteUrl).href],
    ['property', 'og:locale', LOCALES[page.lang]],
    ['property', 'og:locale:alternate', LOCALES[otherLang]],
    ['name', 'twitter:card', 'summary'],
  ];
  if (page.url) meta.push(['property', 'og:url', page.url]);
  else meta.push(['name', 'robots', 'noindex']);

  return [
    `<title>${escapeHtml(page.title)}</title>`,
    ...meta.map(
      ([attr, key, value]) =>
        `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`,
    ),
    ...(page.url
      ? [`<link rel="canonical" href="${escapeHtml(page.url)}" />`]
      : []),
    ...(page.alternates ?? []).map(
      ([hreflang, href]) =>
        `<link rel="alternate" hreflang="${hreflang}" href="${escapeHtml(href)}" />`,
    ),
    ...(page.json
      ? [
          `<link rel="alternate" type="application/json" href="${escapeHtml(page.json)}" />`,
        ]
      : []),
  ]
    .map((line) => `    ${line}`)
    .join('\n');
}

async function render(route: Route) {
  const { prelude } = await prerender(
    <StrictMode>
      <LanguageProvider serverRoute={route}>
        <App />
      </LanguageProvider>
    </StrictMode>,
  );
  return new Response(prelude).text();
}

/** `siteUrl` is the deployed address of the site root, ending in `/`. */
export async function renderPages(siteUrl: string): Promise<Page[]> {
  const urlFor = (path: string) =>
    new URL(path.slice(BASE.length), siteUrl).href;
  const rootUrl = urlFor(BASE);
  const alternatesFor = (slug: string | null): [string, string][] =>
    LANGUAGES.map(({ value }) => [value, urlFor(pathFor(value, slug))]);

  async function languagePage(
    lang: Lang,
    slug: string | null,
    title: Localised | null,
    description: Localised,
  ): Promise<Page> {
    const site = t(UI.siteTitle, lang);
    const url = urlFor(pathFor(lang, slug));
    return {
      file: `${lang}/${slug ? `${slug}/` : ''}index.html`,
      url,
      lang,
      route: { lang, slug: slug ?? '' },
      head: head(siteUrl, {
        lang,
        title: title ? `${t(title, lang)} – ${site}` : site,
        description: t(description, lang),
        url,
        alternates: slug
          ? alternatesFor(slug)
          : [...alternatesFor(null), ['x-default', rootUrl]],
        ...(slug ? { json: urlFor(dataPathFor(slug)) } : {}),
      }),
      html: await render({ lang, slug }),
    };
  }

  const languagePages = await Promise.all(
    LANGUAGES.flatMap(({ value: lang }) => [
      languagePage(lang, null, null, UI.landingIntro),
      ...roadmaps.map(({ slug, meta }) =>
        languagePage(
          lang,
          slug,
          meta.title,
          meta.serviceDescription.en ? meta.serviceDescription : ROADMAP_INTRO,
        ),
      ),
    ]),
  );

  // The site root shows the default landing page; src/main.tsx redirects with
  // JavaScript, and the <noscript> refresh does so without.
  const landing = languagePages.find(
    (page) => page.file === `${DEFAULT_LANGUAGE}/index.html`,
  )!;
  const root: Page = {
    ...landing,
    file: 'index.html',
    route: null,
    head: [
      `    <noscript><meta http-equiv="refresh" content="0; url=${pathFor(DEFAULT_LANGUAGE, null)}" /></noscript>`,
      landing.head,
    ].join('\n'),
  };

  const notFoundTitle = t(UI.notFoundHeading, DEFAULT_LANGUAGE);
  const notFound: Page = {
    file: '404.html',
    url: null,
    lang: DEFAULT_LANGUAGE,
    route: null,
    head: head(siteUrl, {
      lang: DEFAULT_LANGUAGE,
      title: `${notFoundTitle} – ${t(UI.siteTitle, DEFAULT_LANGUAGE)}`,
      description: t(UI.notFoundGeneric, DEFAULT_LANGUAGE),
      url: null,
    }),
    html: await render({ lang: DEFAULT_LANGUAGE, slug: '' }),
  };

  return [root, ...languagePages, notFound];
}

export interface DataFile {
  /** Output file relative to the build directory. */
  file: string;
  content: string;
}

/** The JSON behind each roadmap page, for viewing on the published site. */
export function renderDataFiles(): DataFile[] {
  return roadmaps.map((roadmap) => ({
    file: `${roadmap.slug}/${JSON_FILE}`,
    content: `${JSON.stringify(roadmap, null, 2)}\n`,
  }));
}

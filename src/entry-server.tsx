/**
 * Build-time entry for scripts/prerender.ts: renders every page to static HTML
 * in the default language, with per-page meta and Open Graph tags.
 */
import { StrictMode } from 'react';
import { prerender } from 'react-dom/static';
import App from './App';
import { LanguageProvider } from './components/LanguageProvider';
import { ROADMAP_INTRO } from './lib/content';
import { DEFAULT_LANGUAGE, t } from './lib/i18n';
import { roadmaps } from './lib/roadmaps';
import { pathFor } from './lib/router';
import { UI } from './lib/strings';
import type { Localised } from './lib/types';

export interface Page {
  /** Output file relative to the build directory. */
  file: string;
  /** Absolute URL, or null for 404.html. */
  url: string | null;
  /** Value for `data-slug` on #root, or null when the page can't hydrate. */
  slug: string | null;
  head: string;
  html: string;
}

/** Each roadmap's data is published next to its page, at `<slug>/roadmap.json`. */
const JSON_FILE = 'roadmap.json';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const text = (value: Localised) => t(value, DEFAULT_LANGUAGE);

function head(
  siteUrl: string,
  page: {
    title: Localised | null;
    description: Localised;
    url: string | null;
    json?: string;
  },
) {
  const site = text(UI.siteTitle);
  const title = page.title ? `${text(page.title)} – ${site}` : site;
  const meta: [string, string, string][] = [
    ['name', 'description', text(page.description)],
    ['property', 'og:type', 'website'],
    ['property', 'og:site_name', site],
    ['property', 'og:title', title],
    ['property', 'og:description', text(page.description)],
    ['property', 'og:image', new URL('Timeline.png', siteUrl).href],
    ['property', 'og:locale', 'en_GB'],
    ['property', 'og:locale:alternate', 'cy_GB'],
    ['name', 'twitter:card', 'summary'],
  ];
  if (page.url) meta.push(['property', 'og:url', page.url]);
  else meta.push(['name', 'robots', 'noindex']);

  return [
    `<title>${escapeHtml(title)}</title>`,
    ...meta.map(
      ([attr, key, value]) =>
        `<meta ${attr}="${key}" content="${escapeHtml(value)}" />`,
    ),
    ...(page.url
      ? [`<link rel="canonical" href="${escapeHtml(page.url)}" />`]
      : []),
    ...(page.json
      ? [
          `<link rel="alternate" type="application/json" href="${escapeHtml(page.json)}" />`,
        ]
      : []),
  ]
    .map((line) => `    ${line}`)
    .join('\n');
}

async function render(serverSlug: string | null) {
  const { prelude } = await prerender(
    <StrictMode>
      <LanguageProvider>
        <App serverSlug={serverSlug} />
      </LanguageProvider>
    </StrictMode>,
  );
  return new Response(prelude).text();
}

/** `siteUrl` is the deployed address of the site root, ending in `/`. */
export async function renderPages(siteUrl: string): Promise<Page[]> {
  const urlFor = (slug: string | null) =>
    new URL(pathFor(slug).slice(import.meta.env.BASE_URL.length), siteUrl).href;
  const jsonUrlFor = (slug: string) => `${urlFor(slug)}${JSON_FILE}`;

  const landing: Page = {
    file: 'index.html',
    url: urlFor(null),
    slug: '',
    head: head(siteUrl, {
      title: null,
      description: UI.landingIntro,
      url: urlFor(null),
    }),
    html: await render(null),
  };

  const products = await Promise.all(
    roadmaps.map(
      async ({ slug, meta }): Promise<Page> => ({
        file: `${slug}/index.html`,
        url: urlFor(slug),
        slug,
        head: head(siteUrl, {
          title: meta.title,
          description: meta.serviceDescription.en
            ? meta.serviceDescription
            : ROADMAP_INTRO,
          url: urlFor(slug),
          json: jsonUrlFor(slug),
        }),
        html: await render(slug),
      }),
    ),
  );

  const notFound: Page = {
    file: '404.html',
    url: null,
    slug: null,
    head: head(siteUrl, {
      title: UI.notFoundHeading,
      description: UI.notFoundGeneric,
      url: null,
    }),
    html: await render(''),
  };

  return [landing, ...products, notFound];
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

/**
 * Writes static HTML for every page into dist/ after `vite build`, so the site
 * works without JavaScript and search engines and link previews see real
 * content. Run by `npm run build`, after the SSR build of src/entry-server.tsx.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

// Matches the Page type in src/entry-server.tsx, which Node can't import.
interface Page {
  file: string;
  url: string | null;
  lang: string;
  route: { lang: string; slug: string } | null;
  head: string;
  html: string;
}

interface ServerEntry {
  renderPages(siteUrl: string): Promise<Page[]>;
  renderDataFiles(): { file: string; content: string }[];
}

const SITE_URL =
  process.env.SITE_URL ||
  'https://dhcw-digital-health-and-care-wales.github.io/product-roadmaps/';

const dist = new URL('../dist/', import.meta.url);
const template = readFileSync(new URL('index.html', dist), 'utf8');

const HEAD = /<!--app-head-->[\s\S]*<!--\/app-head-->/;
const ROOT = '<div id="root"></div>';
const HTML = '<html lang="en">';
if (
  !HEAD.test(template) ||
  !template.includes(ROOT) ||
  !template.includes(HTML)
) {
  throw new Error('dist/index.html is missing the prerender markers.');
}

const entry = (await import(
  new URL('../dist-ssr/entry-server.js', import.meta.url).href
)) as ServerEntry;
const pages = await entry.renderPages(SITE_URL);

for (const page of pages) {
  // Values are slugs and language codes, which need no escaping.
  const root = page.route
    ? `<div id="root" data-lang="${page.route.lang}" data-slug="${page.route.slug}">${page.html}</div>`
    : `<div id="root">${page.html}</div>`;
  const html = template
    .replace(HTML, () => `<html lang="${page.lang}">`)
    .replace(HEAD, () => page.head.trimStart())
    .replace(ROOT, () => root);
  const file = new URL(page.file, dist);
  mkdirSync(dirname(file.pathname), { recursive: true });
  writeFileSync(file, html);
}

for (const { file, content } of entry.renderDataFiles()) {
  const url = new URL(file, dist);
  mkdirSync(dirname(url.pathname), { recursive: true });
  writeFileSync(url, content);
}

// No robots.txt: crawlers only read it from the root of the domain, which a
// GitHub Pages project site doesn't control. Submit the sitemap instead.
const urls = new Set(pages.flatMap((page) => (page.url ? [page.url] : [])));
writeFileSync(
  new URL('sitemap.xml', dist),
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...[...urls].map((url) => `  <url><loc>${url}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n'),
);

console.log(`Prerendered ${pages.map((page) => page.file).join(', ')}`);

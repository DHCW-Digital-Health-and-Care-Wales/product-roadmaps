/// <reference types="vitest/config" />
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The live data is made by `npm run sync` and never committed. ROADMAPS_DATA
// swaps in other data, so unit, end-to-end and visual tests use fixed example
// data that a sheet edit can't change.
const LIVE_DATA = '.data/roadmaps.json';

function roadmapsData(file: string): Plugin {
  return {
    name: 'roadmaps-data',
    enforce: 'pre',
    resolveId(source) {
      if (source !== 'virtual:roadmaps') return null;
      if (!existsSync(file)) {
        throw new Error(
          `${file} not found. Run \`npm run sync\`, or set ROADMAPS_DATA=e2e/fixtures/roadmaps.json to use the example data.`,
        );
      }
      return resolve(file);
    },
    // The build writes these files (scripts/prerender.ts); serve them in dev too.
    configureServer(server) {
      const route = /^\/product-roadmaps\/([^/]+)\/roadmap\.json$/;
      server.middlewares.use((req, res, next) => {
        const slug = route.exec((req.url ?? '').split('?')[0])?.[1];
        if (!slug || !existsSync(file)) return next();
        const roadmaps = JSON.parse(readFileSync(file, 'utf8')) as {
          slug: string;
        }[];
        const roadmap = roadmaps.find(
          (r) => r.slug === decodeURIComponent(slug),
        );
        if (!roadmap) return next();
        res.setHeader('Content-Type', 'application/json');
        res.end(`${JSON.stringify(roadmap, null, 2)}\n`);
      });
    },
  };
}

// Like GitHub Pages, serve 404.html for missing pages in `vite preview`, instead
// of Vite's fallback to the root index.html.
function pagesNotFound(): Plugin {
  return {
    name: 'pages-not-found',
    configurePreviewServer(server) {
      const dist = resolve(server.config.root, server.config.build.outDir);
      const { base } = server.config;
      server.middlewares.use((req, res, next) => {
        const path = (req.url ?? '').split('?')[0];
        if (!path.startsWith(base)) return next();
        let file: string;
        try {
          file = resolve(dist, decodeURIComponent(path.slice(base.length)));
        } catch {
          return next();
        }
        const exists =
          existsSync(file) &&
          (statSync(file).isFile() || existsSync(join(file, 'index.html')));
        if (exists || !file.startsWith(dist)) return next();
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        res.end(readFileSync(join(dist, '404.html')));
      });
    },
  };
}

// Project site is served from https://<org>.github.io/product-roadmaps/
// so assets must be referenced from that absolute base. A relative base ('./')
// 404s when the site is accessed without a trailing slash or on a client-side
// deep link, because ./assets/... then resolves one directory too high.
export default defineConfig({
  base: '/product-roadmaps/',
  plugins: [
    react(),
    tailwindcss(),
    pagesNotFound(),
    roadmapsData(
      process.env.ROADMAPS_DATA ??
        (process.env.VITEST ? 'e2e/fixtures/roadmaps.json' : LIVE_DATA),
    ),
  ],
  test: {
    // Vitest resets the base to '/'; keep the deployed paths in tests.
    env: { BASE_URL: '/product-roadmaps/' },
    exclude: ['**/node_modules/**', 'e2e/**'],
  },
});

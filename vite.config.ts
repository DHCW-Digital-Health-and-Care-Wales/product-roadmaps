/// <reference types="vitest/config" />
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// ROADMAPS_DATA swaps in another snapshot, so unit, end-to-end and visual tests
// use fixed example data that a nightly sheet sync can't change.
function roadmapsData(file: string | undefined): Plugin | false {
  if (!file) return false;
  return {
    name: 'roadmaps-data',
    enforce: 'pre',
    resolveId: (source) =>
      source.endsWith('/data/roadmaps.json') ? resolve(file) : null,
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
    roadmapsData(
      process.env.ROADMAPS_DATA ??
        (process.env.VITEST ? 'e2e/fixtures/roadmaps.json' : undefined),
    ),
  ],
  test: {
    // Vitest resets the base to '/'; keep the deployed paths in tests.
    env: { BASE_URL: '/product-roadmaps/' },
    exclude: ['**/node_modules/**', 'e2e/**'],
  },
});

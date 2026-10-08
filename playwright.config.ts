import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}/product-roadmaps/`;

/**
 * End-to-end and ARIA snapshot tests against a production build (`vite preview`) of
 * the fixed data in e2e/fixtures/roadmaps.json, made from sheets/*.csv.
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  expect: {
    // Desktop and mobile differ (the mobile menu), so each has its own file.
    toMatchAriaSnapshot: {
      pathTemplate:
        '{testDir}/__snapshots__/{testFileName}/{arg}-{projectName}{ext}',
    },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
    env: { ROADMAPS_DATA: 'e2e/fixtures/roadmaps.json' },
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

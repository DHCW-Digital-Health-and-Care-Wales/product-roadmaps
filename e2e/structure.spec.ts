import { expect, test } from '@playwright/test';

// Compares each page's accessibility tree (roles, names and text) with the
// YAML in e2e/__snapshots__. After an intended change, run
// `npm run test:e2e -- --update-snapshots` and review the diff.
const pages = {
  landing: './',
  product: 'producta/',
  'not-found': 'nope/',
  'landing-cy': './?lang=cy',
  'product-cy': 'producta/?lang=cy',
};

for (const [name, path] of Object.entries(pages)) {
  test(`${name} page structure`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('body')).toMatchAriaSnapshot({
      name: `${name}.aria.yml`,
    });
  });
}

import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

interface SnapshotRoadmap {
  slug: string;
  meta: { title: { en: string } };
}

const roadmaps = JSON.parse(
  readFileSync(new URL('fixtures/roadmaps.json', import.meta.url), 'utf8'),
) as SnapshotRoadmap[];
const [first, second] = roadmaps;
const title = first.meta.title.en;

const h1 = (page: Page) => page.getByRole('heading', { level: 1 });

async function tabTo(page: Page, target: Locator) {
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((el) => el === document.activeElement)) return;
  }
  throw new Error('Target is not reachable with Tab');
}

// React reports hydration mismatches as console errors.
let errors: string[] = [];

test.beforeEach(({ page }) => {
  errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the landing page lists every roadmap', async ({ page }) => {
    await page.goto('./');
    await expect(h1(page)).toHaveText('Product roadmaps');
    for (const roadmap of roadmaps) {
      await expect(
        page.getByRole('link', { name: roadmap.meta.title.en }),
      ).toHaveAttribute('href', `/product-roadmaps/${roadmap.slug}/`);
    }
  });

  test('a product page has its content and meta tags', async ({ page }) => {
    await page.goto(`${first.slug}/`);
    await expect(h1(page)).toHaveText(title);
    await expect(
      page.getByRole('heading', { name: 'The roadmap' }),
    ).toBeVisible();
    await expect(page).toHaveTitle(`${title} – DHCW roadmaps`);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      `${title} – DHCW roadmaps`,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`/product-roadmaps/${first.slug}/$`),
    );
  });
});

test.describe('navigation', () => {
  test('moves between pages without reloading, with back and forward', async ({
    page,
  }) => {
    await page.goto('./');
    await page.getByRole('link', { name: title }).click();

    await expect(page).toHaveURL(
      new RegExp(`/product-roadmaps/${first.slug}/$`),
    );
    await expect(h1(page)).toHaveText(title);
    await expect(h1(page)).toBeFocused();
    await expect(page).toHaveTitle(`${title} – DHCW roadmaps`);

    await page.goBack();
    await expect(h1(page)).toHaveText('Product roadmaps');
    await expect(h1(page)).toBeFocused();

    await page.goForward();
    await expect(h1(page)).toHaveText(title);
  });

  test('opens a deep link', async ({ page }) => {
    await page.goto(`${second.slug}/#roadmap`);
    await expect(h1(page)).toHaveText(second.meta.title.en);
  });

  test('shows not found for an unknown product', async ({ page }) => {
    await page.goto('nope/');
    await expect(h1(page)).toHaveText('Roadmap not found');
    await expect(page.getByText('called “nope”')).toBeVisible();
  });
});

test.describe('language', () => {
  test('keeps the choice across navigation and visits', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Cymraeg' }).click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'cy');
    await expect(page).toHaveURL(/\?lang=cy$/);
    await expect(h1(page)).toHaveText('Trywyddion cynnyrch');

    await page.getByRole('link', { name: title }).click();
    await expect(page).toHaveURL(
      new RegExp(`/product-roadmaps/${first.slug}/\\?lang=cy$`),
    );
    await expect(
      page.getByRole('heading', { name: 'Y trywydd' }),
    ).toBeVisible();

    await page.goto('./');
    await expect(page.locator('html')).toHaveAttribute('lang', 'cy');
    await expect(h1(page)).toHaveText('Trywyddion cynnyrch');
  });

  test('keeps first-time visitors on clean URLs', async ({ page }) => {
    await page.goto(`${first.slug}/`);
    await expect(h1(page)).toHaveText(title);
    expect(new URL(page.url()).search).toBe('');
  });
});

test.describe('keyboard', () => {
  test('the skip link jumps past the header', async ({ page }) => {
    await page.goto(`${first.slug}/`);
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main-content$/);
    await page.keyboard.press('Tab');
    await expect(page.locator('main :focus')).toHaveCount(1);
  });

  test('a keyboard user can open a roadmap', async ({ page }) => {
    await page.goto('./');
    const link = page.getByRole('link', { name: title });
    await tabTo(page, link);
    await page.keyboard.press('Enter');
    await expect(h1(page)).toHaveText(title);
    await expect(h1(page)).toBeFocused();
  });
});

test.describe('mobile menu', () => {
  test('opens, lists the sections and closes after choosing one', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'The menu button only shows on narrow screens');
    await page.goto(`${first.slug}/`);

    const button = page.getByRole('button', { name: 'Open menu' });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await button.click();

    const menu = page.locator('#mobile-nav');
    await expect(menu).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Close menu' }),
    ).toHaveAttribute('aria-expanded', 'true');

    await menu.getByRole('link', { name: 'The roadmap' }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#roadmap$/);
  });
});

test.describe('accessibility (axe, including colour contrast)', () => {
  const pages = {
    landing: './',
    product: `${first.slug}/`,
    'not found': 'nope/',
  };

  for (const lang of ['en', 'cy']) {
    for (const [name, path] of Object.entries(pages)) {
      test(`${name} page in ${lang}`, async ({ page }) => {
        await page.goto(`${path}?lang=${lang}`);
        await expect(h1(page)).toBeVisible();
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
      });
    }
  }
});

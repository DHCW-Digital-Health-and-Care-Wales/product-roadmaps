import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { CATEGORY_SHEET_VALUES, type CategoryId } from '../src/lib/types.ts';

interface SnapshotRoadmap {
  slug: string;
  meta: {
    title: { en: string };
    family: { en: string };
    category: CategoryId | '';
  };
}

const roadmaps = JSON.parse(
  readFileSync(new URL('fixtures/roadmaps.json', import.meta.url), 'utf8'),
) as SnapshotRoadmap[];
const [first, second] = roadmaps;
const title = first.meta.title.en;
// Roadmap pages put the family in front of the title.
const fullTitle = (roadmap: SnapshotRoadmap) =>
  roadmap.meta.family.en
    ? `${roadmap.meta.family.en}: ${roadmap.meta.title.en}`
    : roadmap.meta.title.en;
const pageTitle = fullTitle(first);

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
    if (message.type() !== 'error') return;
    // Missing pages are served as 404.html with a 404 status, as on GitHub Pages.
    const isPage404 =
      message.text().includes('status of 404') &&
      message.location().url === page.url();
    if (!isPage404) errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the site root goes to the English landing page', async ({ page }) => {
    await page.goto('./');
    await expect(page).toHaveURL(/\/product-roadmaps\/en\/$/);
    await expect(h1(page)).toHaveText('Product roadmaps');
  });

  test('the landing page lists every roadmap', async ({ page }) => {
    await page.goto('en/');
    await expect(h1(page)).toHaveText('Product roadmaps');
    for (const roadmap of roadmaps) {
      await expect(
        page.getByRole('link', { name: roadmap.meta.title.en }),
      ).toHaveAttribute('href', `/product-roadmaps/en/${roadmap.slug}/`);
    }
  });

  test('a product page has its content and meta tags', async ({ page }) => {
    await page.goto(`en/${first.slug}/`);
    await expect(h1(page)).toHaveText(pageTitle);
    // toHaveText reads text content; the accessible name can differ in spacing.
    await expect(
      page.getByRole('heading', { level: 1, name: pageTitle, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'The roadmap' }),
    ).toBeVisible();
    await expect(page).toHaveTitle(`${pageTitle} – DHCW roadmaps`);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      'content',
      `${pageTitle} – DHCW roadmaps`,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`/product-roadmaps/en/${first.slug}/$`),
    );
  });

  test('the language toggle opens the Welsh page', async ({ page }) => {
    await page.goto(`en/${first.slug}/`);
    await page.getByRole('link', { name: 'Cymraeg' }).click();

    await expect(page).toHaveURL(
      new RegExp(`/product-roadmaps/cy/${first.slug}/$`),
    );
    await expect(page.locator('html')).toHaveAttribute('lang', 'cy');
    await expect(
      page.getByRole('heading', { name: 'Y trywydd' }),
    ).toBeVisible();
    await expect(page).toHaveTitle(`${pageTitle} – Trywyddion IGDC`);
  });

  test('a filtered link shows every item, without the filter', async ({
    page,
  }) => {
    await page.goto(`en/${first.slug}/?org=cavuhb`);
    await expect(h1(page)).toHaveText(pageTitle);
    await expect(page.locator('#org-filter')).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^Filter by/ })).toHaveCount(
      0,
    );
    await expect(page.getByText('Swansea Bay').first()).toBeVisible();
  });

  test('a missing page is in Welsh and English', async ({ page }) => {
    await page.goto('cy/nope/');
    await expect(h1(page)).toHaveText(
      'Heb ddod o hyd i’r trywydd / Roadmap not found',
    );
    await page.getByRole('link', { name: 'Gweld pob trywydd' }).click();
    await expect(page).toHaveURL(/\/product-roadmaps\/cy\/$/);
    await expect(h1(page)).toHaveText('Trywyddion cynnyrch');
  });
});

test.describe('navigation', () => {
  test('moves between pages without reloading, with back and forward', async ({
    page,
  }) => {
    await page.goto('en/');
    await page.getByRole('link', { name: title }).click();

    await expect(page).toHaveURL(
      new RegExp(`/product-roadmaps/en/${first.slug}/$`),
    );
    await expect(h1(page)).toHaveText(pageTitle);
    await expect(h1(page)).toBeFocused();
    await expect(page).toHaveTitle(`${pageTitle} – DHCW roadmaps`);

    await page.goBack();
    await expect(h1(page)).toHaveText('Product roadmaps');
    await expect(h1(page)).toBeFocused();

    await page.goForward();
    await expect(h1(page)).toHaveText(pageTitle);
  });

  test('opens a deep link', async ({ page }) => {
    await page.goto(`en/${second.slug}/#roadmap`);
    await expect(h1(page)).toHaveText(fullTitle(second));
  });

  test('shows the list view with ?view=list', async ({ page }) => {
    await page.goto(`en/${first.slug}/?view=list`);
    await expect(
      page.getByRole('navigation', { name: 'At a glance' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'The roadmap' }),
    ).toHaveCount(0);

    await page.getByRole('link', { name: 'Cymraeg' }).click();
    await expect(page).toHaveURL(/\?view=list$/);
    await expect(
      page.getByRole('navigation', { name: 'Cipolwg' }),
    ).toBeVisible();
  });

  test('switches layout from the footer, keeping focus, and back', async ({
    page,
  }) => {
    await page.goto(`en/${first.slug}/`);
    const toList = page.getByRole('link', { name: 'List view' });
    await toList.focus();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\?view=list$/);
    await expect(
      page.getByRole('navigation', { name: 'At a glance' }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Card view' })).toBeFocused();

    await page.goBack();
    await expect(
      page.getByRole('heading', { name: 'The roadmap' }),
    ).toBeVisible();
  });

  test('scrolls to a heading linked in the list view', async ({ page }) => {
    await page.goto(`en/${first.slug}/?view=list#horizon-later`);
    await expect(
      page.getByRole('heading', { level: 2, name: 'Later', exact: true }),
    ).toBeInViewport();
  });

  test('shows not found for an unknown product', async ({ page }) => {
    await page.goto('en/nope/');
    await expect(h1(page)).toHaveText('Roadmap not found');
    await expect(page.getByText('called “nope”')).toBeVisible();
  });
});

test.describe('language', () => {
  test('sends the site root to the chosen language', async ({ page }) => {
    await page.goto('./');
    await expect(page).toHaveURL(/\/product-roadmaps\/en\/$/);
    await page.getByRole('link', { name: 'Cymraeg' }).click();

    await expect(page).toHaveURL(/\/product-roadmaps\/cy\/$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'cy');
    await expect(h1(page)).toHaveText('Trywyddion cynnyrch');

    await page.getByRole('link', { name: title }).click();
    await expect(page).toHaveURL(
      new RegExp(`/product-roadmaps/cy/${first.slug}/$`),
    );
    await expect(
      page.getByRole('heading', { name: 'Y trywydd' }),
    ).toBeVisible();

    await page.goto('./');
    await expect(page).toHaveURL(/\/product-roadmaps\/cy\/$/);
    await expect(h1(page)).toHaveText('Trywyddion cynnyrch');
  });

  test('switches in place, and back', async ({ page }) => {
    await page.goto(`en/${first.slug}/#roadmap`);
    await page.getByRole('link', { name: 'Cymraeg' }).click();

    await expect(page).toHaveURL(
      new RegExp(`/product-roadmaps/cy/${first.slug}/#roadmap$`),
    );
    await expect(page.locator('html')).toHaveAttribute('lang', 'cy');
    await expect(
      page.getByRole('heading', { name: 'Y trywydd' }),
    ).toBeVisible();

    await page.goBack();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(
      page.getByRole('heading', { name: 'The roadmap' }),
    ).toBeVisible();
  });
});

test.describe('keyboard', () => {
  test('both language links have an unclipped focus ring', async ({ page }) => {
    await page.goto('en/');
    const group = page.getByRole('group', {
      name: 'Dewis iaith / Choose language',
    });
    await expect(group).toHaveCSS('overflow', 'visible');

    for (const language of ['Cymraeg', 'English']) {
      const link = group.getByRole('link', { name: language });
      await tabTo(page, link);
      await expect(link).toBeFocused();
      await expect(link).toHaveCSS('outline-style', 'solid');
      await expect(link).toHaveCSS('outline-width', '3px');
      await expect(link).toHaveCSS('outline-color', 'rgb(248, 202, 77)');
      await expect(link).toHaveCSS(
        'box-shadow',
        'rgb(27, 41, 74) 0px 0px 0px 6px',
      );
      expect(
        await link.evaluate((element) => {
          const sibling = Array.from(element.parentElement!.children).find(
            (child) => child !== element,
          )!;
          return (
            getComputedStyle(element).position === 'relative' &&
            Number(getComputedStyle(element).zIndex) >
              (Number(getComputedStyle(sibling).zIndex) || 0)
          );
        }),
      ).toBe(true);

      await page.keyboard.press('Enter');
      await expect(link).toHaveAttribute('aria-current', 'page');
      await expect(link).toBeFocused();
    }
  });

  test('the skip link jumps past the header', async ({ page }) => {
    await page.goto(`en/${first.slug}/`);
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
    await page.goto('en/');
    const link = page.getByRole('link', { name: title });
    await tabTo(page, link);
    await page.keyboard.press('Enter');
    await expect(h1(page)).toHaveText(pageTitle);
    await expect(h1(page)).toBeFocused();
  });
});

test.describe('landing page', () => {
  test('jumps to a category and filters with the search', async ({ page }) => {
    const category = roadmaps.find((r) => r.meta.category)?.meta.category;
    if (!category) throw new Error('The fixture needs a categorised roadmap');
    await page.goto('en/');
    const categories = page.getByRole('navigation', {
      name: 'Browse by category',
    });
    await categories
      .getByRole('link', { name: CATEGORY_SHEET_VALUES[category] })
      .click();
    await expect(page).toHaveURL(new RegExp(`#category-${category}$`));
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: CATEGORY_SHEET_VALUES[category],
      }),
    ).toBeInViewport();

    const search = page.getByRole('searchbox', { name: 'Find a product' });
    await search.fill(second.meta.title.en);
    await expect(page.getByRole('status')).toHaveText(
      `Showing 1 of ${roadmaps.length} roadmaps`,
    );
    await expect(page.getByRole('link', { name: title })).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: second.meta.title.en }),
    ).toBeVisible();

    await search.fill('no such product');
    await expect(page.getByText(/No roadmaps match your search/)).toBeVisible();
    await search.fill('');
    await expect(page.getByRole('link', { name: title })).toBeVisible();
  });
});

test.describe('organisation filter', () => {
  const withNational =
    'Showing 2 of 2 roadmaps for Cardiff and Vale, including all-Wales work';
  // Where an element is on screen, to check it doesn't jump.
  const top = (locator: Locator) =>
    locator.evaluate((element) => element.getBoundingClientRect().top);
  // Chromium keeps content in place by itself as the page changes above it,
  // which would hide a failure to; Safari doesn't.
  const withoutScrollAnchoring = (page: Page) =>
    page.addStyleTag({ content: '* { overflow-anchor: none }' });

  test('filters the landing page and carries the filter to a roadmap and back', async ({
    page,
  }) => {
    await page.goto('en/');
    await page.getByText('Filter by organisation').click();
    await page
      .getByRole('combobox', { name: 'Organisation' })
      .selectOption('cavuhb');
    await expect(page).toHaveURL(/\/en\/\?org=cavuhb$/);
    await expect(page.getByRole('status')).toHaveText(withNational);

    await page
      .getByRole('checkbox', { name: 'Include all-Wales work' })
      .click();
    await expect(page).toHaveURL(/\?org=cavuhb&all=no$/);
    await expect(page.getByRole('status')).toHaveText(
      'Showing 1 of 2 roadmaps for Cardiff and Vale',
    );
    await expect(
      page.getByRole('link', { name: second.meta.title.en }),
    ).toHaveCount(0);
    await expect(
      page.getByText('2 of 9 items for Cardiff and Vale'),
    ).toBeVisible();

    await page.getByRole('link', { name: title }).click();
    await expect(page).toHaveURL(
      new RegExp(`/en/${first.slug}/\\?org=cavuhb&all=no$`),
    );
    await expect(h1(page)).toBeFocused();
    await expect(
      page.getByText('Showing 2 of 9 items for Cardiff and Vale').first(),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: '← All roadmaps' }),
    ).toHaveAttribute('href', '/product-roadmaps/en/?org=cavuhb&all=no');

    await page.getByRole('link', { name: 'Cymraeg' }).click();
    await expect(page).toHaveURL(/\/cy\/.*\?org=cavuhb&all=no$/);
    await page.goBack();

    await page.goBack();
    await expect(h1(page)).toHaveText('Product roadmaps');
    await expect(
      page.getByRole('combobox', { name: 'Organisation' }),
    ).toHaveValue('cavuhb');
    await expect(page.getByRole('status')).toHaveText(
      'Showing 1 of 2 roadmaps for Cardiff and Vale',
    );

    await page.goForward();
    await expect(h1(page)).toHaveText(pageTitle);
  });

  test('a pill filters the roadmap and keeps its card in place', async ({
    page,
  }) => {
    await page.goto(`en/${first.slug}/`);
    await withoutScrollAnchoring(page);
    const pill = page
      .getByRole('button', { name: 'Filter by Cardiff and Vale' })
      .first();
    // Below the sticky header, with filtered-out items above it.
    await pill.evaluate((element) =>
      element.scrollIntoView({ block: 'center', behavior: 'instant' }),
    );
    const before = await top(pill);

    await pill.click();
    await expect(page).toHaveURL(/\?org=cavuhb$/);
    await expect(pill).toHaveAttribute('aria-pressed', 'true');
    await expect(pill).toBeFocused();
    expect(Math.abs((await top(pill)) - before)).toBeLessThanOrEqual(1);
    await expect(
      page.getByRole('heading', { name: 'Recently shipped work' }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('status').filter({ hasText: 'Cardiff and Vale' }),
    ).toHaveCount(1);

    await pill.click();
    await expect(page).not.toHaveURL(/org=/);
    await expect(pill).toHaveAttribute('aria-pressed', 'false');
    await expect(pill).toBeFocused();
  });

  test('an empty section shows its hidden items in place', async ({ page }) => {
    await page.goto(`en/${first.slug}/?org=cavuhb`);
    await withoutScrollAnchoring(page);
    const section = page.getByRole('region', { name: /^Recently delivered/ });
    const show = section.getByRole('button', { name: 'Show 1 hidden item' });
    // The button just below the header, with the section's heading above the
    // screen and filtered-out items above that.
    await show.evaluate((element) =>
      element.scrollIntoView({ block: 'start', behavior: 'instant' }),
    );
    expect(await top(section.getByRole('heading').first())).toBeLessThan(0);
    const before = await top(section);

    await show.click();
    await expect(page).not.toHaveURL(/org=/);
    const card = section.getByRole('heading', {
      name: 'Recently shipped work',
    });
    await expect(card).toBeFocused();
    await expect(card).toBeInViewport();
    expect(Math.abs((await top(section)) - before)).toBeLessThanOrEqual(1);
  });

  test('the header opens the filter', async ({ page, isMobile }) => {
    await page.goto(`en/${first.slug}/?org=cavuhb`);
    await page
      .getByRole('banner')
      .getByRole('button', {
        name: isMobile
          ? 'Filtered by: Cardiff and Vale'
          : 'Filtered by organisation: Cardiff and Vale',
      })
      .click();
    const select = page.getByRole('combobox', { name: 'Organisation' });
    await expect(select).toBeFocused();
    await expect(select).toBeInViewport();
  });

  test('the header clears the filter, keeping the first card in place', async ({
    page,
  }) => {
    await page.goto(`en/${first.slug}/?org=cavuhb`);
    await withoutScrollAnchoring(page);
    await page
      .locator('#roadmap')
      .evaluate((element) =>
        element.scrollIntoView({ block: 'start', behavior: 'instant' }),
      );
    // The first card on screen, which the filtered-out item above would move.
    const card = page.getByRole('article').filter({
      has: page.getByRole('heading', {
        name: 'Example card with every column',
      }),
    });
    const before = await top(card);

    const clear = page
      .getByRole('banner')
      .getByRole('button', { name: 'Clear filter' });
    await clear.click();
    await expect(page).not.toHaveURL(/org=/);
    await expect(clear).toHaveCount(0);
    expect(Math.abs((await top(card)) - before)).toBeLessThanOrEqual(1);
    await expect(card.locator('[data-filter-focus]')).toBeFocused();
  });

  test('fits a 320px screen, clear of the header and without scrolling sideways', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const path of ['en/?org=cavuhb', `cy/${first.slug}/?org=cavuhb`]) {
      await page.goto(path);
      // The strip under the header doesn't cover the top of the page.
      expect(
        await page.evaluate(() => {
          const header = document.querySelector('header')!;
          const intro = document.querySelector('main section')!;
          return (
            intro.getBoundingClientRect().top +
              parseFloat(getComputedStyle(intro).paddingTop) >
            header.getBoundingClientRect().bottom
          );
        }),
      ).toBe(true);
      // Open on the landing page while filtered, but not on a roadmap.
      const filter = page.locator('#org-filter');
      if ((await filter.getAttribute('open')) === null) {
        await filter.locator('summary').click();
      }
      await expect(
        page.getByRole('combobox', { name: /Organisation|Sefydliad/ }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  });
});

test.describe('mobile menu', () => {
  test('opens, lists the sections and closes after choosing one', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'The menu button only shows on narrow screens');
    await page.goto(`en/${first.slug}/`);

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
    landing: '',
    product: `${first.slug}/`,
    'not found': 'nope/',
    'filtered landing': '?org=cavuhb',
    'filtered product': `${first.slug}/?org=cavuhb&all=no`,
  };

  for (const lang of ['en', 'cy']) {
    for (const [name, path] of Object.entries(pages)) {
      test(`${name} page in ${lang}`, async ({ page }) => {
        await page.goto(`${lang}/${path}`);
        await expect(h1(page)).toBeVisible();
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
      });
    }
  }
});

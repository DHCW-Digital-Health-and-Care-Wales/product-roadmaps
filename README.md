# product-roadmaps

This repository publishes DHCW's public product roadmaps, in English and Welsh, at
**<https://dhcw-digital-health-and-care-wales.github.io/product-roadmaps/>** (Alpha), and
takes the public's feedback on them as issues.

It holds no code. The site's code, and the Roadmap Editor that Product Leads use, are in
the [roadmaps](https://github.com/DHCW-Digital-Health-and-Care-Wales/roadmaps)
repository (`apps/public-site/` and `apps/editor/`), where changes to them are proposed
([CONTRIBUTING.md](https://github.com/DHCW-Digital-Health-and-Care-Wales/roadmaps/blob/main/CONTRIBUTING.md)).

## Editing the roadmaps

Roadmap content (cards, titles, dates, colours) lives in a
[Google Sheet](https://docs.google.com/spreadsheets/d/1wuk_pK1LpfLKmdbg6WsY_qKeBC5lcN4rlsjqkAxtflw/edit),
not in a repository. Product Leads edit their roadmaps in the Roadmap Editor; anyone
editing the sheet itself follows its format:

- **The format**: what each tab and column holds, the categories and organisation codes,
  and the Welsh columns are described in the roadmaps repository's README
  ([Spreadsheet format](https://github.com/DHCW-Digital-Health-and-Care-Wales/roadmaps#spreadsheet-format)).
  Keep text columns as plain text.
- **Adding a product**: add a tab with the roadmap columns and a row for it on the first
  tab, with `Enabled` set to `Yes`. A roadmap that is not enabled is not published.
- **Example sheets** (fake data) to start a test spreadsheet from are in
  [`apps/public-site/sheets/`](https://github.com/DHCW-Digital-Health-and-Care-Wales/roadmaps/tree/main/apps/public-site/sheets).
- **Sharing**: the sheet must stay shared as **Anyone with the link can view**, so
  everything in it, any tab no roadmap names included, is visible to anyone with the
  link.

## When an edit goes live

The site is rebuilt from the sheet nightly at 02:00 UTC, so an edit appears the next
morning. To publish sooner, run **Actions → Deploy to GitHub Pages → Run workflow**.

To check the sheet without publishing, run **Actions → Check the roadmap sheet → Run
workflow**. Its summary lists sheet mistakes with their row numbers: unknown horizons,
rows with no title, unknown categories or organisation codes, and likely Welsh
translation mistakes. A mistake that stops the sync, such as a `Sheet` value with no
matching tab, fails the deploy too, and the previous site stays live.

GitHub pauses the nightly run after 60 days without activity in this repository;
re-enable it from the Actions tab if that happens.

## Feedback

The site's **Give feedback** link opens an issue here from the
[roadmap feedback template](.github/ISSUE_TEMPLATE/roadmap-feedback.md). Feedback on
the site's code or design belongs in the roadmaps repository.

## How it is published

`.github/workflows/deploy.yml` checks out the roadmaps repository's `main` at its head,
fetches the sheet, builds `apps/public-site` and publishes it to GitHub Pages, so a
change merged there goes public at the next run too. `.github/workflows/check-sheet.yml`
runs the same fetch and check alone. Both read the roadmaps repository with a read-only
token and need no secret; Dependabot keeps their actions current. `main` here is
protected by the ruleset kept in the roadmaps repository
(`.github/rulesets/product-roadmaps.json`).

Licensed under the [MIT License](LICENSE).

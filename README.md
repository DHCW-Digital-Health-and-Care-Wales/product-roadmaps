# product-roadmaps
Experiment for hosting public product roadmaps (Alpha)

A bilingual (English / Cymraeg) GitHub Pages site that publishes DHCW product
roadmaps. Look, feel and content model come from
[dhcw-vaccine-roadmap](https://github.com/DHCW-Digital-Health-and-Care-Wales/dhcw-vaccine-roadmap).

Content is edited in a
[Google Sheet](https://docs.google.com/spreadsheets/d/1wuk_pK1LpfLKmdbg6WsY_qKeBC5lcN4rlsjqkAxtflw/edit)
shared as **Anyone with the link can view**. A nightly GitHub Action downloads
the tabs and commits a snapshot to
[src/data/roadmaps.json](src/data/roadmaps.json), which is bundled into the
site. Visitors' browsers never contact Google.

- The first tab lists the roadmaps, one per row. The landing page shows them
  all. Other tabs are only read if a row on the first tab names them.
- A product's URL is `/product-roadmaps/<sheet-name-as-slug>/`, for example
  `/product-roadmaps/choose-pharmacy/`. Renaming the tab (and its **Sheet**
  value) changes its URL.
- The build prerenders every page to static HTML with its own title,
  description and Open Graph tags, so the site works without JavaScript and
  link previews show the right roadmap.

## Run locally (Codespaces)

```bash
npm install
npm run sync   # optional: refresh src/data/roadmaps.json from the sheet
npm run dev
```

Open the forwarded port 5173 at `/product-roadmaps/`. The spreadsheet ID is set
in [scripts/sync-roadmaps.ts](scripts/sync-roadmaps.ts); override it with the
`SHEET_ID` environment variable to test another sheet.

Other scripts: `npm run build`, `npm run lint`, `npm run format`, `npm test`.
Run `npm run check` (types, lint, formatting and tests) before opening a pull
request; CI runs the same checks. Node 24 is required (see `.nvmrc`). See
[CONTRIBUTING.md](CONTRIBUTING.md) for how to propose changes.

CI also runs two slower checks against a build of the example data in
[e2e/fixtures/roadmaps.json](e2e/fixtures/roadmaps.json), so sheet edits can't
break them:

- `npm run test:e2e`: Playwright end-to-end, accessibility (axe, including
  colour contrast) and ARIA snapshot tests on desktop and mobile. Run
  `npx playwright install chromium` once first.
- `npm run lighthouse`: Lighthouse CI with score thresholds and size budgets
  in [lighthouserc.json](lighthouserc.json). Locally, point `CHROME_PATH` at a
  Chrome or Chromium binary.

`npm run build` runs `vite build`, then [scripts/prerender.ts](scripts/prerender.ts)
writes `index.html` for the landing page and each product, `404.html` and
`sitemap.xml`. Set `SITE_URL` to change the address used in canonical and Open
Graph URLs.

## Sheet format

Row 1 of every tab is the header; column names are matched ignoring case and
spaces, and extra columns (such as `Notes`) are ignored. Tabs not named on the
first tab are never read, but the whole spreadsheet is visible to anyone with
the link. [sheets/](sheets/) has example CSVs (fake data, not used by the site)
for bootstrapping a spreadsheet.

**First tab (`Roadmaps`)**: one row per roadmap.

| Column                | Use                                                              |
| --------------------- | ---------------------------------------------------------------- |
| `Sheet`               | Name of the tab holding this roadmap's cards. Required.          |
| `Title`               | Page heading and landing page card name.                         |
| `Status label`        | Badge next to the title, for example `Beta`.                     |
| `Last updated`        | `YYYY-MM-DD` or `DD/MM/YYYY`.                                    |
| `Colour`              | Hex highlight colour, for example `#325083`.                     |
| `Vision`              | "Our vision" section. Leave blank to hide.                       |
| `Service description` | "Our value" section and landing page summary. Blank hides it.    |

**Roadmap tabs**: one row per card.

| Column            | Use                                                                                         |
| ----------------- | ------------------------------------------------------------------------------------------- |
| `Title`           | Card heading. Required.                                                                     |
| `Description`     | What the work is.                                                                           |
| `Outcome`         | What changes when it is done. Optional.                                                     |
| `Status`          | `Exploring`, `In progress`, `Shipped`, `Awaiting deployment`, or free text.                 |
| `Phase`           | Tag; "Discovery" is highlighted.                                                            |
| `Labels`          | Comma separated; each becomes a pill.                                                       |
| `Horizon`         | `Now`, `Next`, `Later`, `Recently delivered`, `Delivered this year` or `Not doing`. Required. |
| `Details`         | Expandable "What this covers" list. One bullet per line; start a line with `-` to nest it.  |

Cards appear in sheet order within their horizon or section. Text shared by
every roadmap (intro, Now/Next/Later definitions, section headings) is in
[src/lib/content.ts](src/lib/content.ts); interface text (headings, links and
accessible names) is in [src/lib/strings.ts](src/lib/strings.ts).

To add a product, add a tab with the roadmap columns and a row for it on the
first tab. Sheet mistakes (unknown horizons, rows with no title, missing
optional columns) show as warnings on the sync workflow run. A `Sheet` value
with no matching tab, or a tab missing a required column (`Sheet` on the first
tab; `Title` or `Horizon` on a roadmap tab), fails the sync, so the last
snapshot stays live.

Keep text columns as plain text: the export guesses each column's type, and a
lone number in a text column can come through blank.

## Sync and deploy

- [.github/workflows/sync-roadmaps.yml](.github/workflows/sync-roadmaps.yml)
  runs nightly at 02:00 UTC (or on demand via **Actions → Sync roadmaps → Run
  workflow**). A read-only job fetches the sheet, checks the snapshot against
  [scripts/roadmap-schema.ts](scripts/roadmap-schema.ts), runs the tests and
  checks the site builds. A second job, which runs no npm code, commits the
  snapshot if it changed and triggers a deploy. If the fetch fails, finds no
  roadmaps or fails a check, the last snapshot stays live.
- [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds and
  deploys to GitHub Pages on every push to `main`. In the repo settings, set
  **Pages → Build and deployment → Source** to **GitHub Actions**.

The sync commits straight to `main`, so branch protection must allow
`github-actions[bot]` to push. GitHub pauses scheduled workflows after 60 days
without repository activity; re-enable it from the Actions tab if that happens.

The sheet must be shared as "Anyone with the link can view"; "Publish to web"
is no longer used.

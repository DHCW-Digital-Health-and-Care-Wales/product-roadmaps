# product-roadmaps
Experiment for hosting public product roadmaps (Alpha)

A bilingual (English / Cymraeg) GitHub Pages site that publishes DHCW product
roadmaps. Look, feel and content model come from
[dhcw-vaccine-roadmap](https://github.com/DHCW-Digital-Health-and-Care-Wales/dhcw-vaccine-roadmap).

Content is edited in a
[Google Sheet](https://docs.google.com/spreadsheets/d/1wuk_pK1LpfLKmdbg6WsY_qKeBC5lcN4rlsjqkAxtflw/edit)
and published with **File → Share → Publish to web** (CSV, selected tabs).
A nightly GitHub Action downloads the published tabs and commits a snapshot to
[src/data/roadmaps.json](src/data/roadmaps.json), which is bundled into the
site. Visitors' browsers never contact Google.

- Each published tab is one product roadmap. The landing page lists them all.
- `Template` and any tab whose name starts with `_` are skipped, even if
  published. Only published tabs are visible to the sync.
- A product's URL is `?product=<tab-name-as-slug>`, for example
  `?product=choose-pharmacy`. Renaming a tab changes its URL.

## Run locally (Codespaces)

```bash
npm install
npm run sync   # optional: refresh src/data/roadmaps.json from the sheet
npm run dev
```

Open the forwarded port 5173 at `/product-roadmaps/`. The publish URL is set in
[scripts/sync-roadmaps.ts](scripts/sync-roadmaps.ts); override it with the
`SHEET_PUBLISHED_URL` environment variable to test another sheet.

Other scripts: `npm run build`, `npm run lint`, `npm run format`.

## Sheet format

Row 1 is the header. Every following row has a **Type**:

| Type        | ID                              | Horizon / Section                  | Uses                                                                     |
| ----------- | ------------------------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| `Setting`   | `title`, `statusLabel`, `lastUpdated`, `intro`, `vision`, `serviceDescription`, `horizonNote` | | Value goes in **Summary**                                                |
| `Horizon`   | `now`, `next`, `later`          |                                    | Optional. Title = label, Summary = definition                            |
| `Category`  | any                             |                                    | Phase = small label, Title = heading, Summary = description, Colour = hex |
| `Section`   | any                             | `before` or `after` the horizons   | Title = heading, Summary = description                                   |
| `Item`      | any                             | `now`, `next` or `later`           | Roadmap card                                                             |
| `Delivered` | any                             | ID of a `Section`                  | Card inside that section                                                 |

Card columns (`Item` and `Delivered`): Status (`exploring`, `in-progress`,
`shipped`, `awaiting-deployment`, or free text), Phase (tag; "Discovery" is
highlighted), Title, Summary, Outcome, Metric (highlighted when it appears in
the summary), Details heading, Details list (one bullet per line; start a line
with `-` to nest it), Services (comma separated) and Category (optional when
there is one category).

Every text column has an **(English)** and **(Welsh)** version. Empty Welsh
falls back to English. The `Notes` column is ignored by the site.

To add a product, duplicate `Template`, rename the tab, edit the rows and add
the tab to the published tabs. Sheet mistakes (unknown row types, horizons or
sections) show as warnings on the sync workflow run.

Dates (`lastUpdated`) can be `YYYY-MM-DD` or `DD/MM/YYYY`.

## Sync and deploy

- [.github/workflows/sync-roadmaps.yml](.github/workflows/sync-roadmaps.yml)
  runs nightly at 02:00 UTC (or on demand via **Actions → Sync roadmaps → Run
  workflow**). It fetches the sheet, checks the site builds, and if the
  snapshot changed commits it and triggers a deploy. If the fetch fails or
  finds no roadmaps, the job fails and the last snapshot stays live.
- [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds and
  deploys to GitHub Pages on every push to `main`. In the repo settings, set
  **Pages → Build and deployment → Source** to **GitHub Actions**.

The sync commits straight to `main`, so branch protection must allow
`github-actions[bot]` to push. GitHub pauses scheduled workflows after 60 days
without repository activity; re-enable it from the Actions tab if that happens.

The sheet itself does not need link sharing; only "Publish to web" is required.

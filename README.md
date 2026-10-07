# product-roadmaps
Experiment for hosting public product roadmaps (Alpha)

A bilingual (English / Cymraeg) GitHub Pages site that publishes DHCW product
roadmaps. Look, feel and content model come from
[dhcw-vaccine-roadmap](https://github.com/DHCW-Digital-Health-and-Care-Wales/dhcw-vaccine-roadmap).

Content is **not** stored in this repo. It is read in the browser, on every
page load, from the public
[Google Sheet](https://docs.google.com/spreadsheets/d/1wuk_pK1LpfLKmdbg6WsY_qKeBC5lcN4rlsjqkAxtflw/edit).
The whole workbook is downloaded once as `.xlsx`
(`/export?format=xlsx`), so new tabs appear without a rebuild or API key.

- Each tab is one product roadmap. The landing page lists them all.
- `Template` and any tab whose name starts with `_` are hidden.
- A product's URL is `?product=<tab-name-as-slug>`, for example
  `?product=choose-pharmacy`.

## Run locally (Codespaces)

```bash
npm install
npm run dev
```

Open the forwarded port 5173 at `/product-roadmaps/`. To point at a different
spreadsheet, set `VITE_SHEET_ID` (for example in `.env.local`).

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

To add a product, duplicate `Template`, rename the tab and edit the rows.

## Deploy

[.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds and deploys
to GitHub Pages on every push to `main`. In the repo settings, set
**Pages → Build and deployment → Source** to **GitHub Actions**. Content edits
in the sheet appear without a redeploy.

The sheet must stay shared as "Anyone with the link can view". Once it is
seeded, change it from "editor" to "viewer" access.

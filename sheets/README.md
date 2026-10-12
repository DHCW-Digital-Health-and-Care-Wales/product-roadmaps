# Example sheets

These CSVs contain **fake example data**. The app does not read them: the site
is built only from the live Google Sheet (see the [main README](../README.md)).
They exist to show the sheet format and to bootstrap a new or test spreadsheet
by hand.

| File                             | Tab name   | What it shows                                                                                      |
| -------------------------------- | ---------- | -------------------------------------------------------------------------------------------------- |
| [Roadmaps.csv](Roadmaps.csv)     | `Roadmaps` | The roadmap list (must be the first tab), both date formats, colours, a blank optional column, Welsh for one roadmap |
| [ProductA.csv](ProductA.csv)     | `ProductA` | Every `Horizon` value, phases, labels, nested details, Welsh `(cy)` columns with some blanks |
| [ProductB.csv](ProductB.csv)     | `ProductB` | A smaller roadmap with empty horizons and sections                                                 |

## Importing into Google Sheets

1. Create a spreadsheet (or open a test one).
2. **File → Import → Upload**, choose `Roadmaps.csv`, and pick **Replace
   current sheet** (or **Insert new sheet(s)**). Rename the tab `Roadmaps` and
   make sure it is the first tab.
3. Repeat for `ProductA.csv` and `ProductB.csv` with **Insert new sheet(s)**,
   naming each tab exactly as in the `Sheet` column of `Roadmaps`.
4. **Share → Anyone with the link → Viewer**.
5. Try it locally:
   `SHEET_ID=<id from the spreadsheet URL> npm run sync && npm run dev`.
   This overwrites `.data/roadmaps.json`, which is gitignored.

Optionally add a dropdown (**Data → Data validation**) for the `Horizon`
column. Column meanings are documented in the
[main README](../README.md#sheet-format).

## Converting a Single Record backlog export

`npm run backlog -- [backlog.csv] [--out <dir>] [--snapshot <file>]` converts
a backlog export (default `.data/SRBacklog.csv`) into sheet CSVs in `.data/backlog/`:

- `Roadmaps.csv`: one row per roadmap; add the rows (not the header) to the
  first tab.
- One CSV per roadmap, named after its tab; import each with **Insert new
  sheet(s)**.

Only rows whose `Now, Next, Later` is `Now`, `Next`, `Later` or `Done`
(`Recently delivered`) are used. `PRODUCT DOMAINS` picks the roadmap (title
cased, so `TESTINGS & RESULTS` becomes `Testings & Results`), `Item (REQUIRED)`
is the title, `Description` is converted from HTML to text, and `Product`,
`Healthcare Pathways`, `Strategic Programme` and `Organisation` become labels
(blanks and values containing `N/A` are skipped). Rows with no domain are
skipped with a warning. The script also writes `.data/roadmaps.json` from the
generated CSVs, replacing the synced snapshot until the next `npm run sync`,
so `npm run dev` previews the result.

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

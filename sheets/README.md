# Example sheets

These CSVs contain **fake example data**. The app does not read them: the site
is built only from the live Google Sheet (see the [main README](../README.md)).
They exist to show the sheet format and to bootstrap a new or test spreadsheet
by hand.

| File                             | Tab name   | What it shows                                                                                      |
| -------------------------------- | ---------- | -------------------------------------------------------------------------------------------------- |
| [Roadmaps.csv](Roadmaps.csv)     | `Roadmaps` | The roadmap list (must be the first tab), the `Enabled` column, categories (one blank, so "Other roadmaps"), families, both date formats, colours, a blank optional column, a `Product Lead` for one published roadmap (optional, with no Welsh column), Welsh for one roadmap |
| [ProductA.csv](ProductA.csv)     | `ProductA` | Every `Horizon` value, phases, labels, nested details, organisations, Welsh `(cy)` columns with some blanks |
| [ProductB.csv](ProductB.csv)     | `ProductB` | A smaller roadmap with empty horizons and sections, and cards with no organisations                |
| [ProductC.csv](ProductC.csv)     | `ProductC` | A roadmap that is listed with `Enabled` = `No`, so it is not published                            |

## Importing into Google Sheets

1. Create a spreadsheet (or open a test one).
2. **File → Import → Upload**, choose `Roadmaps.csv`, and pick **Replace
   current sheet** (or **Insert new sheet(s)**). Rename the tab `Roadmaps` and
   make sure it is the first tab.
3. Repeat for `ProductA.csv`, `ProductB.csv` and `ProductC.csv` with **Insert new sheet(s)**,
   naming each tab exactly as in the `Sheet` column of `Roadmaps`.
4. **Share → Anyone with the link → Viewer**.
5. Try it locally:
   `SHEET_ID=<id from the spreadsheet URL> npm run sync && npm run dev`.
   This overwrites `.data/roadmaps.json`, which is gitignored.

Optionally add dropdowns (**Data → Data validation**) for the `Horizon`
column and the `Category` column on `Roadmaps`. Column meanings are documented in the
[main README](../README.md#sheet-format).

The optional `Organisations` column on each roadmap tab, between `Labels` and
`Details`, says who a card's work is for, so readers can filter by organisation. It takes one or more of these
codes, comma separated, for example `CAVUHB, SBUHB`:

| Code       | Organisation                                  |
| ---------- | --------------------------------------------- |
| `National` | All of Wales, such as national systems        |
| `ABUHB`    | Aneurin Bevan University Health Board         |
| `BCUHB`    | Betsi Cadwaladr University Health Board       |
| `CAVUHB`   | Cardiff and Vale University Health Board      |
| `CTMUHB`   | Cwm Taf Morgannwg University Health Board     |
| `HDUHB`    | Hywel Dda University Health Board             |
| `PTHB`     | Powys Teaching Health Board                   |
| `SBUHB`    | Swansea Bay University Health Board           |
| `VUNHST`   | Velindre University NHS Trust                 |
| `WAST`     | Welsh Ambulance Services University NHS Trust |
| `PHW`      | Public Health Wales                           |
| `HEIW`     | Health Education and Improvement Wales        |

Use `National` for work that applies to every organisation, rather than
listing them all. Leave the cell blank if the work isn't for particular
organisations. Any other value is reported as a sheet warning and left out. A
dropdown (**Data → Data validation → Dropdown**, with **Allow multiple
selections**) keeps the codes right. It has no Welsh column.

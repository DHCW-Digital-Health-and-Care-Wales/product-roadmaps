# Contributing

Thanks for helping improve the DHCW product roadmaps site.

## Content or code?

- **Roadmap content** (cards, titles, dates, colours) lives in the Google Sheet.
  Edit the sheet; the nightly sync publishes it. See [README.md](README.md#sheet-format).
- **Feedback on a roadmap**: use the "Give feedback" link on the site, which
  opens a GitHub issue.
- **Code, design, accessibility or interface text**: open a pull request as
  described below.

## Making a change

1. Create a branch from `main`. Use a short descriptive name, for example
   `fix-focus-order`.
2. Make your change. Run `npm run dev` to try it (see
   [README.md](README.md#run-locally-codespaces)).
3. Run `npm run check`. This runs type checks, lint, formatting and tests, the
   same as CI.
4. Open a pull request into `main` and fill in the template. Keep pull requests
   small and focused on one change.
5. A code owner (see [.github/CODEOWNERS](.github/CODEOWNERS)) reviews it. CI
   must pass before merging, and `main` deploys straight to the live site.

## Standards

- **Accessibility**: the site aims for WCAG 2.2 AA. Use semantic HTML, keep
  everything usable with a keyboard, and don't rely on colour alone. Lint
  includes `jsx-a11y` rules, and `src/App.test.tsx` runs axe on every page in
  both languages. Automated checks only find some problems, so check UI
  changes by hand too.
- **Welsh**: every piece of interface text goes in
  [src/lib/strings.ts](src/lib/strings.ts) with English and Welsh, and is
  rendered with `<T value={…} />` (or `tr()` for attributes). A test fails if
  any Welsh is missing. If you can't provide the Welsh, say so in the pull
  request so it can be translated before merging.
- **Tests**: add or update tests for changed behaviour. Parser and data tests
  live next to the code in `scripts/`; component tests in `src/`.
- **Privacy**: don't add cookies, analytics or calls to third-party services.
  Visitors' browsers should only ever load files from this site.
- **Dependencies**: prefer none. Dependabot keeps existing ones up to date.

## Branch protection

`main` should have a ruleset that requires a pull request with one code owner
approval and a passing **CI / check** status. The nightly sync pushes the
snapshot directly to `main`, so it needs a narrow bypass (for example a GitHub
App token used only by the sync workflow) rather than relaxed rules for
everyone.

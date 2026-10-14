# Instructions for AI agents

Read [CONTRIBUTING.md](CONTRIBUTING.md) first. It covers branching, checks, accessibility, Welsh text and privacy.

## Pull requests

- Branch from `main` with a short descriptive name. Never push to `main`.
- Run `npm run check` before opening a PR and report the result.
- Use [.github/pull_request_template.md](.github/pull_request_template.md) for the PR body: keep its headings, delete sections that don't apply, and tick the checklist only for things you actually did. Don't claim manual checks (keyboard, 320px, zoom, screenshots) you didn't do.
- Write the body to a file and check it isn't empty (`wc -l`) before `gh pr create --body-file`.
- Don't commit or push unless asked.

## Content and data

- Roadmap content lives in the Google Sheet, not in the repo. `.data/` is gitignored and made by `npm run sync`; don't commit it.
- Interface text goes in `src/lib/strings.ts` with Welsh, rendered through `<T>`.
- Tests use example data from `sheets/*.csv` and `e2e/fixtures/roadmaps.json`, not the live snapshot.

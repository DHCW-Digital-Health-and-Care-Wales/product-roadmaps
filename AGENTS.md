# Instructions for AI agents

Read [CONTRIBUTING.md](CONTRIBUTING.md) first. It covers branching, checks, accessibility, Welsh text and privacy.

## Pull requests

- Branch from the latest `main` with a short descriptive name, without tracking it: `git fetch origin && git switch --no-track -c <name> origin/main`. Plain `git switch -c <name> origin/main` makes `origin/main` the upstream, so a bare `git push` goes to `main`.
- Never push to `main`, even if the account can bypass the branch rules. Publish with `git push -u origin <name>`, and check `git status -sb` shows `origin/<name>` before any later push. Never suggest `git push origin HEAD:main`.
- Run `npm run check` before opening a PR and report the result. It does not run the e2e tests, which CI runs separately.
- Before opening a PR, run three reviews of the branch: the [code-review](.agents/skills/code-review/SKILL.md) skill twice, once with Claude Opus 5.5 and once with GPT-6.1 Sol, and the [quality-review](.agents/skills/quality-review/SKILL.md) skill once with Claude Sonnet 5.5.
- If you change page structure, links, headings or text, also run `npm run test:e2e`. The ARIA snapshots in `e2e/__snapshots__/` will fail if they're out of date. Regenerate them with `npm run test:e2e -- e2e/structure.spec.ts --update-snapshots=changed`, check the diff shows only your change, and include the updated snapshots in the PR. ARIA snapshots allow extra elements, so `changed` misses newly added ones (for example hint text); if you add elements, use `--update-snapshots=all` and check the diff.
- Use [.github/pull_request_template.md](.github/pull_request_template.md) for the PR body: keep its headings, delete sections that don't apply, and tick the checklist only for things you actually did. Don't claim manual checks (keyboard, 320px, zoom, screenshots) you didn't do.
- Write the body to a file and check it isn't empty (`wc -l`) before `gh pr create --body-file`.
- Don't commit or push unless asked. Commits are GPG-signed; if signing fails, stage the changes and give the user the commit command rather than committing unsigned.

## Content and data

- Roadmap content lives in the Google Sheet, not in the repo. `.data/` is gitignored and made by `npm run sync`; don't commit it.
- Interface text goes in `src/lib/strings.ts` with Welsh, rendered through `<T>`.
- Tests use example data from `sheets/*.csv` and `e2e/fixtures/roadmaps.json`, not the live snapshot.

# AGENTS.md — product-roadmaps

This repository publishes the public site and takes the public's feedback; it holds no
code. The site's code, its build and the spreadsheet format live in the
[roadmaps](https://github.com/DHCW-Digital-Health-and-Care-Wales/roadmaps) repository:
change them there, under its `AGENTS.md`.

- Change only the workflows, `.github/dependabot.yml`, the feedback template,
  `CODEOWNERS` and the README here, through a pull request from a branch.
- Raise a pull request and leave it for the owner. Merge only one the owner has
  authorised; never push to `main`, even though the account can bypass its ruleset, and
  never change rulesets, branch protections or repository settings.
- Keep both workflows checking out `DHCW-Digital-Health-and-Care-Wales/roadmaps` at
  `refs/heads/main` with `persist-credentials: false` under `permissions: contents: read`,
  and run actionlint and zizmor (`--persona auditor`) on any workflow change before its
  pull request.
- Commits are signed; if signing fails, give the user the commit command rather than
  committing unsigned.

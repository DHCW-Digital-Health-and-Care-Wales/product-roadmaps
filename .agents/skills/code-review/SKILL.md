---
name: code-review
description: >-
  Review a diff, branch or PR for correctness: requirements coverage,
  regressions, the sheet sync and build, prerendering, Welsh, accessibility,
  security and privacy. Use for code review and before a PR; maintainability
  and convention smells belong to the companion quality-review skill.
user-invocable: true
---

# Code review

Judge whether the change does the right thing and preserves existing behavior.
`quality-review` owns standards and maintainability under a separate verdict.

Invoke as `/code-review [target] [--comment]`. The target is the current branch
against `origin/main` with staged, unstaged and relevant untracked files (the
default); a PR number; a branch, commit or tag against its merge-base with
`origin/main`; or an explicit base and head. For a PR number or `--comment`,
read `references/pr-target.md`. Otherwise report in the conversation only: do
not post, change code, commit, push, merge or message other people as part of
reviewing.

## Working order

1. **Pin the scope.** Resolve the target to SHAs against the merge-base, with
   working-tree and untracked files when defaulted, which a three-dot diff
   misses. Keep the checkout read-only; read other revisions with
   `git show <sha>:<path>`. A bad ref is a scope error; an empty scope is
   "nothing to review", not a pass.
2. **Find the requirements.** Read the user's instructions and the linked
   issue or PR, following commit and PR references. Read `AGENTS.md`,
   `CONTRIBUTING.md` and each _Repo contract_ below the diff reaches; repo
   rules outrank generic preferences. Without a spec, say what could not be
   verified and continue with regressions and contracts.
3. **Trace behavior.** Open touched files beyond the hunks, their callers,
   hooks, helpers, schema and tests, and follow sheet input through the sync,
   the parsed data, the prerendered HTML and the hydrated page. Read a
   definition before assuming a name, type, CSS class, mock or comment proves
   behavior. Trace quality-review handoffs too.
4. **Apply the lenses** the diff reaches, labelling requirements and regression
   findings separately. A docs-only diff needs no invented risk.
5. **Verify plausible findings** with a concrete trigger and an observed or
   code-derived failure path. Run a focused test (`npx vitest run <file>`,
   `npm run test:e2e -- <spec>`), minimal reproduction or computed-style check
   when useful, outputs and caches under `/tmp`; build offline with
   `ROADMAPS_DATA=e2e/fixtures/roadmaps.json`. Never run a command that changes
   shared state (overwriting `.data/` with `npm run sync`, updating snapshots,
   a push, a merge, a workflow run). Passing tests are evidence, not proof;
   never claim a check you only read.
6. **Filter.** Report defects the change introduces or materially exposes, tied
   to a changed line or affected contract, after ruling out an intentional
   exception. List an unrelated existing defect under _Handed off_. Drop
   hypothetical, preference-only and duplicate findings.

## Requirements

For each relevant requirement, distinguish implemented, partial, missing and
unverifiable; quote it for a mismatch and show the implementation path.

- Trace each scenario through every language, width, page and entry point it
  names to the control the visitor meets: English and Welsh, desktop and
  mobile, landing, roadmap and 404 pages, with and without JavaScript, with
  and without an organisation filter. Where a change replaces a component,
  carried-over behavior may be what the issue changes.
- Look for omitted empty states (a horizon with no cards, a category with no
  roadmaps, a filter that matches nothing), blank or partial Welsh, disabled
  roadmaps and behavior beyond the request. Scope growth is a finding only
  when it creates a concrete risk or contradicts the request.

## Lenses

- **Every path to an invariant.** For each invariant the change relies on or
  alters (a URL, a fallback, a filter, a published field, a warning), enumerate
  every path that reaches it and show each one's handling: each page `pathFor`
  and `scripts/prerender.ts` must agree on, each link that should keep the
  organisation filter, each reader of a renamed field (components,
  `roadmap.json`, fixtures, tests), each test or link naming a removed route.
- **Logic and contracts.** Trace branching, blank and whitespace cells, header
  matching, sheet order, Welsh matched by position, boundaries and runtime
  data shapes against callers. `scripts/roadmap-schema.ts` defines the public
  `roadmap.json`, which is not versioned: a renamed, removed or retyped field
  breaks outside readers. Types prove neither the data nor the sheet; preserve
  intentional warning-versus-failure choices.
- **Sync, build and deploy.** A sheet mistake the README says warns must only
  warn and reach the workflow summary; one it says fails (a missing tab or
  required column, no roadmaps) must fail the sync so the previous site stays
  live. Disabled roadmaps are neither fetched nor published. CI must still
  build from `e2e/fixtures/roadmaps.json` without the sheet, and `.data/` stays
  uncommitted. In workflows, check permissions, pinned action SHAs and that
  only the deploy job, which runs no npm code, can publish.
- **Prerender and hydration agree.** `scripts/prerender.ts` renders every page
  in both languages through `src/entry-server.tsx`; `src/main.tsx` hydrates it.
  The first client render must match the server HTML, so no `window`,
  `localStorage`, `navigator` or clock read may change it. Without JavaScript
  every page still works in English and Welsh; a JS-only control needs
  `useHasJs` or a fallback. Check title, description, canonical, `hreflang`,
  Open Graph, `404.html` and `sitemap.xml` for each new or renamed page.
- **Security and privacy.** Sheet text is untrusted input on a public site:
  trace it into HTML, attributes, URLs (`javascript:` links), inline JSON,
  workflow summaries and logs. No new cookies, analytics or third-party
  requests beyond the Simple Analytics script in `index.html`, and
  `localStorage` holds only the language choice; the privacy note in
  `src/lib/strings.ts` must stay true. New dependencies need a reason.
- **Navigation and lifecycle.** Consider client navigation, back and forward,
  a language switch, a filter change in the URL and unmount. Check effect
  dependencies and cleanup, what a ref keeps when navigation does not remount,
  and that focus and scroll land where `src/lib/focus.ts` intends after a
  route, filter or language change.
- **Time and localisation.** Check `Last updated` in both accepted formats and
  that the build machine's timezone cannot shift a date. Interface text has
  English and Welsh in `src/lib/strings.ts`, rendered through `<T>` or `tr()`;
  sheet text falls back to English when Welsh is blank; `lang` attributes,
  `fill()` placeholders and sorting (`compareText`, `fold`) hold in both
  languages. Failures never render an error object as text.
- **Styling and accessibility.** Verify classes, variants and inline styles
  produce the intended CSS, including Tailwind ordering, cascade, state
  variants and tokens that exist in `src/index.css`'s `@theme`; a visual no-op
  needs computed-style or visual evidence. Hold UI to WCAG 2.2 AA: names,
  native structure, heading order, keyboard and focus order, announcements,
  contrast, colour not used alone, and no clipping or sideways scrolling at
  320px wide and 400% zoom.
- **Evidence covers less than its claim.** Where code or a test infers a fact
  from indirect evidence (example data rather than the live sheet, an ARIA
  snapshot that allows extra elements, axe finding only some problems, a
  dev-server check of a prerendered page, a "tests still pass" claim), name a
  realistic input that makes it lie, and check the code reads the effect
  itself or reports the result as unknown.
- **Tests.** Tests exercise the failure path through real parsing, routing and
  rendering and fail before a behavioral fix. They use `sheets/*.csv` and
  `e2e/fixtures/roadmaps.json`, never `.data/`. Updated snapshots in
  `e2e/__snapshots__/` and `scripts/__snapshots__/` show only the intended
  change. Report tool diagnostics only if they mask a defect.

## Repo contracts

Read each where the diff reaches it; this skill does not restate them.

- `AGENTS.md` and `CONTRIBUTING.md` _Standards_: accessibility, Welsh, tests,
  privacy and dependencies.
- `README.md`: _Sheet format_ for columns, horizons, categories, organisations,
  Welsh columns and which mistakes warn or fail; _Analytics_ and _Sync and
  deploy_ for the one third-party script and the pipeline.
- `scripts/roadmap-schema.ts` for the parsed and published data;
  `scripts/parse-roadmap.ts` for warnings and failures.
- `src/lib/router.ts` for URLs, the organisation filter and client navigation;
  `src/lib/i18n.ts` and `src/lib/strings.ts` for language choice and interface
  text; `src/lib/content.ts` for text shared by every roadmap.

## Findings and grading

Give each finding every field of the report format below. State any
uncertainty; never present an unverified theory as an observed failure.

| Priority | Meaning                                                                      |
| -------- | ---------------------------------------------------------------------------- |
| P0       | Immediate broadly applicable security, privacy, outage or failed-deploy defect |
| P1       | Serious reachable failure that should block this change                      |
| P2       | Concrete correctness defect with limited reach or an ordinary trigger        |
| P3       | Minor but reproducible correctness issue                                     |

Choose priority from impact and reach, not from how strongly a rule is worded.
No quota: return no findings when no actionable defect is established.

## Report format

```text
Code review — <target>
Scope: <base/head SHAs, working-tree scope, diff command>
Requirements: <sources, coverage and unavailable requirements>
Verdict: <correctness assessment and any verification limits>

Requirements findings
- [P#] <title> — path:line
  Requirement: <quote/source>
  Trigger → failure: <concrete path and impact>
  Evidence: <code trace or actual check>
  Fix/test: <smallest useful correction and regression case; in a hand-written
  parser or scanner, first whether a structured tool (a type, the zod schema,
  an existing lint rule) covering the same cases replaces it>

Regression findings
- <same evidence format, or None>

Verification: <checks actually run/read; relevant checks unavailable>
Handed off: <quality concerns or unrelated existing defects; or None>
```

When re-reviewing, state whether each earlier finding is fixed, still open or
unsupported, then review the changed scope.

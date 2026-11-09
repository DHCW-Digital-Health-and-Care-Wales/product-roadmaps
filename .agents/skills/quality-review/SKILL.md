---
name: quality-review
description: Review a diff, branch or PR for code quality, not correctness — structure, naming, readability, duplication, maintainability and conformance to this repository's AGENTS.md and CONTRIBUTING.md. Use for a "quality review", "clean code review" or "maintainability review", and before raising a PR. Not for bugs — that is /code-review.
user-invocable: true
---

# Quality Review

Judge how the change is **built**, not whether it **works**: will the next
person understand it, extend it safely and find it where they expect?

Invoke as `/quality-review [target] [--comment]`.

| Target     | Meaning                                                         |
| ---------- | --------------------------------------------------------------- |
| _(none)_   | Current branch against `origin/main` (committed + working tree) |
| `<number>` | That pull request, scoped from git as in `code-review`          |
| `<branch>` | That branch against `origin/main`                               |
| `<path>`   | Those files or directories as they stand                        |

For a PR number or `--comment`, read
`.agents/skills/code-review/references/pr-target.md`. Without `--comment`,
report in the conversation only.

## Out of scope

- **Bugs, races, security holes.** List one noticed in passing under "Handed
  off"; never let it displace a quality finding.
- **Anything a tool enforces** (TypeScript, ESLint with its `jsx-a11y`, React
  and hooks rules, Prettier, the Welsh completeness test in
  `src/lib/strings.test.ts`, axe in `src/App.test.tsx` and `e2e/`). Flag only
  what the tool cannot see.
- **Taste with no cost.** If you cannot say what it makes easier, cheaper or
  safer for the next reader, drop it.

## Working order

1. **Diff and rules.** Pin the scope as `code-review`'s _Pin the scope_ step
   does, on the same snapshot. Read `AGENTS.md`, `CONTRIBUTING.md` and the
   README sections the change touches; cite the rule by file and line, never
   from memory. Repo rules outrank generic advice.
2. **Context.** Open the issue or PR the change implements and each touched
   file beyond the hunk, and see how neighbours do the same thing before
   calling anything inconsistent.
3. **Look for** what a linter cannot:
   - **Wrong place.** Sheet parsing or validation outside `scripts/`;
     interface text outside `src/lib/strings.ts`, or text shared by every
     roadmap outside `src/lib/content.ts`; roadmap content hard-coded that
     belongs in the sheet; URL building outside `src/lib/router.ts`; a
     component doing a helper's job. `src/lib/text.ts` is shared with the sync
     and must not import anything.
   - **Wrong-direction dependency.** `scripts/` reaching into components, or a
     helper importing the component that uses it: fix the direction, do not
     work around it.
   - **Names that understate.** A flag or prop whose name covers less than its
     effect; a `get*` or `use*` that writes to the URL, storage or focus; a
     generic `parse`/`load`/`update` with a hidden warning, navigation or
     throw. Fix: rename, or split it.
   - **Scattered safety.** A rule (keep the organisation filter on a link,
     fall back to English, restore focus) hand-placed at many call sites, or an
     invariant written nowhere. Fix: enforce it in one helper, else document it
     where it is owned.
   - **Repeated work.** The same lookup, sort or filter twice on one render or
     sync path; work in render that belongs in the build.
   - **Clumsy shape.** A boolean prop that makes a component do two jobs; one
     construction written out at every call site.
   - **Reimplementation.** A new helper where one exists (`fold`,
     `compareText`, `fill`, `resolve`, `pathFor`, `withOrgFilter`); one concept
     named differently across the sheet, schema and components.
   - **Dead or false text.** No-op assignments, unused props, parameters or
     branches, `eslint-disable` without a reason, comments that went stale,
     including "until #nnn" after #nnn closed. Beyond the diff: the README,
     `CONTRIBUTING.md`, `AGENTS.md`, the PR template, workflows, scripts and
     config that a changed command, column, URL or default now makes false;
     grep for the old form.
   - **Inconsistent failure.** `undefined` from one helper, a throw from its
     sibling; a sheet mistake that throws where its neighbours warn, or the
     reverse; a broad `catch` that swallows.
   - **Tests.** Names that state method rather than behaviour, copied setup,
     mocks of the module under test, live `.data/` instead of `sheets/*.csv`
     or `e2e/fixtures/roadmaps.json`.
   - **Meta code.** A test or check that would fail on a semantically
     identical rewrite of what it checks (an ARIA snapshot pinned to incidental
     wording, a test asserting class names rather than behaviour); a growing
     exception list; a new gate with no stated reason. Fix: assert the
     invariant, pay the list off at its source, record the reason.
   - **Rulebook growth.** A line added to `AGENTS.md`, `CONTRIBUTING.md` or a
     `SKILL.md` must be a rule that recurs, replace or sharpen an existing
     line, or its commit or PR body says why the file grows. Flag incident
     narrative and one-off detail.
   - **Change shape.** Scope the issue does not reflect; a mechanical rename
     mixed into logic; unrelated refactors; a PR that is not small and focused
     on one change, as `CONTRIBUTING.md` asks.
   - **Layout.** A file in the wrong folder or grown past a natural split; a
     test not beside its code (`scripts/`, `src/`) or journey not in `e2e/`;
     new fields prepended rather than placed beside related ones.
   - **Design-system drift.** Colours, spacing, typography and component
     choices, in class strings and helpers as well as JSX, checked against the
     tokens in `src/index.css`'s `@theme` and existing components in
     `src/components/`. A raw hex or one-off size where a token exists; a
     near-copy of an existing component. Verify a suggested token or component
     exists before recommending it; demand no speculative abstraction.
   - **New dependencies.** `CONTRIBUTING.md` prefers none; flag one the
     platform or an existing helper covers.
4. **Filter.** Keep a finding only with file and line, the cost of leaving it
   and a concrete fix. Merge duplicates into one listing every site.
5. **Report**; with `--comment`, post.

## Grading

| Grade         | Meaning                                                           |
| ------------- | ----------------------------------------------------------------- |
| 🔴 **Fix**    | Breaks a written rule, or will predictably derail the next change |
| 🟡 **Should** | Real maintenance cost (misleading, duplicated, hard to read)      |
| 💭 **Nit**    | Small and local; fix when the file is next touched                |

A finding citing an `AGENTS.md` or `CONTRIBUTING.md` rule is 🔴 unless the rule
allows the exception. Never grade up to look thorough: three accurate findings
beat twelve padded ones.

## Report format

```
## Quality review — <target>

**Verdict:** <one or two sentences: overall shape, and whether anything must change before merge>

**Read:** <the issue or PR, repo guides and neighbouring files opened beyond the diff, or what was unavailable>

### What's done well
- <specific patterns worth repeating>

### Findings
1. 🔴 **<short title>** — `path/to/file.tsx:123`
   <what is wrong, and the cost of leaving it>
   **Fix:** <the concrete change>

### Handed off
- <correctness concern for /code-review, or "None">
```

A handed-off concern is not a correctness review or a resolved finding; keep
`code-review`'s findings out of this verdict.

Order 🔴 → 🟡 → 💭. When re-reviewing, open with a table of earlier findings and
status (✅ fixed / ⚠️ partly / ❌ open) before any new ones.

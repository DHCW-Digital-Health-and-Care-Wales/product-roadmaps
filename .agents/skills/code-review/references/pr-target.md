# Reviewing a pull request

Read this when a user invokes `code-review` or `quality-review` on a PR number,
or with `--comment`.

## Scope a PR from git

Fetch its head with `git fetch origin pull/<n>/head`, which works for forks and
leaves the working tree untouched, and record `git rev-parse FETCH_HEAD` as the
head. Fetch the base SHA too if it is missing, then diff `<base-sha>...<head-sha>`
locally. Read the base SHA, title, body and links from the PR's metadata
(`gh pr view <n> --json baseRefOid,title,body,url`), and its changed files and
diff from git, not the API. Treat the body's _What and why_ and linked issue as
requirements, and its _Verification_ and checklist as claims to check, not
evidence.

## Post with `--comment`

Post one `COMMENT` review, never `APPROVE` or `REQUEST_CHANGES`: a code owner
approves (see `.github/CODEOWNERS`). Create it pending, add each finding as an
inline comment at its location where supported, then submit it with the
verdict as its body. Write the body to a file and check it isn't empty before
posting.

- `code-review`: each inline comment carries the finding's priority, trigger,
  failure and fix; the body carries the verdict, requirements coverage and
  verification limits.
- `quality-review`: each inline comment carries the grade emoji, title, cost
  and fix; the body carries the verdict, read list, strengths and handed-off
  list.

End every body with the attribution footer the session requires.

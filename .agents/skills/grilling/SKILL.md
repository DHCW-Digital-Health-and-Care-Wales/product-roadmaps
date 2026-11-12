---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
user-invocable: true
---

# Grilling

Interview the user relentlessly until you reach a shared understanding. Map this
as a **design tree**: every decision branches into the decisions that hang off
it.

Work the tree in **rounds**. The **frontier** is every decision whose
prerequisites are already settled: the questions you can ask _now_ without
guessing at answers you haven't heard yet. Ask the whole frontier in one round,
then wait for the user's answers before the next round.

Ask each round with your structured question tool (Claude: `AskUserQuestion`;
Copilot: `ask_user`), not as chat text. Put each frontier question in its own
entry (`questions` in `AskUserQuestion`), with a short header and 2–4 options;
for an open-ended question, offer the main candidate answers and let the tool's
automatic "Other" entry take the rest. Make your recommended answer the first
option and end its label with "(Recommended)", so picking the first option
accepts it. Put the trade-off in each option's description. `AskUserQuestion`
takes at most 4 questions per call, so send a larger frontier as consecutive
calls in the same round. If no such tool is available, fall back to numbered
chat questions, each with your recommended answer, worded so "yes" accepts it.

When the answer changes what a user sees or does, include a short example
scenario in the question that shows the impact: who does what, and what they now
see.

Each round the user answers reshapes the tree: settled decisions push the
frontier outward and unblock questions that depended on them. Recompute the
frontier and ask the next round. A question whose answer depends on another
question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a
fact from the environment (the codebase, the sheet schema, the tools), dispatch
a sub-agent to find it (Claude: the `Explore` agent; Copilot: the `explore`
agent; Codex: a fresh read-only `explorer` agent); without delegation, look
yourself. Don't ask the user for anything you
could look up yourself. Don't block on it: a running exploration is an unsettled
prerequisite, so only the questions downstream of it wait for the sub-agent to
report; ask the rest of the frontier now. The _decisions_ are the user's: put
each to them and wait.

The session is done when the frontier is empty: every branch of the design tree
visited, nothing left silently assumed. Do not act on the plan until the user
confirms you have reached a shared understanding.

## Impact on existing behaviour

When the plan adds a state, rule or field to something that exists, put this on
the first frontier: list every page, component, route, prerendered output and
sheet column that touches the same data (search for the type, the field name and
the `src/lib/strings.ts` keys), and ask what the new rule means for each. A path
the plan does not mention is a question, not an assumption: refuse, warn, carry
on or change it. Cover the Welsh text, how the sheet sync (`npm run sync`) reads
the data, and the example data in `sheets/*.csv` and `e2e/fixtures/roadmaps.json`.
The session is not done until every such path has an answer.

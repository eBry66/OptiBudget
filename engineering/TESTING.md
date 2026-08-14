# Testing

Part A of the coverage contract described in `engineering/CHECK_MAP.md`
(Part B, DOC-020). This document defines two distinct test classes for
OptiBudget and states, for each, a literal, machine-matchable rule for how
a test declares what it proves. It does not choose a test framework or
runner — that is `engineering/ARCHITECTURE.md`'s decision (DOC-015) — but
assumes a Node/TypeScript toolchain, fixed by `scripts/next.mjs` and the
repository's own tooling.

Per `engineering/ARCHITECTURE.md`: these are not isolated unit tests
against mocked dependencies. Every AC-coverage test exercises the actual
Next.js Server Action and RLS-scoped query the screen calls, run against
real Postgres (`optibudget-staging` in CI, a local Supabase instance in
development) — proving the real authorization boundary, not a stand-in for
it. The CI job that runs them is still named `unit` (`orchestration/HITL_GUIDE.md`
§4.12's fixed name), but that name describes the check's position in CI,
not the nature of what it tests.

## Class 1 — AC-coverage tests

Every test file name: `tests/<area>/AC-0NN.<slug>.test.ts`

- `<area>` is the requirement group's folder — `accounts`, `import`,
  `transactions`, `transfers`, `categories`, `reports` — matching the
  section headings in `product/SCOPE.md`.
- `AC-0NN` is the acceptance criterion id from `product/ACCEPTANCE.md` this
  test proves, exactly as written there.
- `<slug>` is a short, lowercase, hyphenated description of what the test
  checks. Not required to be unique alone, only in combination with the AC
  id.

Every test title must begin with: `[AC-0NN]`

A single test file may cover more than one acceptance criterion where the
criteria describe the same operation from different angles. Name it after
whichever AC id is primary; state the others in the test's own comments.

## Class 2 — Integration-flow tests

Every test file name: `tests/integration/<flow-name>.test.ts`

An integration test proves a behaviour that crosses the module boundaries
`engineering/ARCHITECTURE.md` defines — for example, an imported movement
correctly propagating through categorisation into the reducibility view.
It is not a substitute for AC-coverage tests and is not counted toward
`claims_acs` coverage accounting (below).

A flow's test file states, in a leading comment, every AC id the flow
exercises. Whether integration tests should additionally carry REQ-level
traceability is an open design question, deliberately not settled in this
revision — raise it explicitly in Codex review rather than assuming either
answer.

A task's brief states explicitly whether it requires a new or updated
integration test. Absence of that statement is a brief defect, not an
exemption — same discipline as `claims_acs` below.

## Coverage

Coverage is task-scoped, not release-wide, and applies to Class 1
(AC-coverage tests) only. Each task YAML declares the acceptance criteria
it implements in a `claims_acs` field — a list of AC ids, or
`claims_acs: []` for a task that implements none (infrastructure, tooling,
governance-document work).

A pull request fails if any AC id listed in its task's `claims_acs` has no
matching AC-coverage test file. An AC id not claimed by the current task is
not checked by this PR's `unit` job, regardless of whether it has a test
elsewhere.

`claims_acs: []` is not the same as an empty or missing field — a task
YAML must state one or the other explicitly. A missing field is a task
YAML defect, not an exemption, and `validate-task.mjs` must reject it.

Every AC id claimed by a task, without exception, needs at least one
AC-coverage test file naming it directly — there is no "covered
indirectly" exemption.

## Release-wide coverage

Task-scoped coverage does not, by itself, guarantee that a release's full
AC set (per `product/SCOPE.md`) is covered before that release ships.
`scripts/check-release-coverage.mjs` reports this — for each release,
how many of its AC ids have a matching AC-coverage test file — as a
non-blocking, informational CI status. It is not in `required_checks`
in this revision. Promoting it to required, once a release is genuinely
close to complete, is a separate, explicit `project.state.yaml` edit —
not automatic, and not assumed by this document.

## What green does not mean

A passing `unit` job proves the AC ids claimed by the current task are
satisfied, per their AC-coverage tests. It says nothing about AC ids not
claimed by this task, and nothing about integration-level correctness
beyond what an integration test explicitly checks (`HITL_GUIDE.md` §15.7).
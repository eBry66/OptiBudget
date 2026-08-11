# Testing

Part A of the coverage contract described in `engineering/CHECK_MAP.md`
(Part B, DOC-020). This document states, as a literal, machine-matchable
rule, how a test declares which acceptance criterion it covers. It does not
choose a test framework or runner — that is `engineering/ARCHITECTURE.md`'s
decision (DOC-015) — but it assumes a Node/TypeScript toolchain, since that
much is already fixed by `scripts/next.mjs` and the repository's own
tooling, independent of whatever frontend framework DOC-015 picks. If
DOC-015 chooses a stack where that assumption doesn't hold, this document
needs revision before `scripts/check-coverage.mjs` can be built against it.

## The naming contract

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

## Coverage

A pull request fails if any AC id in `product/ACCEPTANCE.md` has no
matching test file. This is `scripts/check-coverage.mjs`'s job (task-001,
section 10), and it has no specification to run against without the exact
string format above.

A single test file may cover more than one acceptance criterion where the
criteria describe the same operation from different angles. Name it after
whichever AC id is primary; state the others in the test's own comments.
Every AC id, without exception, needs at least one test file naming it
directly — there is no "covered indirectly" exemption.

## What green does not mean

A passing test suite proves the AC ids that have tests are satisfied. It
says nothing about AC ids that have none — that gap is what
`check-coverage.mjs` exists to catch, not something a green CI run implies
on its own (HITL_GUIDE section 15.7).
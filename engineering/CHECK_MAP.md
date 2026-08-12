# Check map

Part B of the coverage contract. `engineering/TESTING.md` (Part A, DOC-017)
states how a test declares which acceptance criterion it covers. This
document states which npm script or scripts each named CI check actually
runs. Written after `package.json` exists (DOC-018, approved), because a
mapping to a script that isn't there yet would be a promise, not a fact.

The three check names below are not this document's invention.
`orchestration/HITL_GUIDE.md` §4.12 states the `required_checks` list
`project.state.yaml` (DOC-024) will carry once it exists: `validate-state`,
`validate-task`, `unit`. DOC-024 depends on this document, not the other
way round, so this table is written against that named list directly
rather than waiting on a document that cannot be approved until this one
is. The three-column table itself, and everything below it, is this
document's own structure, not something the guide prescribes.

## Check to script

| Required check | npm script(s) | Status |
|---|---|---|
| `unit` | `npm run test` (`vitest run`) | Partial. This runs and reports on every test file Vitest discovers. Files following `engineering/TESTING.md`'s naming convention fall within Vitest's discovery pattern, but Vitest does not enforce that convention — it has no way to notice an acceptance criterion with *no* test file, and no way to check that a test's title actually carries the required `[AC-0NN]` prefix. Closing that gap is `scripts/check-coverage.mjs`'s job — a task-001 deliverable (`orchestration/HITL_GUIDE.md` §10, step 3) — and `unit` cannot be considered a complete mapping until it also invokes that script. |
| `validate-state` | Not yet defined. | `scripts/validate-state.mjs` and its `package.json` wrapper are task-001 deliverables, not gate 0 ones. No script exists in `package.json` to name here, and none is added now: `AGENTS.md`'s gate 0 rule is explicit that agents "do not create folders, scaffolding, dependencies, or code" during this phase, and the same discipline applies to this document — a wrapper pointing at a file that doesn't exist yet is scaffolding, not a mapping. |
| `validate-task` | Not yet defined. | Same as `validate-state` above: `scripts/validate-task.mjs` is a task-001 deliverable. No script exists yet to map it to. |

## What "not yet defined" means, and what it doesn't

This is not this document failing at its own purpose. `orchestration/HITL_GUIDE.md`'s own sequence, stated across §4.12 and §10, is two-phase by
design: gate 0 declares which checks will exist and what they're named;
task-001 is where their implementations are created and this table's
remaining mappings are completed. `project.state.yaml`'s `required_checks`
list can correctly carry all three names now — the list states what must
eventually pass, not that each already can. A required check may
legitimately have no way to run yet without its identity being ambiguous;
those are different properties; this table keeps them separate rather
than treating an unfinished implementation as an unfinished name.

## What this document does not do

- It does not invent `validate-state.mjs` or `validate-task.mjs`'s
  behaviour, and it does not add npm script entries pointing at either
  file before task-001 creates them. What each validator checks is
  task-001's specification to write — derived from governance invariants
  this project has already approved (`orchestration/PROJECT_RULES.md`,
  `AGENTS.md`'s hard rules), not invented fresh at implementation time —
  and task-001's own task definition is where that derivation gets made
  explicit, not this document.
- It does not choose the CI workflow file's structure. `.github/workflows/ci.yml` is task-001's deliverable; this document only states which script each of its named checks should invoke once one exists.
- It does not add a fourth row for anything beyond the three names `orchestration/HITL_GUIDE.md` §4.12 already states.

## Revision trigger

This document must be revised and re-approved once task-001 delivers
`scripts/check-coverage.mjs`, `scripts/validate-state.mjs`, and
`scripts/validate-task.mjs`: the two undefined rows receive their actual
npm mappings, and the `unit` mapping is completed by including the
coverage check alongside the test runner. Record this revision trigger
explicitly in the current approval note.
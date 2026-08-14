# Check map

Part B of the coverage contract. `engineering/TESTING.md` (Part A, DOC-017)
states how a test declares which acceptance criterion it covers. This
document states which npm script or scripts each named CI check actually
runs.

The three check names below are not this document's invention.
`orchestration/HITL_GUIDE.md` §4.12 states the `required_checks` list
`project.state.yaml` (DOC-024) carries: `validate-state`, `validate-task`,
`unit`.

## Check to script

| Required check  | Command                                    | Status |
|------------------|---------------------------------------------|--------|
| `unit`           | `npm test` (`vitest run`) then `node scripts/check-coverage.mjs` | Complete. Both run via `.github/workflows/ci.yml`'s `unit` job. |
| `validate-state` | `node scripts/validate-state.mjs`          | Complete. Runs directly in CI, not via an npm script — none is defined in `package.json` for it, and none is needed. |
| `validate-task`  | `node scripts/validate-task.mjs`           | Complete. Same as `validate-state` — direct `node` invocation in CI. |

## Revision history

This document's original text described all three rows as "not yet
defined," pending task-001's delivery of `scripts/check-coverage.mjs`,
`scripts/validate-state.mjs`, and `scripts/validate-task.mjs`, with an
explicit revision trigger for when that happened. Task-001 delivered all
three; task-002 extended `validate-state.mjs`/`validate-task.mjs` for
resting-state handling. This revision fulfils that trigger — corrected
2026-08-14, discovered stale during cross-vendor review of the
`PROJECT_RULES.md` Tier-1 revision (see `product/DECISIONS.md`, same
date).

## What this document does not do

- It does not choose the CI workflow file's structure — `.github/workflows/ci.yml`
  is owned by whichever task last modified it, currently task-001.
- It does not add a fourth row for anything beyond the three names
  `orchestration/HITL_GUIDE.md` §4.12 states.
- It does not define what `validate-state.mjs` or `validate-task.mjs`
  check internally — that is each script's own implementation, reviewed
  when it was built.
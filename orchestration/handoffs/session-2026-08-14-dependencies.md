# Handoff — engineering/DEPENDENCIES.md drafted

No DOC-id or task-id applies to this file (see `product/DECISIONS.md`,
2026-08-14, "Dependency tracking: two-phase approach" — explicitly excluded
from `bootstrap.yaml`/`approvals.yaml` this revision). Using this session's
subject as the filename slug in place of a doc/task id.

## What was done

Drafted `engineering/DEPENDENCIES.md` per the brief in `product/
DECISIONS.md` (2026-08-14 entry) and `orchestration/PROJECT_RULES.md`'s
dependency constraint. Not committed — sitting on disk only, per the "write
only, never commit unasked" rule.

Backfilled entries for the 6 existing runtime dependencies already in
`package.json` (added under DOC-018, approved 2026-08-12, before this
tracking file existed): `next`, `react`, `react-dom`,
`@supabase/supabase-js`, `@supabase/ssr`, `lucide-react`. HITL chose this
over starting the log empty. Ran `npm audit` live (2026-08-14) for the
`checked_at`/`result` fields rather than fabricate a check that wasn't
actually performed at add-time; `date` (2026-08-12) and `checked_at`
(2026-08-14) intentionally differ as a result.

## Assumptions

- Version recorded in each heading is the exact version string as pinned
  in `package.json`'s dependency range (e.g. `16.3.0` for `^16.3.0`), not
  necessarily the exact resolved version in the lockfile at any later
  point in time.
- `devDependencies` (`typescript`, `vitest`, `tailwindcss`,
  `@tailwindcss/postcss`, `@types/*`) are out of scope for this log —
  read PROJECT_RULES.md's "runtime dependency" wording as excluding
  build/test-time tooling. Not confirmed with HITL beyond this session's
  structural sign-off; flag if that reading is wrong.
- `npm audit`'s result (0 vulnerabilities) reflects the whole resolved
  dependency tree (173 packages, prod+dev+optional+peer) at the time it
  ran, not an isolated per-package check. Recorded as-is against each of
  the 6 entries since `npm audit` doesn't produce a narrower per-package
  result.

## Open questions

- Should future entries (dependencies added by upcoming tasks) record
  `added by` as the implementing vendor name (e.g. "Claude Code") or a
  task id? This draft used vendor name for the backfilled entries since
  no task id exists for their original addition.
- Not decided here, deferred to v2 per the DECISIONS.md entry: whether
  this file ever graduates to DOC-id treatment.

## Blockers

None. File is drafted and ready for HITL review/commit.

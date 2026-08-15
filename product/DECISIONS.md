# Decisions

Append-only. One entry per decision, newest last. Never rewrite or delete an
entry. If a decision is reversed, add a new entry saying so and why; the
original stays.

Each entry records the date, what was decided, why, and what it rules out.

---

## 2026-08-06 — The OptiBudget repository is public

**Decided:** the GitHub repository is public rather than private.

**Why:** branch protection on a private repository requires a paid GitHub plan.
On the free plan it is available only on public repositories. Branch protection
is load-bearing in this project's review process, and privacy is not.

**Rules out:** relying on the repository being unreadable as any part of the
application's security. Secrets live in `.env`, which is excluded from version
control, and access control lives in database policies. If a real secret ever
reaches a commit it must be rotated at the provider immediately, because a
public commit may be copied within minutes.

---

## 2026-08-06 — Prototype code is never merged into OptiBudget

**Decided:** code written to explore an idea is thrown away. It is never
adapted, used as a starting point, or cleaned up and kept.

**Why:** nobody rewrites something that already works. A prototype that reaches
the repository quietly becomes the architecture, chosen in an afternoon, by
nobody, and never reviewed.

**Rules out:** treating a prototype as a head start on implementation. What
survives a prototype is written text: requirements, acceptance criteria, and a
screen inventory. Sketches and annotated screenshots are working material and
stay outside the repository, because an image committed to it is read as a
specification to satisfy literally.

---

## 2026-08-06 — Reducibility and provisioning can be changed by the household

**Decided:** OptiBudget supplies a default reducibility and provisioning value
for each leaf category, and the household may change both.

**Why:** whether spending can be avoided depends on circumstances, not on the
kind of spending. A car is renounceable for a household that could live without
one and irreducible for a household that cannot. Property taxes apply only to
owners. A fixed classification would be wrong for most households on at least
one category, and wrong in the direction that matters — it would tell someone a
necessity is optional.

**Rules out:** treating these as constants shipped with the application. Both
are stored per household, which brings category editing into version 1 rather
than deferring it. This is a deliberate increase in the first version's scope.

---

## 2026-08-06 — Working capital fund contributions are recoverable, reserve fund
contributions are not

**Decided:** a fund contribution to a co-ownership's working capital fund is
treated as recoverable by the household. A fund contribution to its reserve fund
is treated as spent.

**Why:** this matches the legal default in Belgium. A member's share of the
working capital fund is repaid when the property is sold. A member's share of
the reserve fund stays with the co-ownership and is not repaid unless the sale
contract says otherwise. Treating reserve contributions as spent understates
what the household is worth rather than overstating it, which is the safer error
for a household deciding whether it can afford mandatory work.

**Rules out:** presenting either fund as money the household holds. Both are
held by the co-ownership; the household holds a claim proportional to its share
of the building. Recovering a reserve fund share on sale is a negotiated
outcome, not something to plan around.

---

## 2026-08-06 — OptiBudget does not advise

**Decided:** OptiBudget shows the household its own money, grouped so that
patterns are visible. It does not recommend what to cut, rank candidates for
reduction, or generate scenarios.

**Why:** advice cannot be verified by hand. There is no way to write an
acceptance criterion for "recommended the right thing to cut", and a financial
recommendation the household cannot evaluate is worse than none. Grouping
spending by reducibility with annual totals is enough for the household to find
what it had stopped noticing, and every part of it is checkable.

**Rules out:** cost-cutting scenarios and simulations in version 1. If they are
added later, the household will need to be able to disagree with a category's
reducibility for its own reasons — which is already possible under the decision
above.

---

## 2026-08-11 — Staff cross-household access stays out of scope; REQ-004 remains absolute

**Decided:** OptiBudget has no role, mechanism, or credential capable of
accessing more than one household's data — including for OptiBudget's own
administration. `REQ-004`'s wording ("no role exists that can see across
households") and `product/PRODUCT.md`'s independent statement of the same
commitment ("access... is granted by membership of that household and by
nothing else") both stand as written, unmodified.

**Why:** a proposal was raised during `DOC-015` review to split this into
two invariants — household-to-household isolation (absolute) and a
separate, audited OptiBudget-staff administration path (controlled access
to a specific household). The distinction is real and not unreasonable for
a product with a support organization. It was not adopted now because: (1)
it is a product-phase decision — it would require reopening `PRODUCT.md`
and `REQUIREMENTS.md`, both approved — not something to fold into an
engineering document mid-review; (2) there is no live operational need —
OptiBudget has one operator, no staff, no support organization touching
household data; (3) the proposed replacement stated intent ("access should
be limited," "actions should be logged") without the concrete mechanism —
scoped, time-bounded, audited access — that current security practice
requires for this pattern to be safe, which would have been a real
regression from the zero-standing-privilege design `engineering/
ARCHITECTURE.md` (DOC-015) adopted instead.

**Rules out:** any `service_role` or equivalent standing credential capable
of reading across households, for any purpose, in the current version.

**Revisit when:** OptiBudget has an actual support or administrative
operation that needs to touch a specific household's data on the
household's behalf — not before. If adopted then, it needs its own REQ id
in `product/REQUIREMENTS.md`, stating explicitly: who can authorize it,
what triggers it, how a household would know, and where the audit record
lives — with the same rigor as every other requirement, not a retrofit.

---

## 2026-08-12 — Renaming a household and removing a member are out of scope for version 1

**Decided:** version 1 ships with no way for a household to rename itself or
remove a member. `engineering/THREAT_MODEL.md` (DOC-016) reflects this
directly: `households` and `household_members` carry no `UPDATE` or `DELETE`
policy, because no `REQ` id in `product/REQUIREMENTS.md` describes either
action.

**Why:** the gap surfaced during `DOC-016` review, not from a deliberate
product decision made earlier. `product/GLOSSARY.md` already notes version 1
ships exactly one member per household in practice, which is why the absence
went unnoticed through `REQUIREMENTS.md`, `SCOPE.md`, and `ACCEPTANCE.md`.
Writing a policy for either action now, without a requirement behind it,
would mean inventing the requirement inside an engineering document, which
`AGENTS.md` forbids.

**Rules out:** treating this as a defect to fix in `engineering/
THREAT_MODEL.md`. The document is correct as drafted; the gap is upstream,
in the product phase, and belongs there when it is addressed.

**Revisit when:** `product/REQUIREMENTS.md` is next opened for the household
management area — expected at the version 2 planning pass for the couple-
with-mortgage user, per `product/PRODUCT.md`. At that point this needs: a
REQ id for renaming a household, a REQ id for removing a member (including
what happens to that member's data and any remaining member's access), and
the corresponding `UPDATE` / `DELETE` policies added to `engineering/THREAT_MODEL.md`.

---

## 2026-08-13 — Task YAMLs and their deliverables are agent-drafted by default; HITL authorship requires explicit retention

**Decided:** `orchestration/tasks/*.yml` and the deliverables they name are,
by default, drafted by the implementing vendor and cross-vendor reviewed,
per `HITL_GUIDE.md` §7 steps 1–5, with `HITL_GUIDE.md` §15 — not §5 or
`approvals.yaml` — governing HITL acceptance of the result. The HITL may
explicitly retain authorship of a specific file; absent that, an agent does
not wait to be told the HITL will write it.

**Why:** `bootstrap.yaml`'s `owner: hitl` / `owner: agent` field exists only
for the 26 DOC ids in the gate-0 document graph. Task YAMLs sit entirely
outside that graph, so no file anywhere stated who authors them.
`HITL_GUIDE.md` §10 listed "write `orchestration/tasks/task-001.yml`" as an
unqualified imperative inside a numbered list of HITL actions, and §7 was
written entirely in terms of DOC ids, never stating it also governs task
work. Both the HITL and Claude Code independently read that silence as
"the HITL writes it" — backwards for a vibe-coding methodology where the
default should be agent-drafts / agent-reviews / HITL-accepts, with HITL
authorship being the stated exception. This stalled `task-001` until
caught and corrected: `AGENTS.md` (DOC-004, commit `553bcac`) gained a
"Task specifics" section stating the default; `HITL_GUIDE.md` (DOC-026,
commits `8faee91` and `bb9e1df`) extended §7 to cover task YAMLs
explicitly (scoped to steps 1–5, not step 6's `next.mjs approve`, which
remains exclusive to `bootstrap.yaml` DOC ids) and reworded §10's
instruction from HITL-authorship to vendor-delegation. Both revisions
were cross-vendor reviewed by Codex before approval; two of Codex's three
initial findings on the `AGENTS.md` change were rejected with textual
evidence (they misapplied gate-1's `allowed_paths` and misread the
gate-0-exit cascade in §10 as a permanent freeze), one was accepted and
fixed (the `HITL_GUIDE.md` citation `AGENTS.md` relied on didn't yet say
what it was cited for).

**Rules out:** any future artifact outside the DOC-id graph being treated
as HITL-authored by default because no file states otherwise. Silence on
ownership is no longer read as "the HITL writes it" — the default is
agent-drafted unless a document says otherwise for that specific file.
Also rules out task YAMLs or their deliverables ever being entered in
`orchestration/approvals.yaml` or approved with `next.mjs approve` — §15's
PR-review and `DECISIONS.md` mechanism is the sole acceptance path for
gate-1 work, kept deliberately separate from the DOC-id approval ledger so
the two records cannot drift out of sync with each other.

**Revisit when:** the template (`§13`) is next extracted or updated for a
second project — this default and the §7/§15 split should be verified as
holding for that project's own task graph before it's assumed to transfer
automatically, since template-sync only propagates machinery, not this
kind of judgment call.

---

## 2026-08-13 — task-001 accepted: gate-1 enforcement machinery (CI, validators, coverage check)

**Decided:** task-001's five deliverables — `scripts/validate-state.mjs`,
`scripts/validate-task.mjs`, `scripts/check-coverage.mjs`,
`.github/workflows/ci.yml`, and their fixture tests — are accepted per
`HITL_GUIDE.md` §15. Merged into `main` via
https://github.com/eBry66/OptiBudget/pull/1.

**Why:** implemented per `orchestration/tasks/task-001.yml`'s spec,
cross-vendor reviewed by Codex across three rounds with every finding
resolved — two real bugs in `check-coverage.mjs`'s naming-contract
matching fixed with fixtures proving the fix, one spec-wording
discrepancy resolved by correcting `task-001.yml` to match what was
built rather than widening scope, two findings on `AGENTS.md`/
`HITL_GUIDE.md` rejected with textual evidence. Zero findings on any
security-sensitive area across every review pass. `validate-task` and
`unit` show red on this PR by design, not defect: the first correctly
flags `task-001.yml` and its own handoff file as outside
`allowed_paths`, the second correctly reports all `ACCEPTANCE.md` AC
ids as uncovered because no application test suite exists yet.

**Rules out:** treating either red CI check on this specific PR as
evidence the validators are broken — they are the validators working.
Future PRs where these checks are genuinely red for an unintended
reason should not be waved through by citing this entry; each red check
needs its own stated reason, not a standing exemption.

**Revisit when:** task-002 begins and needs a validated `unit` job for
the first time against real application code — at that point
`check-coverage.mjs` reporting all-AC-ids-uncovered stops being
expected and starts being a real gate.

---

## 2026-08-13 — project.state.yaml's resting state, and its scope, defined for when no task is active

**Decided:** when no task is active, `project.state.yaml` reads
`active_task: none`, `authorized_branch: main`, `attempt: 0`, and
`allowed_paths: []`. An empty `allowed_paths` is valid only when
`active_task` is `none`; a non-empty list remains required whenever a
task is active, per the existing shape in `HITL_GUIDE.md` §4.12.
`required_checks` is unchanged in either state — `validate-state`,
`validate-task`, and `unit` are CI job names, not task-scoped, and always
run.

**Why:** `project.state.yaml` was designed assuming a task is always
active; nothing in `HITL_GUIDE.md` §4.12 or `scripts/validate-state.mjs`
described what the file should contain between one task closing and the
next starting. This surfaced directly after task-001 merged — its
`active_task: task-001` field remained technically present but stale,
with no defined alternative to set it to.

**Rules out:** leaving a closed task's id sitting in `active_task`
indefinitely as an implicit "resting state." `validate-state.mjs` and
`validate-task.mjs` need code changes to actually accept and correctly
handle this state — permitting an empty `allowed_paths` only under
`active_task: none`, and having `validate-task.mjs` exit cleanly with no
error when there is no task file to check against. Implementing those
changes is task-002.

**Revisit when:** task-002 implements the corresponding code changes —
this entry records the decision; task-002's own acceptance record in this
file, once merged, is the confirmation it was built correctly.

---

## 2026-08-14 — task-002 (resting-state validators) merged, PR #6. Accepted:
unit check red due to pre-existing check-coverage.mjs defect (logged
2026-08-13), not caused by this task. validate-state and validate-task
both green, Codex-reviewed.

---

## 2026-08-14 — Dependency tracking: two-phase approach, append-only log now, DOC-id status deferred to v2

**Decided:** runtime dependency additions are tracked in a new append-only
file, `engineering/DEPENDENCIES.md`, referenced from
`orchestration/PROJECT_RULES.md`, starting immediately. It is not entered
into `orchestration/bootstrap.yaml` as a DOC-id in this revision. Whether
it should receive full DOC-id treatment — individual `next.mjs approve`
events, staleness tracking — is deferred to v2 planning, when `SCOPE.md`
and related documents are reopened for provisioning and co-ownership
anyway.

**Why:** a DOC-id today would reopen gate 0's closed document graph for a
file whose shape (continuously appended, not periodically re-approved)
doesn't match what `bootstrap.yaml`'s approval model is built for — the
same reasoning already applied to `DECISIONS.md` and `approvals.yaml`,
neither of which are DOC-ids. Deferring tracking itself until v2, instead
of only deferring the DOC-id question, would leave every dependency added
during Release 1 unlogged. The two questions — when to start tracking,
and whether tracking should eventually be gate-0-graph-enforced — are
separable, and only the second is deferred.

**Rules out:** treating the absence of a DOC-id as absence of tracking.
`engineering/DEPENDENCIES.md` is mandatory from Release 1 onward per
`orchestration/PROJECT_RULES.md`'s constraints, independent of its status
in `bootstrap.yaml`.

**Revisit when:** v2 planning reopens `product/SCOPE.md`. At that point,
decide explicitly whether `engineering/DEPENDENCIES.md` graduates to a
DOC-id with individual approval, or remains append-only content — not by
default, but as its own stated decision.

---

## 2026-08-14 — project.state.yaml's resting-state allowed_paths clause, corrected: the 2026-08-13 entry is superseded

**Decided:** the 2026-08-13 entry's `allowed_paths: []` clause for resting
state is superseded. The existing, unconditional allowed_paths-non-empty
check in `validate-state.mjs` was retained through task-002, exactly as
specified and tested in `orchestration/tasks/task-002.yml` (see its notes
and the `resting-empty-allowed-paths.state.yaml` fixture, which asserts
FAIL). Resting state is identified by `active_task: none`, `attempt: 0`,
and `authorized_branch: main` only; `allowed_paths` remains non-empty in
both the resting and active shapes.

**Why:** task-002's accepted specification deliberately diverged from the
08-13 entry's `allowed_paths: []` clause, but the divergence was never
logged as its own decision, leaving `DECISIONS.md` and the shipped code
disagreeing. Discovered during cross-vendor review of the
`PROJECT_RULES.md` Tier-1 revision (2026-08-14), not from any live defect
in `validate-state.mjs`, `project.state.yaml`, or their tests — all three
conform to the actually-accepted task-002 design.

**Rules out:** treating the 08-13 entry's `allowed_paths: []` language as
current. Also establishes, going forward: an accepted task specification
that intentionally supersedes a standing `DECISIONS.md` entry must be
reconciled with a new entry before the task is considered closed — a
task's own acceptance under `HITL_GUIDE.md` §15 is not itself a substitute
for that reconciliation.

**Revisit when:** never automatically — this corrects the record rather
than deferring an open question. If the underlying design (unconditional
`allowed_paths`) is itself reconsidered later, that is a new decision, not
a revision of this one.

---

## 2026-08-14 — check-coverage.mjs terminology corrected: behaving to spec, not defective; the open question is contract design

**Decided:** the 2026-08-14 task-002 acceptance entry's description of the
red `unit` check as a "pre-existing check-coverage.mjs defect" is
corrected. `check-coverage.mjs` implements `engineering/TESTING.md`'s
coverage contract exactly as written: an unconditional requirement that
every AC id in `product/ACCEPTANCE.md` have a matching test file, with no
task-scoped or infrastructure exemption. Task-002 maps to zero AC ids, so
the red result was `TESTING.md`'s contract operating as specified, not a
script malfunction.

**Why:** discovered during cross-vendor review of the `PROJECT_RULES.md`
Tier-1 revision. Calling the script "defective" mischaracterises
`engineering/TESTING.md` (DOC-017, HITL-owned) and
`engineering/CHECK_MAP.md`'s coverage design, and risks a future fix
aimed at the wrong artifact.

**Rules out:** any future work "fixing" `check-coverage.mjs` to resolve
this specific class of red check — the script is correct against its
current specification. The open question is whether
`engineering/TESTING.md`'s coverage contract should distinguish
task/PR-scoped coverage, release-scoped coverage, and infrastructure
tasks that implement no ACs. That is unresolved and requires its own
product/engineering-phase decision, not a rider on this correction.

**Revisit when:** the coverage-contract redesign (task-scoped vs.
release-scoped vs. infrastructure-exempt) is taken up as its own piece of
work — queued by this entry, not scheduled.

---

## 2026-08-14 — engineering/DEPENDENCIES.md: Codex review, no violations

**Decided:** `engineering/DEPENDENCIES.md` accepted as compliant.
Codex-reviewed against three prerequisites: `orchestration/
DOCUMENT_CONVENTIONS.md` (confirmed: all entry headings `###`, all eight
fields present in exact order with exact labels, `Added by` values all
valid), `product/DECISIONS.md`'s 2026-08-14 two-phase entry (confirmed:
no DOC-id claimed for itself; its citations of DOC-014/DOC-015 as
dependency-selection sources are references, not a DOC-id claim, and are
not a violation), and `orchestration/PROJECT_RULES.md`'s dependency
constraint (confirmed: correct path, all required fields present).

**Why:** closes the review this file was owed before point 6 (coverage
machinery) builds on it. The file was accidentally committed to `main`
before Codex review earlier in this session (corrected in a follow-up
commit); this entry records the review that should have preceded that
commit.

**Rules out:** treating this file as unreviewed. No further review is
required unless its content changes.

**Revisit when:** the file's content changes — a new dependency category,
a format revision, or similar.
## 2026-08-15
Decision: Confirmed live branch-protection ruleset on `main` via `gh api
repos/eBry66/OptiBudget/branches/main/protection`. Required status checks
are empty (`contexts: []`) — no CI check, including `unit`, is actually
enforced at merge time, contrary to what `project.state.yaml`'s
`required_checks` list implies. Required approving review count is 0.
`enforce_admins` is true. Force pushes and branch deletion are blocked.
Why: repeated `--admin` merge overrides and red `unit` checks were being
attributed to policy (self-approval deadlock, coverage-check severity)
rather than checked against the actual GitHub configuration.
Rules out: treating `project.state.yaml`'s `required_checks` field as
enforced policy without separately configuring it in GitHub branch
protection; treating `gh pr merge --admin` as bypassing anything on this
repo as currently configured, since nothing is currently blocking a plain
merge.
## 2026-08-15
Decision: Investigated the template.lock / template.manifest.yaml
discrepancy flagged in the prior session handoff. Finding: no
contradiction. The `dev-template` GitHub repository does not exist under
this account (confirmed via `gh repo view` 404 and an empty repo listing
search) — template extraction per HITL_GUIDE.md section 13 has never been
performed. Both files were created in the same original bootstrap commit
(449b010, 2026-08-06) and have never been modified since. `template.lock`'s
placeholder URL and `0.0.0`/`unset` version correctly reflect "never
synced." `template.manifest.yaml`'s `1.2.0` is a hand-typed seed value
with no real template repository behind it, not evidence of a completed
sync.
Why: closes an open item from the 2026-08-14 session handoff that
speculated the two files might be contradictory.
Rules out: editing either file to force agreement, since neither is
wrong; treating `template_version: 1.2.0` in the manifest as a real,
synced version going forward without first creating an actual
`dev-template` repository at that version. Template extraction remains
undone and unscheduled; per HITL_GUIDE.md 13.1 it is now timely
(task-002 complete) but is a separate, deliberate decision, not implied
by this finding.
## 2026-08-15 — task-004 (claims_acs coverage enforcement) merged, PR #29. Accepted:

check-coverage.mjs and validate-task.mjs now enforce task-scoped claims_acs
per engineering/TESTING.md (DOC-017), replacing unconditional full-
ACCEPTANCE.md scanning. Codex review (orchestration/REVIEW_BRIEF.md) found
one violation on first pass: claims_acs parsing was too lenient, silently
accepting bare digit ids and malformed values instead of enforcing the
AC-0NN grammar. Fixed (commit fb7dcbe) and re-reviewed clean. All required
checks green (unit, validate-state, validate-task). Sensitive-area sweep
(authentication, authorisation, RLS, money arithmetic, secrets) clean —
expected, this is infrastructure work touching none of those areas.

---
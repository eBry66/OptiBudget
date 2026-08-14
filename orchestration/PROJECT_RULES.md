# Project Rules

This file is CONTENT. The template never overwrites it. Everything specific to
this project belongs here and nowhere else.

SENTINEL: OB-K7M2

## What this project is

OptiBudget is a household budget management web application for the Belgian
market. It gives a household one place to hold its monthly fixed expenses,
non-monthly recurring expenses funded from a dedicated Provision Account, a
Contingency Account against unpredictable large expenses, an inventory of its
financial holdings, building-charge tracking, mortgage tracking, and its
spending grouped by how far each category can be reduced. It is not an
adviser, not a scenario or simulation tool, and never moves money or connects
to a bank. The authoritative statement is `product/PRODUCT.md`; read that
before touching anything this summary compresses.

## Stack

Next.js 16.3.0, Supabase (Postgres with Row Level Security), Vitest, Tailwind
CSS v4, Vercel — set by `engineering/ARCHITECTURE.md` (DOC-015), approved
2026-08-11. Do not assume any detail beyond what that document states.

## Highest-risk area

Supabase Row Level Security. Every table holding a household's financial data
must be scoped so a member reaches only rows belonging to households they
are a member of — nothing else grants that access, and no administrative
role sees across households (REQ-001 through REQ-004).
`engineering/THREAT_MODEL.md` (DOC-016) must discuss RLS per table or it is
incomplete regardless of its length.

The task that first establishes RLS policy and its automated test suite is
Tier 2 unconditionally — see "Execution tiers" below. Every RLS-touching task
after that runs at whatever tier the rules below assign it; RLS does not by
itself force repeated HITL involvement.

Threat-model review is triggered by household-scoped reach, not by column
data type. Any new table that carries or reaches household-scoped data, or
any change to an existing household-reach path, a shared authorization
primitive (`household_member_of()` or equivalent), an RLS policy, or a
`SECURITY DEFINER` function requires a `THREAT_MODEL.md` (DOC-016)
addendum, reviewed and re-approved, before its RLS policy task can be Tier
2 approved. A table with no monetary or personally identifying column is
not exempt on that basis — `household_members` itself carries no monetary
field and is the table every other policy ultimately reads through
`household_member_of()`; correctness of that single function affects
every table it protects, which is exactly the reach the trigger exists to
catch, not the data type any one table happens to store.

## Execution tiers

Two tiers, applied per task, stated in the task YAML, and structurally
verified by CI — see the Tier verification section — not self-declared by
the implementing vendor.

**Tier 1 — implement, review, prepare a merge without a pre-implementation
checkpoint.** The vendor implements against an already-handed-off brief,
Codex reviews, CI runs. Merge authorization follows `HITL_GUIDE.md` §17.3:
on this solo repository, GitHub blocks the PR author from approving their
own pull request, so the completed pull request description — Accepted
deviations and Decision sections filled in — is the binding record in
place of a GitHub Review action. The HITL merges directly once the
description is complete; no Approve action is attempted. This is weaker
than a commit-bound Review action, since the description remains editable
text with nothing recording when or against what — acceptable on a
repository with exactly one committer and one approver, since no second
party could edit it unnoticed. If this project ever gains a second HITL
or a second approving human, §17.3 stops applying and a real Review
action is required instead; this paragraph must be revised at that point,
not left describing a solo-repo exception nobody still qualifies for.

`gh pr merge --admin` is not the canonical Tier-1 merge mechanism and
this document does not institutionalize it as one; if it is used, it is
because a separate, already-logged condition requires it (see
`product/DECISIONS.md`, 2026-08-14 entries), not because Tier 1
authorizes it.

Target future design, not yet built: the HITL authorizes an exact PR head
SHA, a dedicated required check (`hitl-authorized` or equivalent) passes
only for that SHA, and GitHub Auto-Merge executes once all required
checks are green — closing the gap §17.3 itself names, that the current
substitute isn't SHA-bound. Any new commit invalidates the authorization
and requires it again. This mechanism is to be designed and tested as its
own task, not assembled inside this document.

A task qualifies for Tier 1 only if all of the following hold:
- It writes only inside its own declared `allowed_paths`.
- If it modifies any table with an existing RLS policy, any query path
  reaching such a table, a shared authorization primitive
  (`household_member_of()` or equivalent), or a `SECURITY DEFINER`
  function, the task's CI run must include the full repository-wide RLS
  test suite, not only tests scoped to the table or function it directly
  touches, and that suite must pass. `household_member_of()` is shared by
  every table's policy; a change verified only against the tables a task
  directly modifies can still break every other table silently. A new
  failure anywhere in that suite blocks Tier-1 merge regardless of the
  task's own tests passing.
- It does not touch `approvals.yaml`, `bootstrap.yaml`,
  `project.state.yaml`, `template.lock`, `template.manifest.yaml`, or any
  document under `product/`.
- It does not introduce a new product requirement, decision, or acceptance
  criterion.
- Any database migration it performs runs against staging only, never
  production, and CI executes the up-migration, proves the resulting state,
  executes its reversal, and proves restoration of the defined
  pre-migration state — not merely the existence of a rollback file.
  Applying a migration to production is always Tier 2, regardless of how
  the staging work was classified.
- Its failure mode is fully undoable by reverting the merge commit and
  discarding disposable staging state — no secret, provider configuration,
  or production data was created or changed that a code revert alone
  cannot undo.

**Tier 2 — HITL confirms before implementation begins.** Everything not
qualifying for Tier 1 above. This includes, without exception: any edit to
`approvals.yaml`, `bootstrap.yaml`, or `project.state.yaml` (never
agent-written regardless of tier, per `AGENTS.md`); any product-phase
document; any change to `AGENTS.md`, `HITL_GUIDE.md`, or this file — an
agent may detect, draft, and obtain cross-vendor review for a governance
change, but landing it always requires explicit HITL ratification, with no
self-triage of which changes need that ratification; any production
migration; and the specific, one-time task that first establishes RLS
policy and its automated test suite.

## Tier verification

Tier eligibility is a gate-1, CI-enforced property, not a gate-0
document-graph property. It is checked by `validate-task.mjs` or a sibling
`validate-tier.mjs`, invoked by CI on every PR — never by `next.mjs`, which
is gate-0 machinery and, per `HITL_GUIDE.md`'s own stated design, becomes a
convenience only once real CI exists. The implementing agent does not
grant itself Tier-1 status; the task YAML states a declared tier and the
validator checks it independently against the diff, not against the
declaration alone.

## Continuous process improvement

Every session's handoff records process friction, if any, in one sentence.
At each task's close, the HITL reads that line as part of the existing
`product/DECISIONS.md` step (`HITL_GUIDE.md` §15.4 step 6) — no separate
ledger. An agent may detect recurring friction, classify it, and draft a
proposed amendment to the affected document with cross-vendor review; the
HITL ratifies before it lands, with no exception for perceived low impact.

Standing rule, discovered 2026-08-14: if an accepted task intentionally
diverges from a standing `product/DECISIONS.md` entry, the task is not
considered closed until a new entry records the superseding decision. A
task's acceptance under `HITL_GUIDE.md` §15 does not itself satisfy this.

Every accepted improvement is classified project-specific or reusable.
Project-specific stays in `PROJECT_RULES.md` or wherever it landed.
Reusable improvements are never copied as-is into template machinery —
`PROJECT_RULES.md` is project content, not machinery — they are generalized
into `AGENTS.md`, `HITL_GUIDE.md`, or a validator, cross-vendor reviewed,
and released as a template version before this project is considered
procedurally closed. Automated detection of recurring friction is not
built as part of this rule; the rule is HITL-and-agent discipline applied
by hand until evidence justifies automating it.

## Deferred governance task

Once execution-tier automation above is running, review `product/ACCEPTANCE.md`,
`engineering/TESTING.md`, and `HITL_GUIDE.md` §15 to determine which AC
evidence genuinely requires HITL hand-confirmation and which can be
independently automated (a different vendor authors the test than
implements the behaviour it verifies). Not decided in this revision —
`ACCEPTANCE.md`'s own definition of an AC as something confirmed by hand is
a product-phase commitment, changing it needs its own review cycle, not a
rider on a process-governance change.

Also deferred, logged 2026-08-14: `engineering/TESTING.md`'s coverage
contract does not distinguish task/PR-scoped coverage, release-scoped
coverage, and infrastructure tasks that implement no acceptance criteria.
`scripts/check-coverage.mjs` behaves correctly against the current
contract; redesigning the contract itself is separate future work, not
addressed here.

## Project-specific constraints

- OptiBudget never moves money, never instructs a bank, and never connects to
  one (REQ-093). This holds across every release; no feature, however
  convenient, may cross it.
- Every figure shown for comparison, totalling, or reporting is in euros. Where
  a source states an amount in another currency, both the source amount and
  currency and the derived euro figure are recorded — never converted and
  discarded (REQ-074, REQ-075).
- A category a household has set by hand is never overwritten by OptiBudget,
  even when its own categorisation logic would choose differently later
  (REQ-037).
- Every new runtime dependency gets one entry in `engineering/DEPENDENCIES.md`
  (package, version, reason, added-by, date) before the task adding it is
  considered closed. A dependency that changes the architecture — a new
  ORM, a new state-management library, anything that constrains future
  choices or is expensive to reverse — additionally requires a full ADR in
  `engineering/adr/`. Ordinary dependencies do not. See
  `product/DECISIONS.md`, 2026-08-14, for why this is two rules and not one.

## Vendors in use

- Claude Code (implement), OpenAI Codex (review). The vendor that drafted an
  artifact must not review it (HITL_GUIDE section 7).
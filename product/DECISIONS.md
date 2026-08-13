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

# Architecture

The technology stack `orchestration/PROJECT_RULES.md` defers to this
document ("Stack: Not yet chosen. Set by `engineering/ARCHITECTURE.md`
(DOC-015)."). Based on `product/SCOPE.md` (DOC-012) and, through it, every
product document SCOPE.md itself rests on. States how OptiBudget is built,
not what it does — nothing here introduces a requirement; where this
document needs something the product documents don't say, that is a defect
in the product phase, not something to invent here.

Feeds three documents directly: `engineering/THREAT_MODEL.md` (DOC-016),
`package.json` (DOC-018), and `.env.example` (DOC-019). `engineering/
TESTING.md` (DOC-017) was written first and states it assumes a Node/
TypeScript toolchain, on the condition that this document doesn't choose
otherwise. It doesn't: TESTING.md needs no revision.

## Stack

| Concern | Choice |
|---|---|
| Language | TypeScript, strict mode |
| Framework | Next.js, App Router |
| UI library | React |
| Hosting | Vercel — Production from `main`, Preview per pull request |
| Database | Supabase Postgres, with Row Level Security |
| Auth | Supabase Auth |
| Data access | `@supabase/supabase-js` + `@supabase/ssr` |
| Package manager | npm |
| Runtime | Node 22 LTS or later |
| Test runner | Vitest |
| Styling | Tailwind CSS |
| Icons | `lucide-react` |
| Font | Inter, self-hosted via `next/font` |

Hosting on Vercel and the database on Supabase are not new choices made
here — `orchestration/HITL_GUIDE.md` §8.2–8.3 and `orchestration/
PROJECT_RULES.md`'s "highest-risk area" already commit to them. What this
document adds is the framework, the auth and data-access pattern, and the
supporting tooling PROJECT_RULES.md's Stack line was waiting on.

**Why Next.js.** It is Vercel's own framework, which removes a category of
hosting-configuration risk before it exists. Supabase's official `@supabase/
ssr` auth helpers document the App Router as a first-class target, which
matters directly for the highest-risk area: less custom code standing
between a request and the RLS boundary. It keeps the whole stack on Node
and TypeScript, which is what `engineering/TESTING.md` already assumed.
SvelteKit was considered — it is also a legitimate Vercel/Supabase pairing —
and rejected only because it offers no advantage here large enough to
justify a second framework ecosystem the HITL and both vendors would need
to know.

**Why not an ORM.** Every request-serving read or write uses the signed-in
household member's own Supabase session — never the `service_role` key — so
that Postgres RLS is the access-control boundary, not application code. An
ORM such as Prisma talks to Postgres directly and would need to
independently forward the caller's identity into every query for RLS to
apply at all; Supabase's own client is built around exactly this pattern
(PostgREST requests carrying the caller's JWT) and doesn't need that
extra wiring reproduced and kept correct by hand. `service_role` is reserved
for out-of-band administrative scripts, never for a code path that serves a
request, per REQ-004 and `orchestration/PROJECT_RULES.md`'s Highest-risk
area section. That includes creating a
household in the first place: bootstrapping a new household never falls
back to `service_role` either — see Access control's household bootstrap
mechanism below.

## Application structure

`product/UX.md`'s seven screens — Connexion, Comptes, Import, Transactions,
Transferts, Catégories, Rapports — map to seven route segments under one
authenticated layout implementing the persistent top bar UX.md describes.
One flat level, matching UX.md exactly: no screen nested inside another.

Every mutation a household performs — adding an account, importing a file,
confirming or rejecting a transfer candidate, reassigning a category,
changing a category's reducibility or provisioning — is a Next.js Server
Action, not a separate API layer. A Server Action runs with the caller's
Supabase session already attached, so the same RLS-scoped client serves
both the screen's reads and its writes, with no separate API contract that
could drift from what UX.md describes.

CSV parsing (REQ-013, REQ-014, and the bank/format table in `product/
SCOPE.md`) runs inside the Server Action that handles an import — never in
the browser. Each bank and format in that table gets its own parser module
turning that bank's rows into a common movement shape. Adding a bank later,
which SCOPE.md's own text says requires its re-approval, is then also
adding one parser module — the engineering change and the product-scope
change land together.

Every route renders dynamically, per request. Nothing OptiBudget shows is
public or shared across households (REQ-001 through REQ-004), so no page
qualifies for static generation or incremental static regeneration.

## Data model (logical entities)

Not a schema — column-level detail is written later, as migrations under
`supabase/migrations/`, which is task-level work and out of scope for a
gate 0 document per `AGENTS.md`'s gate 0 rule against scaffolding and code.
What follows is the set of entities `engineering/THREAT_MODEL.md` (DOC-016)
needs in order to discuss Row Level Security per table, grouped by the
release in which their behaviour first matters (`product/SCOPE.md`).

**Release 1 spine.** REQ-005 already requires all four account roles to
exist in Release 1, so this spine is not a Release-1-only subset that later
releases extend — it is the full shape, present from the start:

- `households`
- `household_members` — links a household to a Supabase auth user. Built as
  a membership table, not a one-to-one owner column, because REQ-002 is
  phrased as "every household they are a member of." `product/GLOSSARY.md`
  notes version 1 ships exactly one member per household in practice; the
  table shape doesn't assume that stays true, since REQ-002 doesn't say it
  must.
- `accounts` (role: spending, provision, contingency, or securities —
  REQ-005), `reference_balances` (REQ-008)
- `movements` (REQ-013, REQ-023, REQ-024), `transfer_candidates` and
  `transfers` (REQ-025 through REQ-030), `duplicate_candidates` (REQ-016
  through REQ-018)
- `imports` — one row per import action, carrying the counts REQ-019
  requires and the coverage-date advance REQ-022 requires
- Categories are two tables, not one, because REQ-038 gives leaf categories
  two different owners:
  - `categories` — the parent/leaf set OptiBudget itself provides
    (REQ-031). No `household_id`: this is shared reference data, readable
    by every household, not household-owned data.
  - `household_categories` — leaf categories a household adds itself
    (REQ-038), each under an existing parent. Carries `household_id` and is
    RLS-scoped like any other household-owned table.
  - Every other place in the schema that points at "a leaf category" —
    `movements.category` (REQ-032, REQ-033, since a transaction is a
    movement) and `household_category_settings` below — resolves across
    the two tables the same explicit way: two nullable foreign key
    columns, `category_id` (→ `categories.id`) and `household_category_id`
    (→ `household_categories.id`), with a database-enforced check
    constraint — `CHECK ((category_id IS NULL) <> (household_category_id
    IS NULL))` — requiring exactly one of the two to be non-null on both
    `movements` and `household_category_settings`. Postgres rejects a row
    violating this at write time; it is not a convention left for
    application code to honour. Never both, never neither.
  - `household_category_settings` — the reducibility and provisioning a
    household has set (REQ-039 through REQ-041), one row per household per
    leaf category, using that same `category_id` / `household_category_id`
    pair to identify which leaf category — system-provided or
    household-created — the row belongs to

**Release 2 additions:** `provision_targets`, `contingency_targets`
(REQ-045 through REQ-051); `co_ownerships` — one row per co-ownership a
household's property belongs to (`product/GLOSSARY.md`'s term), household
data with `household_id` direct; `syndic_statements`, `charge_settlements`,
`fund_contributions` (REQ-052 through REQ-059), each referencing
`co_ownership_id` rather than a household or an account directly (see
Access control for the reach path).

**Release 3 additions:** `securities`, `positions` (REQ-060 through
REQ-062); `security_transactions` — one row per buy or sell (REQ-061),
referencing `position_id`; `valuations` — one row per valuation of a
security (REQ-066, REQ-067), referencing `security_id`; `investment_income`
— one row per income event on a position (REQ-063), referencing
`position_id` (see Access control for how each of the three reaches a
household).

**Currency, across every release.** REQ-075 names three sources of a
non-euro amount — a bank, a syndic, or a market — not only a bank. Any
table holding an amount that can originate from one of those three —
`movements`, `reference_balances` (bank); `syndic_statements`,
`charge_settlements`, `fund_contributions` (syndic); `valuations`,
`security_transactions`, `investment_income` (market) — stores the source
amount and its source currency alongside the derived euro amount, plus the
exchange rate and the date it applied to, wherever a conversion happened (REQ-074
through REQ-077). No table stores a converted figure without also storing
what it was converted from.

## Access control

The highest-risk area, per `orchestration/PROJECT_RULES.md`. Every table
below carries a Row Level Security policy restricting its rows to
households the requesting user reaches through `household_members`. No
role bypasses this (REQ-004): the design has no administrative surface
that reads across households, because there is no code path, anywhere a
request is served, that uses the `service_role` key instead of the
caller's own session.

**Reaching a household, per table.** Not every table below reaches one the
same way, so each row states the exact column or join chain used, rather
than a blanket rule that would hide the ones that don't fit it.

| Table | Reaches a household via |
|---|---|
| `households` | is the household |
| `household_members` | `household_id` (direct); insertable only through `create_household()`, below |
| `accounts` | `household_id` (direct) |
| `reference_balances` | `account_id` → `accounts.household_id` |
| `movements` | `account_id` → `accounts.household_id` |
| `transfer_candidates`, `transfers` | both linked movements' `account_id` → `accounts.household_id` (REQ-025 guarantees both accounts belong to the same household); a migration should denormalise `household_id` onto these two tables so the RLS policy is one equality check rather than two joins through `movements` |
| `duplicate_candidates` | `account_id` → `accounts.household_id` (the account the candidate was raised against) |
| `imports` | `account_id` → `accounts.household_id` |
| `categories` | none — global reference data, not household data; no RLS household policy |
| `household_categories` | `household_id` (direct) |
| `household_category_settings` | `household_id` (direct) |
| `provision_targets`, `contingency_targets` | `household_id` (direct) |
| `co_ownerships` | `household_id` (direct). Not previously listed in the Data model section above — required by the next row: `syndic_statements`, `charge_settlements`, and `fund_contributions` belong to a co-ownership (`product/GLOSSARY.md`'s term for the legal association a syndic administers), not to a household directly, and no `account_id` reaches them either. `product/PRODUCT.md`'s "not a portfolio of properties" constraint means a household has at most one co-ownership in version 1, but the relationship is still its own row rather than collapsed onto `households`, since a charge settlement's "co-ownership's financial year" (REQ-054, REQ-055) is a property of the co-ownership, not borrowed from the household |
| `syndic_statements` | `co_ownership_id` → `co_ownerships.household_id` |
| `charge_settlements` | `co_ownership_id` → `co_ownerships.household_id` — a settlement is stated for a co-ownership financial year (REQ-054), not for one particular `syndic_statements` row, so it references the co-ownership directly rather than through a statement |
| `fund_contributions` | `co_ownership_id` → `co_ownerships.household_id`; may additionally reference the `movement_id` that paid it (AC-058), which resolves to the same household independently via `accounts.household_id` |
| `securities` | `household_id` (direct) — treated as the household's own record rather than shared market data, since version 1 has no shared security master-data feed and a shared writable table would itself be a cross-household channel |
| `positions` | one row per security held in one securities account (REQ-060), referencing `account_id` and `security_id`. Reaches a household via `account_id` → `accounts.household_id`; `security_id` → `securities.household_id` must agree — a position can't exist for a security and an account belonging to different households |
| `security_transactions` | one row per buy or sell (REQ-061), referencing `position_id`. Reaches a household via `position_id` → `positions.account_id` → `accounts.household_id` |
| `valuations` | one row per valuation of a security (REQ-066, REQ-067), referencing `security_id`. Reaches a household via `security_id` → `securities.household_id` directly — a valuation is of a security, not of an account or a position |
| `investment_income` | one row per income event on a position (REQ-063), referencing `position_id`. Reaches a household via `position_id` → `positions.account_id` → `accounts.household_id`, the same two-hop path as `security_transactions` |

`engineering/THREAT_MODEL.md` (DOC-016) writes the actual policy for each
row above; this table is what makes that a checklist instead of a blank
page, including the `co_ownerships` table this document adds here so the
syndic-related rows are resolvable at all, and the structure stated inline
for `valuations`, `security_transactions`, and `investment_income`, which
had no entity definition anywhere else in this document to point back to.

**Household bootstrap.** Creating a household's first `household_members`
row is the one case where an ordinary authenticated user must succeed at a
write that no membership-based RLS policy on `household_members` can
authorise — there is no membership row yet for such a policy to check
against. This is solved with a single Postgres function, not with elevated
application credentials:

```sql
CREATE FUNCTION create_household(household_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_household_id uuid;
BEGIN
  INSERT INTO households (name) VALUES (household_name)
    RETURNING id INTO new_household_id;
  INSERT INTO household_members (household_id, user_id)
    VALUES (new_household_id, auth.uid());
  RETURN new_household_id;
END;
$$;

REVOKE ALL ON FUNCTION create_household(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION create_household(text) TO authenticated;
```

Called through Supabase's RPC interface with the caller's ordinary
session, so from the application's perspective this is a normal
RLS-respecting request, not a `service_role` escape hatch. The function
takes no `user_id` or `household_id` parameter that could target someone
else's row: it always inserts for `auth.uid()` — the identity Postgres
already knows from the caller's JWT — and it always creates a brand-new
household, never attaching the caller to an existing one.
`household_members` itself carries no INSERT policy for ordinary
RLS-scoped queries at all; the only way a row ever enters it is through
this function's elevated context, never through a bare `INSERT` a client
sends directly. `households` carries the same guarantee, stated explicitly
rather than left implicit: it too has no INSERT policy for ordinary
RLS-scoped queries, so a bare `INSERT` cannot create a `households` row
outside this function either. Without that guarantee an authenticated
caller could still create an orphan `households` row directly — low
severity, since a household with no matching `household_members` row is
unreachable under RLS to anyone, including its own creator, so it grants no
access to anything — but this document states the restriction outright
rather than relying on that low severity to excuse leaving it unstated.
This is the concrete mechanism `engineering/THREAT_MODEL.md` (DOC-016)
audits — not a gap left for that document to invent.

The exact policy per table is `engineering/THREAT_MODEL.md`'s job (DOC-016,
which depends on this document). What this document fixes is that the
boundary is Postgres RLS underneath the API, not a check written in Next.js
route or action code, and it names every table above so DOC-016 has a
checklist rather than a blank page.

## Testing

`engineering/TESTING.md` fixes the file-naming and test-title contract and
explicitly leaves the runner to this document. Vitest: it runs
`.test.ts` files under `tests/<area>/` directly, matching that contract,
and it needs no revision to TESTING.md's Node/TypeScript assumption.

An acceptance criterion in `product/ACCEPTANCE.md` is written as something a
household does with its hands and confirms with its eyes — proof of that
comes from `orchestration/HITL_GUIDE.md` §15.4's manual pass against a
Vercel preview, not from an automated suite pretending to be a browser. What
Vitest proves instead is TESTING.md's coverage floor: every AC id has at
least one test exercising the same Server Actions and RLS-scoped queries
the screen calls, run against real Postgres rather than a mocked Supabase
client, so a test like the one AC-003's own note calls for — proving no
crafted request bypasses a Row Level Security policy — is testing the
actual boundary and not a stand-in for it. This runs against
`optibudget-staging` in CI and against a local Supabase instance in
development.

## Deployment and environments

Unchanged from `orchestration/HITL_GUIDE.md` §8.2 and §8.3, restated here
only to confirm the application this document describes fits them without
adjustment: Vercel Preview per pull request and Production from `main`;
Supabase `optibudget-staging` bound to Preview and local development,
`optibudget-prod` bound to Production. The `service_role` key never appears
in a `NEXT_PUBLIC_` variable, in Preview, or in the repository (HITL_GUIDE
§8.4). Variable names — not values — are recorded in `.env.example`
(DOC-019, which depends on `engineering/THREAT_MODEL.md`); this document
does not enumerate them.

## Dependency governance

`orchestration/PROJECT_RULES.md` proposes that no new runtime dependency is
added without an ADR in `engineering/adr/`. Everything named in Stack above
is this document's own decision record for that dependency — implementing
it in `package.json` (DOC-018) does not each need a separate ADR. Anything
`package.json` adds beyond what Stack names — a charting library for
Rapports' bar charts, a CSV-parsing helper, a date-handling library, and
similar — is a decision this document defers, and needs its own ADR before
it's added, since none of those choices are load-bearing for `engineering/
THREAT_MODEL.md` or `engineering/TESTING.md` the way the items in Stack are.

## Out of scope for this document

- Mortgage tracking. `product/PRODUCT.md` names it as core to the second
  user — the couple carrying a mortgage — and lists it among the seven
  fundamentals. `product/REQUIREMENTS.md` defines no REQ id for it: there
  is nothing there a mortgage entity could be built against. This is a gap
  in the product phase, not an engineering decision, so this document
  defines no mortgage entity, no mortgage schema, and no mortgage
  behaviour — guessing its shape from PRODUCT.md's one paragraph would mean
  inventing a requirement, which `AGENTS.md` forbids. Mortgage support
  waits until `product/REQUIREMENTS.md` states what it must do.
- REQ-088 and REQ-089 (English, Dutch, and switching between languages) are
  out of scope for version 1 per `product/SCOPE.md`. No i18n library is
  adopted now; French strings are written directly. Adopting one ahead of a
  second language entering scope would be building for a requirement that
  doesn't exist yet.
- REQ-091 and REQ-092 (tablet, mobile) are out of scope for version 1 per
  `product/SCOPE.md`. `product/UX.md`'s screens are desktop layouts only, by
  its own statement; no layout work targets other breakpoints, even though
  Tailwind's output is not deliberately broken on them.
- Exact Row Level Security policies, per table — `engineering/
  THREAT_MODEL.md` (DOC-016).
- Environment variable names and values — `.env.example` (DOC-019).
- The dependency list and npm scripts themselves — `package.json`
  (DOC-018).
- Which npm script satisfies each required CI check — `engineering/
  CHECK_MAP.md` (DOC-020).
- A browser support matrix. `product/ACCEPTANCE.md`'s AC-090 says "a
  supported browser" and no document read for this one names which browsers
  that means. Flagged here rather than invented.

# Threat model

Depends on `engineering/ARCHITECTURE.md` (DOC-015), specifically its Access
control section, which names every table that carries or reaches household
data and states, per table, the column or join chain that reaches a
household. This document does not repeat why that boundary is Postgres Row
Level Security rather than application code — ARCHITECTURE.md already
settled that — it writes the policy ARCHITECTURE.md deferred to it: "the
actual policy for each row," so that table becomes a checklist this document
closes rather than a promise it restates. Feeds `.env.example` (DOC-019).

Row Level Security is `orchestration/PROJECT_RULES.md`'s highest-risk area
and `orchestration/HITL_GUIDE.md` §7's explicit bar for this document: "If
the drafted threat model does not discuss RLS policies per table, it is
incomplete regardless of how long it is." Every table in ARCHITECTURE.md's
Access control table is discussed below by that standard. Two mechanisms
outside the per-table policies get their own sections because they are
where a per-table policy cannot be the whole answer: the household-bootstrap
function, and the `service_role` boundary.

## Method

For every table, the threat is the same shape: a household member, or
someone with no membership anywhere, reads or writes a row belonging to a
household they are not a member of. REQ-001 through REQ-004 state what must
never be true; the policy below is what makes it never true at the database
layer, not only in whatever Next.js code happens to run first. Two
mechanisms sit outside that per-table shape and are threat-modelled
separately: `create_household()`, the one write no membership-based policy
can authorise on its own, and the `service_role` key, the one credential
that bypasses RLS by design rather than by mistake. A short closing section
covers threats adjacent to the request-serving path that ARCHITECTURE.md's
own decisions (Server Actions for every mutation, CSV parsing server-side,
Supabase Auth sessions) raise, without inventing new ones.

## Trust boundary and actors

- **A household member**, authenticated via Supabase Auth. Should reach
  every household they are a member of and nothing else (REQ-002).
- **An authenticated person who is a member of no household relevant to a
  given row**, including a member of a *different* household. Should reach
  none of that row (REQ-002, REQ-003).
- **An unauthenticated visitor.** Should reach no financial information by
  any means OptiBudget offers (REQ-003).
- **An out-of-band administrative script or operator holding the
  `service_role` key.** REQ-004: no role OptiBudget's own access-control
  system grants can see across households, and `service_role` is not used
  by any code path that serves a request (`engineering/ARCHITECTURE.md`,
  "Why not an ORM"). Modelled in its own section below, since its risk is
  not "does a policy scope it correctly" — it bypasses policies by
  design — but "can it reach a request at all."
- **Database administrator or hosting-provider infrastructure access** is
  explicitly out of this document's threat surface. REQ-004's own text
  carves it out: "This does not extend to direct infrastructure access
  outside that system... No product requirement can constrain that, for
  any hosted system, and OptiBudget does not claim to." A 2026-08-11 entry
  in `product/DECISIONS.md` considered and rejected a separate audited
  staff-access path for the current version — "OptiBudget has no role,
  mechanism, or credential capable of accessing more than one household's
  data — including for OptiBudget's own administration" — so there is no
  intermediate "support access" actor to model either. If that decision is
  revisited, this document needs revision alongside it.

## Shared verification primitive

Nineteen table rows in ARCHITECTURE.md's Access control table resolve to
twenty-three tables, each needing a policy that ultimately asks the same
question: does the requesting user belong to the household this row
belongs to? Writing that check out independently twenty-three times is
itself a risk this document should not accept — a single divergent `USING`
clause among twenty-three is exactly the kind of mistake Row Level Security
exists to prevent, and copy-paste is how it happens. One function, defined
once and reused everywhere below, bounds that risk to one definition
instead of twenty-three.

`household_members` also cannot check its own membership by querying
itself under its own policy without hitting Postgres's recursive-policy
error, since its policy's `USING` clause would itself scan the table the
policy protects. Both problems have the same fix: a `SECURITY DEFINER`
function, following the exact safe pattern `engineering/ARCHITECTURE.md`
already established for `create_household()` — empty `search_path`,
every object schema-qualified, so the function's owner-level privilege
can't be redirected to an attacker-controlled object in a writable schema.

```sql
CREATE FUNCTION household_member_of(target_household_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.household_members
    WHERE household_id = target_household_id
      AND user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION household_member_of(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION household_member_of(uuid) TO authenticated;
```

Running as `SECURITY DEFINER`, its internal `SELECT` against
`household_members` executes as the function's owner, not the caller's
RLS-scoped session — the same reason this avoids the recursion problem, it
also means the function itself is the one place that must be correct for
every table below to be correct. It takes a household id and returns only
whether the caller belongs to it: it cannot be used to enumerate another
household's members, and it reveals nothing beyond a boolean. `anon` has no
grant; only `authenticated` can call it, matching REQ-003 for the
unauthenticated actor.

## RLS policy, per table

Every table below has RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL
SECURITY`) as a baseline; a table with RLS enabled and no matching policy
denies every row to every non-owner role by default, which is the correct
starting state and is used deliberately in a few rows below rather than
being an oversight. Grouped exactly as ARCHITECTURE.md's Data model groups
them, so this section can be read as ARCHITECTURE.md's checklist, closed
one row at a time.

### Release 1 spine

**`households`** — is the household (REQ-001). No requirement describes
renaming or deleting a household, so no `UPDATE` or `DELETE` policy is
defined — inventing one would be inventing a requirement, which `AGENTS.md`
forbids. No `INSERT` policy either: `engineering/ARCHITECTURE.md` states
outright that the only way a row enters this table through request-serving
code is `create_household()`'s elevated context, never a bare `INSERT` a
client sends directly.

```sql
CREATE POLICY households_select ON households
  FOR SELECT
  USING (household_member_of(id));
```

**`household_members`** — direct `household_id`. Same reasoning as
`households` for the missing `INSERT`: `engineering/ARCHITECTURE.md` states
this table "carries no INSERT policy for ordinary RLS-scoped queries at
all." No requirement describes removing a member either — `product/
GLOSSARY.md` notes version 1 ships exactly one member per household in
practice — so no `DELETE` policy is defined. This is the table every other
policy below ultimately reads through `household_member_of()`; a mistake
here is not contained to one table's data the way a mistake on, say,
`securities` would be.

```sql
CREATE POLICY household_members_select ON household_members
  FOR SELECT
  USING (household_member_of(household_id));
```

**`accounts`** — `household_id` direct (REQ-005, REQ-006).

```sql
CREATE POLICY accounts_all ON accounts
  FOR ALL
  USING (household_member_of(household_id))
  WITH CHECK (household_member_of(household_id));
```

**`reference_balances`** — reaches via `account_id → accounts.household_id`
(REQ-008); carries no `household_id` of its own, so the policy joins
through `accounts`.

```sql
CREATE POLICY reference_balances_all ON reference_balances
  FOR ALL
  USING (account_id IN (
    SELECT id FROM accounts WHERE household_member_of(household_id)
  ))
  WITH CHECK (account_id IN (
    SELECT id FROM accounts WHERE household_member_of(household_id)
  ));
```

**`movements`** — `household_id` direct (REQ-013, REQ-023, REQ-024),
enforced by ARCHITECTURE.md's composite foreign key to agree with
`account_id`. A policy can only test the column it's given; it cannot by
itself stop a row whose `household_id` and `account_id` disagree — that
half of the guarantee is the composite foreign key's job, not this policy's.
Together they close it: the policy keeps the row's household scoped to the
caller, the foreign key keeps `household_id` truthful about which
household's account the row actually references.

```sql
CREATE POLICY movements_all ON movements
  FOR ALL
  USING (household_member_of(household_id))
  WITH CHECK (household_member_of(household_id));
```

**`transfer_candidates`, `transfers`** — `household_id` direct (REQ-025
through REQ-030), enforced to agree with each linked movement by the same
composite-foreign-key pattern as `movements`. Identical policy on both
tables:

```sql
CREATE POLICY transfer_candidates_all ON transfer_candidates
  FOR ALL
  USING (household_member_of(household_id))
  WITH CHECK (household_member_of(household_id));

CREATE POLICY transfers_all ON transfers
  FOR ALL
  USING (household_member_of(household_id))
  WITH CHECK (household_member_of(household_id));
```

**`duplicate_candidates`** — reaches via `account_id →
accounts.household_id` (REQ-016 through REQ-018), the account the candidate
was raised against; no `household_id` of its own.

```sql
CREATE POLICY duplicate_candidates_all ON duplicate_candidates
  FOR ALL
  USING (account_id IN (
    SELECT id FROM accounts WHERE household_member_of(household_id)
  ))
  WITH CHECK (account_id IN (
    SELECT id FROM accounts WHERE household_member_of(household_id)
  ));
```

**`imports`** — reaches via `account_id → accounts.household_id` (REQ-019,
REQ-022).

```sql
CREATE POLICY imports_all ON imports
  FOR ALL
  USING (account_id IN (
    SELECT id FROM accounts WHERE household_member_of(household_id)
  ))
  WITH CHECK (account_id IN (
    SELECT id FROM accounts WHERE household_member_of(household_id)
  ));
```

**`categories`** — global reference data OptiBudget itself provides
(REQ-031), no `household_id`, deliberately no household-scoping policy —
there is no household to scope to. It still needs an explicit policy rather
than silent reliance on "it's not sensitive": every OptiBudget route sits
behind the authenticated layout (`engineering/ARCHITECTURE.md`,
"Application structure"), so nothing calls for `anon` to read it either.

```sql
CREATE POLICY categories_select ON categories
  FOR SELECT
  TO authenticated
  USING (true);
```

No `INSERT`, `UPDATE`, or `DELETE` policy: this table's rows come from
OptiBudget's own seeding, not a request a household makes, so the same "no
policy, no ordinary write" shape used for `households` above applies here
for a different reason — not a missing requirement, but data no household
member ever writes.

**`household_categories`** — `household_id` direct (REQ-038).

```sql
CREATE POLICY household_categories_all ON household_categories
  FOR ALL
  USING (household_member_of(household_id))
  WITH CHECK (household_member_of(household_id));
```

**`household_category_settings`** — `household_id` direct (REQ-039 through
REQ-041). The `CHECK ((category_id IS NULL) <> (household_category_id IS
NULL))` constraint ARCHITECTURE.md defines is orthogonal to this policy —
it enforces exactly one parent reference is set, this policy enforces which
household may read or write the row regardless of which parent that is.

```sql
CREATE POLICY household_category_settings_all ON household_category_settings
  FOR ALL
  USING (household_member_of(household_id))
  WITH CHECK (household_member_of(household_id));
```

### Release 2 additions

**`provision_targets`, `contingency_targets`** — `household_id` direct
(REQ-045 through REQ-051).

```sql
CREATE POLICY provision_targets_all ON provision_targets
  FOR ALL
  USING (household_member_of(household_id))
  WITH CHECK (household_member_of(household_id));

CREATE POLICY contingency_targets_all ON contingency_targets
  FOR ALL
  USING (household_member_of(household_id))
  WITH CHECK (household_member_of(household_id));
```

**`co_ownerships`** — `household_id` direct.

```sql
CREATE POLICY co_ownerships_all ON co_ownerships
  FOR ALL
  USING (household_member_of(household_id))
  WITH CHECK (household_member_of(household_id));
```

**`syndic_statements`** — reaches via `co_ownership_id →
co_ownerships.household_id`; no `household_id` of its own.

```sql
CREATE POLICY syndic_statements_all ON syndic_statements
  FOR ALL
  USING (co_ownership_id IN (
    SELECT id FROM co_ownerships WHERE household_member_of(household_id)
  ))
  WITH CHECK (co_ownership_id IN (
    SELECT id FROM co_ownerships WHERE household_member_of(household_id)
  ));
```

**`charge_settlements`** — reaches via `co_ownership_id →
co_ownerships.household_id` directly (REQ-054, REQ-055; ARCHITECTURE.md is
explicit this is not routed through `syndic_statements`).

```sql
CREATE POLICY charge_settlements_all ON charge_settlements
  FOR ALL
  USING (co_ownership_id IN (
    SELECT id FROM co_ownerships WHERE household_member_of(household_id)
  ))
  WITH CHECK (co_ownership_id IN (
    SELECT id FROM co_ownerships WHERE household_member_of(household_id)
  ));
```

**`fund_contributions`** — unlike `syndic_statements` and
`charge_settlements`, ARCHITECTURE.md's "Cross-household reference
integrity" rule gives this table its own denormalised `household_id`
column, kept truthful against `co_ownership_id` by a composite foreign key
the same way `movements` is kept truthful against `account_id`. The policy
below uses that direct column rather than joining through
`co_ownerships` — cheaper, and no less correct, because the foreign key
already guarantees the two agree. AC-058 notes a contribution may also
reference the `movement_id` that paid it, which resolves to the same
household independently via `accounts.household_id`; this policy doesn't
need to check that path separately, since a mismatched `movement_id` would
itself violate the composite foreign key ARCHITECTURE.md defines for it.

```sql
CREATE POLICY fund_contributions_all ON fund_contributions
  FOR ALL
  USING (household_member_of(household_id))
  WITH CHECK (household_member_of(household_id));
```

### Release 3 additions

**`securities`** — `household_id` direct (REQ-060 through REQ-062),
treated as the household's own record rather than shared market data
(`engineering/ARCHITECTURE.md`).

```sql
CREATE POLICY securities_all ON securities
  FOR ALL
  USING (household_member_of(household_id))
  WITH CHECK (household_member_of(household_id));
```

**`positions`** — `household_id` direct (REQ-060), enforced to agree with
both `account_id` and `security_id` by the composite foreign keys
ARCHITECTURE.md defines.

```sql
CREATE POLICY positions_all ON positions
  FOR ALL
  USING (household_member_of(household_id))
  WITH CHECK (household_member_of(household_id));
```

**`security_transactions`** — reaches via `position_id →
positions.account_id → accounts.household_id` in ARCHITECTURE.md's stated
reach path (REQ-061), but `positions.household_id` is itself a direct
column, held consistent with `account_id` by the composite foreign key on
`positions`. The policy below joins one hop to `positions.household_id`
rather than two hops through `accounts` — the same guarantee, fewer joins.

```sql
CREATE POLICY security_transactions_all ON security_transactions
  FOR ALL
  USING (position_id IN (
    SELECT id FROM positions WHERE household_member_of(household_id)
  ))
  WITH CHECK (position_id IN (
    SELECT id FROM positions WHERE household_member_of(household_id)
  ));
```

**`valuations`** — reaches via `security_id → securities.household_id`
directly (REQ-066, REQ-067) — a valuation is of a security, not of an
account or a position, per ARCHITECTURE.md.

```sql
CREATE POLICY valuations_all ON valuations
  FOR ALL
  USING (security_id IN (
    SELECT id FROM securities WHERE household_member_of(household_id)
  ))
  WITH CHECK (security_id IN (
    SELECT id FROM securities WHERE household_member_of(household_id)
  ));
```

**`investment_income`** — reaches via `position_id → positions.account_id
→ accounts.household_id` (REQ-063), the same stated path as
`security_transactions`; the same one-hop simplification applies for the
same reason.

```sql
CREATE POLICY investment_income_all ON investment_income
  FOR ALL
  USING (position_id IN (
    SELECT id FROM positions WHERE household_member_of(household_id)
  ))
  WITH CHECK (position_id IN (
    SELECT id FROM positions WHERE household_member_of(household_id)
  ));
```

## Household bootstrap: `create_household()`

`engineering/ARCHITECTURE.md` names this function as the one write no
membership-based policy on `household_members` can authorise, since no
membership row exists yet to check. This document's job is to confirm the
function closes every route around that gap, not merely fill it:

- **No caller-supplied identity.** The function takes only `household_name
  text`. It always inserts for `auth.uid()` — the identity Postgres already
  derived from the caller's verified session — never a `user_id` or
  `household_id` parameter a caller could set to attach themselves to, or
  create on behalf of, someone else.
- **Anonymous callers are excluded before the function body runs.**
  `GRANT EXECUTE ... TO authenticated` with no grant to `anon` means an
  unauthenticated request cannot invoke this function at all, independent
  of what it does internally — REQ-003's "by any means" covers this path
  too.
- **Elevation is scoped to exactly two inserts.** `SECURITY DEFINER` with
  `SET search_path = ''` and schema-qualified references closes the
  attack ARCHITECTURE.md names — an attacker redirecting an unqualified
  name to an object of their own in a writable schema — the same class of
  risk `household_member_of()` above is built to avoid.
- **Atomicity, not a race.** Both inserts run inside the single implicit
  transaction of the function call. There is no window where a `households`
  row exists without its matching `household_members` row because the
  function partially completed; if it doesn't finish, neither row commits.
- **The residual gap is already named and is low severity.**
  `engineering/ARCHITECTURE.md` states it directly: without the missing
  `households` `INSERT` policy stated above, a caller could still create an
  orphan `households` row with no matching membership — reachable under RLS
  by no one, including its creator, so it grants no access to anything.
  This document's `households_select` policy above closes even that: no
  `INSERT` policy exists for ordinary requests, so the direct route
  ARCHITECTURE.md flags as low-severity-but-worth-stating is not just low
  severity, it is closed.

## The `service_role` boundary

`service_role` bypasses Row Level Security by design — it is not a policy
this document can write correctly or incorrectly, it is the one credential
every policy above assumes never reaches a request. What this document
adds beyond restating REQ-004 is what happens if that assumption fails and
what already stops it from failing:

- **Impact if it leaks.** Full read and write across every household's
  data, in every table above, at once — the single highest-impact
  compromise available against this design, precisely because it is the
  one credential none of the per-table work above constrains.
- **Why it doesn't reach a request today.** `engineering/ARCHITECTURE.md`
  states no code path that serves a request uses `service_role` instead of
  the caller's own session — every read and write goes through the
  caller's Supabase session, Server Actions included. Its deployment
  section states the key never appears in a `NEXT_PUBLIC_` variable, in
  Preview, or in the repository (`orchestration/HITL_GUIDE.md` §8.4).
  Out-of-band administrative scripts that do hold it are separately
  prohibited from writing `households` or `household_members` rows
  directly, so even a legitimate holder of the key cannot originate the one
  kind of row this document's policies can't retroactively scope.
- **What this document does not add.** Key rotation cadence, storage
  mechanics, and access logging for `service_role` are operational
  decisions this document is not positioned to invent — `.env.example`
  (DOC-019) is where the variable itself is named, and no requirement in
  `product/REQUIREMENTS.md` currently calls for an audit trail on its use.
  If one is added, this section needs revision alongside it. A broader
  staff-access path was considered and explicitly rejected for the current
  version (`product/DECISIONS.md`, 2026-08-11); this document does not
  reopen that.

## Adjacent to the RLS boundary, not inside it

Three properties of the request-serving path matter to the threats above
without needing a policy of their own, because `engineering/ARCHITECTURE.md`
already fixed them as part of the Stack and Application-structure
decisions this document audits rather than invents:

- **Identity binding.** `auth.uid()`, which every policy above reads,
  comes from the JWT Supabase's own auth layer verifies — not from a
  client-supplied `user_id` field a request could set to a different
  value. There is no path in this design where a client asserts its own
  identity to the database.
- **Server Actions as the only mutation path.** `engineering/
  ARCHITECTURE.md`'s "Application structure" section commits every
  household mutation to a Next.js Server Action rather than a separate API
  layer. Server Actions carry origin-header verification against
  cross-site request forgery as a property of the framework Stack already
  chose; a hand-rolled API layer would have needed that reproduced by
  hand and kept correct, which is one more reason ARCHITECTURE.md gave for
  not building one.
- **CSV import stays inside the household it was uploaded to.** CSV
  parsing runs inside the importing household's own Server Action call
  (REQ-013, REQ-014), under that household's own RLS-scoped session. A
  malformed or adversarial file can, at most, produce bad `movements`,
  `duplicate_candidates`, or `imports` rows scoped to the uploading
  household's own accounts — the same `WITH CHECK` clauses above that stop
  a household reaching another household's rows stop a crafted import from
  reaching them too. It is a data-quality risk to the uploading household,
  not a cross-household access risk.

## Verification

`engineering/ARCHITECTURE.md`'s Testing section already commits every
acceptance criterion to a test run against real Postgres, not a mocked
Supabase client, specifically so a test can prove "no crafted request
bypasses a Row Level Security policy" — the exact gap `product/
ACCEPTANCE.md` states AC-003's hand-testing cannot close on its own. This
document adds no new testing requirement; it gives that commitment its
checklist. Each `CREATE POLICY` above is one thing a test can attempt to
defeat: authenticate as a member of household A, attempt to read or write
a row scoped to household B through that table, and confirm Postgres — not
application code — is what refuses it.

## Out of scope for this document

- **Denial of service and resource exhaustion** — import file size limits,
  rate limiting, and similar. No REQ id in `product/REQUIREMENTS.md`
  addresses availability, and `orchestration/PROJECT_RULES.md` names RLS,
  not availability, as the highest-risk area. Vercel's and Supabase's own
  platform limits are the only defense in the current design. Flagged
  here rather than invented; if a requirement is added, this document
  needs revision.
- **Cross-site scripting beyond the framework's own defaults.** React
  escapes interpolated values by default; no OptiBudget screen renders
  unescaped HTML from household input. No additional sanitisation is
  designed here because no requirement or UX.md screen calls for
  accepting markup or HTML from a household.
- **`service_role` rotation cadence, storage mechanics, and access
  logging** — variable names, not values or procedures, belong to
  `.env.example` (DOC-019); no requirement currently calls for an audit
  trail.
- **A staff or support cross-household access path** — considered and
  rejected for the current version (`product/DECISIONS.md`, 2026-08-11).
  Not reopened here.
- **Mortgage tracking.** `engineering/ARCHITECTURE.md` already declines to
  define a mortgage entity: no REQ id exists for it to build against. With
  no entity, there is no table for this document to write a policy for
  either. Waits on the same product-phase gap ARCHITECTURE.md names.
- **Database administrator and hosting-provider infrastructure access.**
  Explicitly outside REQ-004's own scope and outside what any product
  requirement can constrain; see Trust boundary and actors above.

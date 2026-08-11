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

Not yet chosen. Set by `engineering/ARCHITECTURE.md` (DOC-015). Do not assume
a framework, database driver, or hosting detail beyond what that document
states once it exists.

## Highest-risk area

Supabase Row Level Security. Every table holding a household's financial data
must be scoped so a member reaches only rows belonging to households they
are a member of — nothing else grants that access, and no administrative
role sees across households (REQ-001 through REQ-004). Any work touching an
RLS policy requires explicit HITL confirmation before implementation.
`engineering/THREAT_MODEL.md` (DOC-016) must discuss RLS per table or it is
incomplete regardless of its length.

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
- No new runtime dependency without an ADR in `engineering/adr/`. *(My
  proposal, not yet a decision you've made — accept, reject, or amend.)*

## Vendors in use

- Claude Code (implement), OpenAI Codex (review). The vendor that drafted an
  artifact must not review it (HITL_GUIDE section 7).
# Scope

Which requirements from `product/REQUIREMENTS.md` are built, and in which
release. Requirements are cumulative: Release 2 includes everything in Release
1, and Release 3 includes everything in Release 2. A requirement not listed
against any release is out of scope for version 1.

Each release is a complete, useful loop a household can operate end to end and
confirm by hand — not a partial slice of a feature.

## Release 1 — Import, categorise, see where the money goes

The core loop: a household imports its bank-export files, sees correct
balances, and sees its spending grouped by how reducible it is.

**Households and access:** REQ-001, REQ-002, REQ-003, REQ-004

**Accounts and balances:** REQ-005, REQ-006, REQ-007, REQ-008, REQ-009,
REQ-010, REQ-011, REQ-012

**Importing movements:** REQ-013, REQ-014, REQ-015, REQ-016, REQ-017,
REQ-018, REQ-019, REQ-020, REQ-021, REQ-022, REQ-023

**Transactions and transfers:** REQ-024, REQ-025, REQ-026, REQ-027, REQ-028,
REQ-029, REQ-030

**Categories:** REQ-031, REQ-032, REQ-033, REQ-034, REQ-035, REQ-036,
REQ-037, REQ-038

**Reducibility and provisioning (category properties):** REQ-039, REQ-040,
REQ-041, REQ-042, REQ-043, REQ-044

**Currency:** REQ-074, REQ-075, REQ-076, REQ-077

**Views:** REQ-078, REQ-079, REQ-080

**Correcting and trusting the data:** REQ-083, REQ-084, REQ-085, REQ-086

**Language and devices:** REQ-087, REQ-090

Note on REQ-039 through REQ-041: REQ-039 requires that every leaf category
carry exactly one reducibility value and exactly one provisioning value, so
both properties exist on every category from Release 1 onward. The
provisioning value is stored and editable in Release 1, but nothing reads it
until Release 2 — the behaviours that consume it are REQ-045 onward, which
are Release 2 requirements.

Supported bank exports for REQ-014, Release 1:

| Bank                 | Format |
|----------------------|--------|
| BNP Paribas Fortis    | CSV    |
| ING Luxembourg        | CSV    |

No other bank or format is accepted in Release 1. Adding one is a change to
this table, requiring re-approval of this document.

## Release 2 — Provision, protect, and track co-ownership

Adds the two forward-looking reserves and building-charge tracking. Depends on
Release 1's accounts, movements, and categories.

**Provisioning and contingency:** REQ-045, REQ-046, REQ-047, REQ-048,
REQ-049, REQ-050, REQ-051

**Co-ownership:** REQ-052, REQ-053, REQ-054, REQ-055, REQ-056, REQ-057,
REQ-058, REQ-059

## Release 3 — Investments and the full holdings picture

Adds securities and completes the household-wide view of money across
account roles and investment holdings.

**Securities:** REQ-060, REQ-061, REQ-062, REQ-063, REQ-064, REQ-065,
REQ-066, REQ-067, REQ-068, REQ-069, REQ-070, REQ-071, REQ-072, REQ-073

**Views:** REQ-081, REQ-082

## Constraint holding across every release

**REQ-093** — OptiBudget never moves money, never instructs a bank, and never
connects to one. This is a cross-cutting constraint, not a release deliverable:
it applies starting with Release 1 and therefore to every cumulative release
after it.

## Out of scope for version 1

Not built in Release 1, 2, or 3. Revisit after version 1 ships.

- **REQ-088** — English and Dutch. French (REQ-087) is the only language
  version 1 needs to prove the product; additional languages are effort spent
  on reach, not on the household's core loop.
- **REQ-089** — changing language without losing data. Deferred with REQ-088,
  since there is nothing to switch between until it is built.
- **REQ-091** — tablet use.
- **REQ-092** — mobile telephone use. Device support beyond REQ-090 (personal
  computer, Windows and macOS) depends on decisions `engineering/ARCHITECTURE.md`
  has not yet made, and supporting additional device classes before the core
  loop has been validated on personal computers is premature.
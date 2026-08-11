# UX

Which screens OptiBudget has, what appears on each, and how a household
moves between them. Not a design specification and not a style guide — a
screen inventory a coding vendor can build against without guessing. Every
screen below realises requirements already approved in
`product/REQUIREMENTS.md`; none introduces one. Colours, typography, and the
logo referenced here are defined in `product/ASSETS.md`.

OptiBudget presents itself in French (REQ-087) and is used on a personal
computer, Windows or macOS (REQ-090). Every screen below is a desktop
layout; no other device class is in scope for this document.

## Navigation

One flat level. After Connexion, a persistent top bar gives access to every
other screen — Comptes, Import, Transactions, Transferts, Catégories,
Rapports — in that order. No screen is nested inside another; a household
is never more than one click from any of the six.

## Connexion

**Realises:** REQ-001, REQ-002, REQ-003, REQ-004.

A household signs in and sees only its own financial information — never
another household's, and never a global or cross-household view, regardless
of who is administering the application (REQ-004). A member of more than
one household is out of scope for Release 1 in practice: `product/PRODUCT.md`
scopes v1 to a single member per household, so this screen has no household
switcher.

Leads to: Comptes.

*This screen was not part of the wireframe rounds and has not been
stress-tested the way the other six were.*

## Comptes

**Realises:** REQ-005 through REQ-012.

A table listing every account the household has recorded: its name, its
role (Compte de dépense, Compte de provision, Compte de contingence,
Compte-titres — REQ-005), the institution holding it (REQ-007), its
reference balance and the date it applied to (REQ-008), the balance
OptiBudget derives for it today (REQ-009), and its coverage date (REQ-010).

The coverage date column carries a hover explanation: the date through
which OptiBudget holds movements for that account, and that any balance
shown beyond it assumes no movements occurred after it (REQ-011).

Where an account has no reference balance, its balance and coverage date
cells state that directly rather than showing a derived figure (REQ-012).

An "Ajouter un compte" action lets the household record a new account.

Leads to: Import (to bring movements into an account), Transactions (to see
an account's movements).

## Import

**Realises:** REQ-013 through REQ-023.

Two distinct actions, both explained on the screen before the household
picks one, because they solve different problems and neither should look
redundant with the other:

- **Importer** (the default) adds the movements in a bank export file to
  what an account already holds. Where the bank supplies a transaction
  reference, OptiBudget uses it to recognise a movement it already holds
  (REQ-015). Where it doesn't, OptiBudget raises likely duplicates as
  candidates for the household to resolve, one group at a time, never
  discarding one unasked (REQ-016, REQ-017, REQ-018).
- **Remplacer une période** wipes everything the account holds over a
  stated date range, then imports into it. Explicit, never the default
  (REQ-020).

An account selector states each account's role alongside its name and
institution, since import applies to any account role, not only the
spending account. A file drop zone accepts a bank export for the formats
`product/SCOPE.md` lists for Release 1, and can also be clicked to open a
file browser rather than requiring drag-and-drop.

After an import, a summary states how many movements were added, how many
were already held, and how many were raised as duplicate candidates
(REQ-019). A file OptiBudget cannot read fails without changing anything
already held, and states what it could not read (REQ-021).

Leads to: Transactions (to review what came in).

## Transactions

**Realises:** REQ-024, REQ-032 through REQ-038, REQ-083 through REQ-086.

A list of an account's movements: date, counterparty, amount, and category.
Every transaction carries exactly one leaf category (REQ-032); one
OptiBudget could not determine shows as Uncategorised, and every
Uncategorised transaction is visible so none goes unexamined (REQ-033,
REQ-034). Each row states how its category was set — assigned by
OptiBudget, or assigned by the household by hand — and a category the
household set by hand is never afterward changed by OptiBudget (REQ-037).
Reassigning a transaction's category is available on any row; the
correction is used for later transactions OptiBudget judges to be of the
same kind (REQ-036).

A grouping control lets the household view the list either chronologically
or grouped by category — the latter is how a post-import review is done, so
a batch of new transactions can be worked through one category at a time
rather than one row at a time (REQ-035).

A movement linked by a transfer shows its category cell as "Transfert" with
a link to Transferts rather than a category picker — it is not classified
as spending or income here or in any total (REQ-029), though it stays
visible in this list either way (REQ-030).

The date and amount of an imported movement cannot be edited here — those
come from the bank (REQ-084). A movement the household entered by hand can
be corrected fully, including date and amount (REQ-085, REQ-023). Every
figure traces back to the movements behind it (REQ-086); on this screen
that traceability is direct, since the screen already shows the movements
themselves.

Leads to: Transferts (for a movement linked by a transfer), Catégories (to
change what a category means rather than what one transaction's category
is).

## Transferts

**Realises:** REQ-025 through REQ-030.

Two lists and one manual action.

**À confirmer** — transfer candidates OptiBudget has raised: pairs of
movements in two of the household's accounts that may be one displacement
of money (REQ-025). Each candidate shows both movements and offers
Confirmer or "Ce n'est pas un transfert." A candidate becomes a transfer
only on confirmation; OptiBudget never establishes one on its own judgment
(REQ-026). Rejecting one leaves both movements as ordinary transactions.

**Confirmés** — established transfers, each with a "Retirer ce transfert"
action. Removing one returns both movements to their accounts as ordinary
transactions again (REQ-028).

**Déclarer un transfert manuellement** — a household can link two movements
as a transfer without OptiBudget having raised them as a candidate
(REQ-027): pick one movement from each of two accounts and confirm the
link.

Leads to: Transactions (either linked movement, to see it in its account's
history).

## Catégories

**Realises:** REQ-031, REQ-038 through REQ-044.

A two-level list — parent category, then its leaf categories underneath —
covering the categories OptiBudget provides, based on the categories a
household already meets in its own banking applications (REQ-031). "Leaf
category" is `product/GLOSSARY.md`'s term for precision in these documents;
on screen the household reads "sous-catégorie," since that is the word a
household recognises without needing the document's vocabulary.

Each leaf category carries a Réductibilité value and a Provisionnement
value — every category has exactly one of each, independently of the other
(REQ-039), and OptiBudget supplies a default for every category it provides
(REQ-040). Both are shown as column headers carrying a filter control, so
the household can narrow the list to one reducibility value, one
provisioning value, or both at once. A household can change either value
for any category; the change applies to every transaction ever assigned to
that category, not only future ones, since reducibility states how the
household reads its spending now (REQ-041).

An edit block lets the household pick any leaf category from a dropdown —
grouped by parent category — and set its reducibility and provisioning.
"+ Ajouter une sous-catégorie" lets the household add a leaf category of
its own, with its own reducibility and provisioning (REQ-038).

OptiBudget makes no recommendation here about what to change, ranks
nothing as a candidate for reduction, and generates no scenario (REQ-044) —
this screen edits definitions; it does not advise.

Leads to: Rapports (to see the effect of a reducibility or provisioning
change on spending already recorded).

## Rapports

**Realises:** REQ-042, REQ-043, REQ-078 through REQ-080, REQ-086.

A toggle switches the whole screen between one period (one calendar month)
and one year; both break spending down the same way, so a household reading
one does not have to learn a second layout to read the other (REQ-080).

**Balance des comptes** — three figures: Entrées, Sorties, and Solde.
Entrées and Sorties are shown in a neutral colour; Solde is shown in the
positive or negative colour `product/ASSETS.md` defines, matching its sign.
Beneath these, a per-account line for every account the household holds,
each with its balance at the end of the period or year shown (REQ-078,
REQ-079) — this is distinct from the three aggregate figures above it, and
was missing from earlier prototyping of this screen.

**Dépenses par catégorie** — a bar chart of spending by parent category,
sorted from highest to lowest.

**Dépenses par sous-catégorie** — a bar chart of spending by leaf category,
sorted from highest to lowest, with the same Réductibilité and
Provisionnement filter controls used on Catégories placed above the chart.
This is how OptiBudget satisfies REQ-042 and REQ-043: filtering and
colouring this chart by reducibility shows spending grouped by reducibility
with a yearly total per group, and the unfiltered chart already shows the
individual leaf categories and their totals beneath that grouping, so a
household can find what it had stopped noticing without a second, separate
chart duplicating the same figures.

Clicking any bar, in either chart, or any of the three balance figures,
opens Transactions filtered to the movements behind that figure (REQ-086).

Not shown in Release 1: how money divides among account roles and holdings
(REQ-081, REQ-082) — that is Release 3. Nothing on this screen reads the
provision target or contingency reserve — those behaviours start at
REQ-045, Release 2.

Leads to: Transactions (via drill-down on any figure), Catégories (to
change reducibility or provisioning of what this screen shows).
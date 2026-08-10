# Acceptance Criteria

Numbered AC-0NN, each phrased as something a household can do with its hands
and confirm with its eyes on the running application. AC ids mirror the REQ
ids of `product/REQUIREMENTS.md` exactly: AC-014 is the acceptance criterion
for REQ-014, and so on. AC-088, AC-089, AC-091, and AC-092 do not exist,
because REQ-088, REQ-089, REQ-091, and REQ-092 are out of scope for version 1
per `product/SCOPE.md`. If any of those requirements enters scope later, its
AC is added then, keeping the mirror intact.

This file covers every requirement in version 1, across Release 1, Release 2,
and Release 3 as `product/SCOPE.md` defines them. AC-093 is cross-cutting: it
applies from Release 1 onward, the same way REQ-093 does.

Domain terms used in this file follow the definitions in
`product/GLOSSARY.md`. Ordinary technical or everyday words — Windows, Mac,
browser, CSV — are not domain terms and are not redefined here.

Amounts in worked examples (1,000.00 EUR, and similar) are values to verify
in the application's calculations. They do not prescribe a display format or
locale; how figures are formatted on screen is `product/UX.md`'s concern, not
this document's.

For AC-003, hand-testing proves the application refuses every access route a
household member can reach through the interface. It cannot prove that no
crafted request bypasses authorisation underneath the interface. That stronger
guarantee is `engineering/TESTING.md`'s responsibility, exercised through
automated tests against the Row Level Security policies — not something a
non-technical HITL can verify by hand. AC-003 is real evidence; it is not the
whole of REQ-003's evidence.

## Households and access

**AC-001** — I create a household and, within it, an account and a movement.
Each of those two items shows as belonging to that household. Neither can
exist without a household, and neither one created in household A can be
made to belong to household B as well.

**AC-002** — I am a member of household A and, separately, of household B.
With household A selected, I see and can change household A's accounts and
movements. I select household B; I see and can change household B's data,
and none of household A's.

**AC-003** — Without being a member of a household, I try every means the
interface offers to reach that household's financial information — direct
links, search, any shared view. Every attempt is refused, and none shows me a
figure.

**AC-004** — I administer the application for household A. That role alone
gives me no ability to see or change household B's financial information
unless I am independently a member of household B. No role OptiBudget offers
shows financial information belonging to more than one household at once.

## Accounts and balances

**AC-005** — I add an account to my household and give it the role Spending
Account. It appears in my account list showing that role, and no other.

**AC-006** — I add a second account with the same role as an existing one —
two Spending Accounts, say. Both appear separately in my account list.

**AC-007** — I add an account and record the institution holding it. The
institution's name is shown wherever the account appears.

**AC-008** — I set a reference balance of 1,000.00 EUR as of 1 June 2026 for
an account. OptiBudget stores and shows that amount together with that date.

**AC-009** — With a reference balance of 1,000.00 EUR on 1 June 2026 and one
recorded movement of -50.00 EUR on 5 June 2026, the balance OptiBudget shows
for the account on 5 June 2026 is 950.00 EUR.

**AC-010** — I ask for an account's balance as of a date I choose. OptiBudget
shows that balance-as-of date and, separately, the account's coverage date —
the date through which its movements are held — beside it, even when the two
dates differ.

**AC-011** — I ask for the balance of an account at a date after its coverage
date. OptiBudget shows a figure together with a statement that it assumes no
movements after the coverage date.

**AC-012** — I open an account that has no reference balance recorded.
Instead of a balance figure, OptiBudget tells me none exists.

## Importing movements

**AC-013** — I upload a CSV file exported by BNP Paribas Fortis for one of my
accounts. OptiBudget reads it and adds the account's movements.

**AC-014** — I import the CSV export from BNP Paribas Fortis and, separately,
the CSV export from ING Luxembourg — the two banks and format `product/SCOPE.md`
lists for Release 1 — exactly as each bank produced them, with no editing on
my part. Both imports succeed.

**AC-015** — I import the same file twice, for a bank export that includes a
transaction reference. The second import adds no new movements, and
OptiBudget reports every one of them as already held.

**AC-016** — I import a file with no transaction reference, containing a
movement that matches one I already hold. OptiBudget raises it as a duplicate
candidate rather than adding it or discarding it on its own.

**AC-017** — Faced with a duplicate candidate, I choose to keep it as new or
discard it as a duplicate. OptiBudget acts on my choice only; if I decide
nothing, the candidate stays pending.

**AC-018** — I select several duplicate candidates from one import and
resolve them with a single action. All of them are resolved together, in one
step.

**AC-019** — After an import finishes, OptiBudget shows me three counts: how
many movements it added, how many it recognised as already held, and how many
it raised as duplicate candidates.

**AC-020** — An account holds movements dated across January 2026. I choose
to replace its movements for 1 to 31 January 2026 with the contents of an
import, and state that range explicitly before OptiBudget acts. Afterward:
every movement that was dated inside that range and is not in the new import
is gone; every movement the new import contains for that range is present;
and movements dated outside the range are unchanged. A later, ordinary
import, where I state no range, replaces nothing.

**AC-021** — I try to import a file OptiBudget cannot read. Nothing in the
account's existing movements changes, and OptiBudget tells me it could not
read the file.

**AC-022** — An account's coverage date is 15 June 2026. I import a file
whose latest movement is dated 30 June 2026. The account's coverage date
afterward is 30 June 2026. I then import an older file whose latest movement
is dated 20 June 2026. The account's coverage date afterward is still 30 June
2026 — importing an older file never moves it backward.

**AC-023** — I add a movement by hand. It appears in the account's history
marked as entered, visibly distinct from an imported movement.

## Transactions and transfers

**AC-024** — Every movement I open belongs to exactly one account, and is
shown as a transaction unless I have linked it to another movement as a
transfer.

**AC-025** — I hold two accounts in my household. I record a debit of 200.00
EUR in one and a credit of 200.00 EUR in the other, on the same date.
OptiBudget presents the two movements to me as a transfer candidate.

**AC-026** — I am shown a transfer candidate. Until I confirm it, both
movements remain transactions. Once I confirm it, they become a transfer.

**AC-027** — I select two movements OptiBudget did not raise as a candidate
and declare them a transfer myself. OptiBudget links them.

**AC-028** — I remove an existing transfer. Both movements remain in their
accounts' histories, each now shown again as a transaction.

**AC-029** — I check a period's totals for spending and for income.
Movements linked by a transfer appear in neither total.

**AC-030** — After confirming a transfer, I open each account's history
separately. Both linked movements are still there.

## Categories

**AC-031** — I browse the category list. Every leaf category appears under
exactly one parent category, and no leaf category appears under more than
one.

**AC-032** — I open any transaction. It shows exactly one leaf category.

**AC-033** — After an import, every new transaction has a leaf category.
Any transaction OptiBudget could not classify is assigned to Uncategorised.

**AC-034** — I filter my transactions by Uncategorised. Every currently
unclassified transaction appears there, and none is missing.

**AC-035** — After an import, I review the new transactions grouped by
category and reassign the category of one of them. The change is saved.

**AC-036** — I reassign the category of a transaction with a given
counterparty. A later import containing a transaction with the same
counterparty is categorised using my correction, not the original default.

**AC-037** — I set a transaction's category by hand, then run further
imports or let OptiBudget re-categorise elsewhere. The transaction I set
keeps the category I gave it.

**AC-038** — I add a new leaf category under an existing parent and set its
reducibility and its provisioning. Both are saved and shown when I open the
category.

## Reducibility and provisioning

**AC-039** — I open any leaf category. It shows exactly one reducibility
value and exactly one provisioning value, and I can set them to any
combination — Renounceable and Provisioned together, for instance — without
one constraining the other.

**AC-040** — I open a category I have never edited. It already shows a
reducibility value and a provisioning value that I did not set.

**AC-041** — I change a category's reducibility from Irreducible to
Renounceable. A transaction in that category from six months ago now appears
under Renounceable in the reducibility grouping, not only new transactions.

**AC-042** — I view a stated year's spending grouped by reducibility. Every
reducibility value defined in `product/GLOSSARY.md` appears as its own group,
and each group shows a total for that year.

**AC-043** — I expand one reducibility group for a stated year. I see the
individual leaf categories inside it, each with its own yearly total.

**AC-044** — I look through every reducibility view OptiBudget offers.
Nowhere does it suggest what to cut, rank categories as candidates for
reduction, or offer a what-if scenario.

## Provisioning and contingency

**AC-045** — I check my provision target. It equals what I spent on
provisioned categories over my reference period, increased by the inflation
rate.

**AC-046** — I view the inflation rate; it shows 2% by default. I change it
to 3%; my provision target recalculates using the new rate.

**AC-047** — I open the provisioning screen. It shows the combined balance of
my provision accounts against my provision target, and a shortfall if the
balance is below target.

**AC-048** — With a provision target of 12,000.00 EUR and a combined
provision-account balance of 10,800.00 EUR, the shortfall shown is 1,200.00
EUR, and the monthly amount shown to close it over twelve months is exactly
100.00 EUR — together with a statement that this figure closes the shortfall
alone and does not cover provisioned expenses falling due in those months.

**AC-049** — I enter a contingency target myself. OptiBudget stores exactly
the figure I entered, without calculating one of its own.

**AC-050** — I open the contingency screen. It shows the combined balance of
my contingency accounts against my contingency target, and any shortfall, in
the same layout as the provisioning screen.

**AC-051** — I view upcoming provisioned expenses. It lists provisioned
categories due in the next twelve periods, each with what it came to over my
reference period.

## Co-ownership

**AC-052** — I add a syndic statement, recording its date and the period it
covers. Both are saved and shown when I open it.

**AC-053** — On a syndic statement, I enter common charges and individual
charges as two separate amounts. Both are stored and shown separately.

**AC-054** — I record a charge settlement stating what the syndic says my
individual charges actually came to for the co-ownership's financial year,
and the resulting amount owed by or due to the household. Both are saved,
and the direction of the amount — payable by the household, or receivable by
it — is shown unambiguously.

**AC-055** — For a stated co-ownership financial year, I view what I paid in
individual charges, what the settlement states they came to, and the
difference between the two.

**AC-056** — I record a fund contribution, entering the working capital fund
amount and the reserve fund amount as two separate figures. Both are stored
separately.

**AC-057** — I view my fund contributions. Working capital fund contributions
are labelled recoverable on sale; reserve fund contributions are labelled as
not.

**AC-058** — I pay a fund contribution from a spending account. The movement
that paid it remains part of that account's history and balance, exactly as
any other transaction would. The recorded fund contribution itself appears
in neither my account balances nor my holdings.

**AC-059** — For a stated year, I view what I paid the syndic, split into
common charges, individual charges, and fund contributions.

## Securities

**AC-060** — I add a security to a securities account and record my position
in it. The position is shown when I open that securities account.

**AC-061** — I record a security transaction: buying 10 units of a security
at 50.00 EUR each, with a 5.00 EUR fee. All four details — security,
direction, units, price — and the fee are stored and shown.

**AC-062** — After recording that purchase, the position for that security
increases by 10 units.

**AC-063** — I record investment income of 25.00 EUR received on 15 June
2026 for a position. The amount and the date are saved and shown against
that position.

**AC-064** — I link a security transaction to the movement that settled it.
The movement remains part of its account's history and continues to affect
that account's balance, as any movement does. In any total OptiBudget
calculates that would otherwise include both the security transaction and
the movement as separate amounts, the money is counted once.

**AC-065** — I open the reconciliation view for a securities account. It
lists any security transaction not linked to a movement, and any movement in
that account not linked to a security transaction.

**AC-066** — I record a statement valuation for a security, dated to when the
bank calculated it. It is saved and shown labelled as a statement valuation,
with that date.

**AC-067** — I record an indicative valuation for a security, on a date of my
choosing. It is saved and shown labelled as an indicative valuation, with
that date.

**AC-068** — Having recorded both a statement valuation and a later
indicative valuation for the same security, both remain visible, each with
its kind and date. The indicative valuation has not replaced the statement
one.

**AC-069** — I view my holdings as of a date I choose. Each position is
valued using the most recent valuation dated on or before that date — never
a later one, even if OptiBudget holds one — with the date and kind of that
valuation shown beside it.

**AC-070** — I hold a position built from one purchase of 10 units at an
average cost of 50.00 EUR per unit, no units sold, no fees charged, and
20.00 EUR of investment income received, with a most recent valuation of
55.00 EUR per unit. The gain OptiBudget shows is (10 × 55.00) + 0 + 20.00 −
(10 × 50.00) − 0 = 70.00 EUR.

**AC-071** — I hold a position bought as one purchase of 10 units at 50.00
EUR per unit, for which a 5.00 EUR fee was charged. No units have been sold
and no investment income has been received. The most recent valuation is
55.00 EUR per unit.

What the household paid is 505.00 EUR: the 500.00 EUR price total (10 ×
50.00) plus the 5.00 EUR purchase fee.

The gain OptiBudget shows is 45.00 EUR: (10 × 55.00) − (10 × 50.00) − 5.00.

The return OptiBudget shows is that gain divided by what the household paid,
to two decimal places: 45.00 ÷ 505.00 = 8.91%.

**AC-072** — Wherever a figure is derived from average cost, OptiBudget
states that average cost was used.

**AC-073** — I view an account balance and I view my holdings. The holdings
figure never appears combined into, or as part of, an account balance.

## Currency

**AC-074** — Every aggregate total, comparison, and calculated report
OptiBudget shows is expressed in euros.

**AC-075** — I record or import a movement stated in a currency other than
the euro. When I open that movement, OptiBudget shows its original amount
and currency alongside the euro amount derived from it. Any aggregate figure
the movement contributes to uses its euro amount only.

**AC-076** — Wherever a converted figure appears, OptiBudget states the
exchange rate it used and the date that rate applied to.

**AC-077** — I look for any way to forecast an exchange rate, get advice on
one, or convert money through OptiBudget. None exists.

## Views

**AC-078** — I open the view for one period. It shows what came in, what
went out, and the balance of each account at the end of that period. Where
that period's end falls after an account's coverage date, the balance shown
carries the same no-movements-assumed statement as AC-011.

**AC-079** — I open the view for one year. It shows the same three figures
broken down across its twelve periods.

**AC-080** — I compare the period view and the year view. Both break
spending down using the same category grouping hierarchy, in the same order.

**AC-081** — I choose a date. OptiBudget shows how my money is divided among
the four account roles and my holdings at that date.

**AC-082** — I choose a year. OptiBudget shows how that division among
account roles and holdings has changed across the year.

## Correcting and trusting the data

**AC-083** — I open a movement and change its category and its counterparty.
Both changes are saved. I then create a transfer involving it, and remove
that transfer again. Afterward, the movement remains in its account's
history, still showing the category and counterparty I set, now shown again
as a transaction rather than as part of a transfer.

**AC-084** — I try to change the date or the amount of an imported movement.
OptiBudget does not allow it.

**AC-085** — I change the date and the amount of a movement I entered by
hand. Both changes are saved.

**AC-086** — From any figure OptiBudget shows me, I click through to the
movements, valuations, reference balances, and exchange rates it was derived
from, and I can see every one of them.

## Language and devices

**AC-087** — I set my language to French. Every screen, label, and message
that OptiBudget itself provides appears in French. Content I imported or
entered by hand — a bank's description, an institution's name, a security's
name — remains as recorded, untranslated.

**AC-090** — On a Windows PC using a supported browser, and separately on a
Mac using a supported browser, every other Release 1 acceptance criterion in
this document can be completed without a device-specific failure.

## What OptiBudget never does

**AC-093** — I look through every feature OptiBudget offers. None of them
moves money, sends an instruction to a bank, or connects to one live. Every
figure comes from a file I imported or from data I entered by hand.
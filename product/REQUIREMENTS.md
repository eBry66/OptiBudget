# Requirements

What OptiBudget must do, in the vocabulary of `product/GLOSSARY.md`. Each
requirement is numbered and stated as observable behaviour. Nothing here states
how a requirement is met.

A requirement being listed here does not mean it is in the first version.
`product/SCOPE.md` decides that.

## Households and access

**REQ-001** — All financial information belongs to exactly one household.

**REQ-002** — A member can see and change the financial information of every
household they are a member of, and of no other household.

**REQ-003** — A person who is not a member of a household can obtain none of its
financial information by any means offered by OptiBudget.

**REQ-004** — Administering the application for a household does not grant access
to the financial information of any other household. No role exists that can see
across households.

## Accounts and balances

**REQ-005** — A household can record the accounts it holds. Each account has
exactly one role: spending account, provision account, contingency account, or
securities account.

**REQ-006** — A household can hold more than one account in the same role.

**REQ-007** — Each account records the institution that holds it, so that a
household holding accounts at more than one bank can tell them apart.

**REQ-008** — Each account has a reference balance: an amount the household
records together with the date it applied to.

**REQ-009** — OptiBudget derives the balance of an account at a stated date from
its reference balance and the movements recorded between the date of that
reference balance and the stated date.

**REQ-010** — OptiBudget shows the coverage date of an account alongside any
balance it derives for that account.

**REQ-011** — Where a household asks for a balance at a date later than the
account's coverage date, OptiBudget says that the figure assumes no movements
after the coverage date.

**REQ-012** — Where an account has no reference balance, OptiBudget says so rather
than showing a balance derived from movements alone.

## Importing movements

**REQ-013** — A household can import a file exported by its bank containing the
movements of one account, in a format OptiBudget supports.

**REQ-014** — OptiBudget accepts, without the household editing the file first,
the export formats listed for each bank in `product/SCOPE.md`.

**REQ-015** — Where a bank includes a transaction reference in its export,
OptiBudget records it, and treats two movements of the same account sharing a
reference as the same movement.

**REQ-016** — Where no transaction reference is available, OptiBudget identifies
movements in an import that it may already hold and presents them as duplicate
candidates.

**REQ-017** — OptiBudget imports or discards duplicate candidates only as the
household directs, and never discards one on its own judgment.

**REQ-018** — A household can resolve duplicate candidates as a group rather than
one at a time.

**REQ-019** — After every import OptiBudget states how many movements it added,
how many it recognised as already held, and how many it raised as duplicate
candidates.

**REQ-020** — A household can replace everything it holds for one account over a
stated range of dates with the contents of an import, and must state that range
explicitly. This is never the default.

**REQ-021** — An import OptiBudget cannot read fails without changing anything the
household already holds, and says what it could not read.

**REQ-022** — Importing a file advances the coverage date of the account to the
last date the file covers.

**REQ-023** — A household can record a movement by hand, and OptiBudget shows that
the movement was entered rather than imported.

## Transactions and transfers

**REQ-024** — Every movement belongs to exactly one account. A movement is a
transaction unless a transfer links it to another movement.

**REQ-025** — OptiBudget identifies pairs of movements in two accounts of the same
household that may be the two sides of one displacement of money, and presents
them as transfer candidates.

**REQ-026** — A transfer candidate becomes a transfer only when the household
confirms it. OptiBudget never establishes a transfer on its own judgment.

**REQ-027** — A household can declare that two movements are a transfer without
OptiBudget having raised them as a candidate.

**REQ-028** — A household can remove a transfer. Removing it leaves both movements
in their accounts, each becoming a transaction again.

**REQ-029** — Neither movement linked by a transfer counts as spending or as
income in any total OptiBudget shows.

**REQ-030** — Both movements linked by a transfer remain visible in the history of
the account each belongs to.

## Categories

**REQ-031** — OptiBudget provides a set of categories arranged in two levels,
based on the categories households already meet in banking applications.

**REQ-032** — Every transaction has exactly one leaf category.

**REQ-033** — OptiBudget assigns a leaf category to every imported transaction.
Where it cannot establish what a transaction was for, it assigns the transaction
to the Uncategorised category.

**REQ-034** — A household can see every transaction OptiBudget assigned to
Uncategorised, so that none is left unexamined.

**REQ-035** — After an import, the household can review the imported transactions
grouped by category, and reassign the category of any of them.

**REQ-036** — When a household reassigns the category of a transaction, OptiBudget
uses that correction when categorising later transactions it judges to be of the
same kind.

**REQ-037** — A category a household has assigned by hand is never changed by
OptiBudget.

**REQ-038** — A household can add leaf categories to the set OptiBudget provides,
and can set their reducibility and provisioning.

## Reducibility and provisioning

**REQ-039** — Every leaf category has exactly one reducibility value for a
household, and exactly one provisioning value. The two are independent: any
reducibility value may be combined with any provisioning value.

**REQ-040** — OptiBudget supplies a default reducibility and provisioning value
for every category it provides.

**REQ-041** — A household can change the reducibility and the provisioning of any
leaf category. The change applies to every transaction in that category, whenever
it occurred, because reducibility states how the household reads its spending
now.

**REQ-042** — OptiBudget shows what the household spent, grouped by reducibility,
with the total for each group over a stated year.

**REQ-043** — Within the reducibility grouping, the household can see the
individual leaf categories and their yearly totals, so that it can find what it
had stopped noticing.

**REQ-044** — OptiBudget does not recommend which spending to change, does not
rank categories as candidates for reduction, and does not generate scenarios.

## Provisioning and contingency

**REQ-045** — OptiBudget calculates a provision target from what the household
spent on provisioned categories over its reference period, increased by the
inflation rate.

**REQ-046** — The inflation rate defaults to two percent a year and the household
can change it.

**REQ-047** — OptiBudget shows the combined balance of the household's provision
accounts against the provision target, and the shortfall where one exists.

**REQ-048** — Where a shortfall exists, OptiBudget shows what the household would
have to set aside each month for twelve months to close it, and states that this
figure closes the shortfall alone and does not cover the provisioned expenses
falling due in those months.

**REQ-049** — A household states its contingency target itself. OptiBudget does
not calculate it.

**REQ-050** — OptiBudget shows the combined balance of the household's contingency
accounts against the contingency target, and the shortfall where one exists, in
the same form as it shows the provision target.

**REQ-051** — OptiBudget shows which provisioned categories fall due in the coming
twelve periods, and what each came to over the reference period.

## Co-ownership

**REQ-052** — A household can record the syndic statements it receives, each with
its date and the period it covers.

**REQ-053** — A syndic statement records its common charges and its individual
charges as separate amounts.

**REQ-054** — A household can record a charge settlement: what the syndic states
its individual charges actually came to over the co-ownership's financial year,
and the amount owed by or due to the household as a result.

**REQ-055** — OptiBudget shows, for a stated co-ownership financial year, what the
household paid in individual charges, what the charge settlement states they came
to, and the difference between them.

**REQ-056** — A household can record its fund contributions to a co-ownership's
working capital fund and to its reserve fund, as separate amounts.

**REQ-057** — OptiBudget distinguishes fund contributions from the household's
other spending, and shows working capital fund contributions as attributable to
the household and recoverable when the property is sold, and reserve fund
contributions as not.

**REQ-058** — OptiBudget never includes a fund contribution in a balance or in
holdings. The co-ownership holds the fund.

**REQ-059** — OptiBudget shows what the household paid a syndic over a stated
year, separated into common charges, individual charges, and fund contributions.

## Securities

**REQ-060** — A household can record the securities it holds in a securities
account, and its position in each.

**REQ-061** — A household can record a security transaction: which security,
whether it was bought or sold, how many units, at what price, and every fee
charged.

**REQ-062** — A security transaction changes the position it applies to.

**REQ-063** — A household can record investment income received from a position,
with its date and amount.

**REQ-064** — A household can link a security transaction to the movements that
settled it, and OptiBudget counts that money once, not once as the security
transaction and again as the movement.

**REQ-065** — OptiBudget identifies security transactions that are not linked to
any movement, and movements in a securities account that are not linked to any
security transaction, so that the household can reconcile them.

**REQ-066** — A household can record a statement valuation for a security, with
the date the bank calculated it.

**REQ-067** — A household can record an indicative valuation for a security, with
the date it applies to.

**REQ-068** — An indicative valuation never replaces a statement valuation.
OptiBudget keeps both, and shows which kind any figure came from and its date.

**REQ-069** — OptiBudget shows the household's holdings as its positions valued at
the most recent valuation of each security, with the date and kind of each
valuation used.

**REQ-070** — OptiBudget shows the gain on a position: what the household would
receive for the units it still holds at their most recent valuation, plus what it
received for units already sold, plus the investment income the position has
paid, less the average cost of every unit it bought and less every fee charged.

**REQ-071** — OptiBudget shows the return on a position as its gain expressed as a
percentage of what the household paid.

**REQ-072** — Where OptiBudget shows a figure derived from average cost, it states
that average cost was used.

**REQ-073** — OptiBudget shows holdings separately from account balances. A
valuation is never part of a balance.

## Currency

**REQ-074** — Every figure OptiBudget presents for comparison, totalling, or
reporting is in euros.

**REQ-075** — Where a bank, a syndic, or a market states an amount in a currency
other than the euro, OptiBudget records that amount and its source currency
alongside the euro figure derived from it.

**REQ-076** — Wherever OptiBudget shows a figure it converted, it states the
exchange rate it used and the date that rate applied to.

**REQ-077** — OptiBudget does not forecast exchange rates, advise on them, or
convert money.

## Views

**REQ-078** — OptiBudget shows a view of one period, giving what came in, what
went out, and the balance of each account at the end of it.

**REQ-079** — OptiBudget shows a view of one year, giving the same figures for the
twelve periods it contains.

**REQ-080** — The period view and the year view break spending down the same way,
so that a household reading one can read the other without learning a second
layout.

**REQ-081** — OptiBudget shows how the household's money is divided among its
account roles and its holdings, at a stated date.

**REQ-082** — OptiBudget shows how that division has changed over a stated year.

## Correcting and trusting the data

**REQ-083** — A household can correct the category and the counterparty of any
movement, and can create or remove a transfer.

**REQ-084** — A household cannot change the date or the amount of an imported
movement. Those come from the bank.

**REQ-085** — A household can change the date and the amount of a movement it
entered by hand.

**REQ-086** — Every figure OptiBudget shows can be traced to the movements,
valuations, reference balances, and exchange rates it was derived from, and the
household can see them.

## Language and devices

**REQ-087** — OptiBudget presents itself in French.

**REQ-088** — OptiBudget presents itself in English and in Dutch.

**REQ-089** — A household can change the language OptiBudget uses without losing
anything it has recorded.

**REQ-090** — OptiBudget is usable on a personal computer running Windows and on
one running macOS.

**REQ-091** — OptiBudget is usable on a tablet.

**REQ-092** — OptiBudget is usable on a mobile telephone.

## What OptiBudget never does

**REQ-093** — OptiBudget never moves money, never instructs a bank, and never
connects to one. It reads what a bank has already produced.
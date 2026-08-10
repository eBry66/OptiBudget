# Glossary

One meaning per term. Every term used in `product/REQUIREMENTS.md`,
`product/SCOPE.md`, `product/ACCEPTANCE.md`, and `product/UX.md` is defined
here. A term with two meanings anywhere in the project is a defect in this file.

Terms are given in English. Where a Belgian or Luxembourgish term is the one the
household will recognise, it is named as the local equivalent. Local equivalents
are for recognition only; documents use the English term.

## People and ownership

**Household** — the unit whose money OptiBudget manages. All financial
information belongs to exactly one household.

**Member** — a person with access to a household's financial information. Access
is granted by membership of a household and by nothing else. No member of one
household can see the information of another. Version 1 has exactly one member
per household.

## Money and currency

**Reporting Currency** — the euro. Every figure OptiBudget presents for
comparison, totalling, or reporting is in euros.

**Source Currency** — the currency in which an amount was originally stated by
the bank, the syndic, or the market. Where it is not the reporting currency,
OptiBudget records the source amount and its currency alongside the euro figure
derived from it.

**Exchange Rate** — the rate, with the date it applied to, used to express a
source amount in the reporting currency. OptiBudget states the rate it used with
any figure it converted. It does not forecast rates or advise on them.

## Accounts

**Account** — a bank account held by the household. Every account has exactly one
role. OptiBudget recognises four roles, and a household may hold more than one
account in the same role.

**Spending Account** — an account from which the household pays third parties. It
is the only role that can pay a third party. Local equivalent: compte à vue
(BE), compte courant (LU).

**Provision Account** — a savings account holding enough money to pay at least
one full year of the household's provisioned expenses. It cannot pay a third
party. When such an expense falls due, money is moved from here to a spending
account, and the payment is made from there.

**Contingency Account** — a savings account holding money against large expenses
the household cannot predict: an accident, a serious illness, a structural
repair. Like a provision account, it cannot pay a third party. Money is moved
from here to a spending account when such an expense arises.

**Securities Account** — an account holding securities, linked to a spending
account. Local equivalents: compte-titres (BE), dossier titres (LU).

**Reference Balance** — the amount an account held on a stated date, recorded by
the household. Every balance OptiBudget shows is derived from a reference
balance and the movements recorded around it. Without one, the movements
OptiBudget holds give the change in an account, not its balance.

**Coverage Date** — the date through which OptiBudget holds the movements of an
account. A balance calculated for a date later than the coverage date rests on
the absence of movements rather than on their presence, and OptiBudget says so.

## Money moving

**Movement** — one line of an account's history: an amount, a date, a
description, and the account it belongs to. A movement is recorded by importing
it from a file the bank produced, or by the household entering it by hand.

**Transaction** — a movement in which money enters or leaves the household. A
payment to a third party, income received, a fee charged by a bank, a cash
withdrawal. Every movement is a transaction unless a transfer links it to
another.

**Transfer** — the fact that two movements in two accounts of the same household
are one displacement of money: a debit in one account and the matching credit in
the other. A transfer links two movements. It is not itself a movement, and it
does not replace or hide either of the movements it links. Money covered by a
transfer has not entered or left the household, so a transfer is never counted
as spending or as income.

**Transfer Candidate** — two movements OptiBudget believes may be the two sides
of a transfer. A candidate is not a transfer until the household confirms it.

**Counterparty** — who a transaction was with, as recorded in the movement's
description.

**Import** — reading a file a bank has exported, containing the movements of one
account, into OptiBudget.

**Transaction Reference** — an identifier a bank assigns to a movement and
includes in its export. Where a bank provides one, two movements of the same
account sharing a reference are the same movement. Not every bank provides one.

**Duplicate Candidate** — a movement in an import that OptiBudget believes it may
already hold, where no transaction reference is available to settle the
question. A duplicate candidate is not discarded until the household says so.

## Classifying spending

**Category** — the kind of thing a transaction was for. Categories are arranged
in exactly two levels: a parent category and, beneath it, leaf categories. Every
transaction has exactly one leaf category. Where a transaction covers more than
one kind of thing, it takes the leaf category of the dominant part.

**Uncategorised** — the leaf category a transaction takes when OptiBudget cannot
establish what it was for. It means the kind of spending is unknown, which is a
different thing from a known category whose reducibility has not been decided.

**Reducibility** — a property of a leaf category stating how far this household
could change what it spends there. Every leaf category has exactly one
reducibility value for a given household. OptiBudget supplies a default value
per category; the household may change it, because whether spending can be
avoided depends on the household's circumstances. A car is renounceable for a
household that could live without one and irreducible for a household that
cannot.

Reducibility values:

- **Renounceable** — the household could stop this spending entirely.
- **Reducible** — the household could spend less here without stopping.
- **Renegotiable** — the household could pay less for the same thing.
- **Irreducible** — the household cannot change this spending.
- **Arbitrage Needed** — the category holds spending that may or may not be
  reducible, and only the household can judge.
- **Card Statement Required** — the transaction is a card settlement covering
  several purchases, and the underlying spending cannot be classified from the
  bank export alone.
- **Unknown** — the category has not yet been given a reducibility value.

The first three values mean spending the household could act on. Irreducible
means spending it cannot. The last three mean the answer is not yet established.

**Provisioning** — a property of a leaf category stating whether this household
funds it in advance from a provision account rather than from the income of the
period in which it falls. It has two values: **Provisioned** and **Not
Provisioned**. OptiBudget supplies a default value per category; the household
may change it.

Reducibility and provisioning are independent. Reducibility asks how far the
spending could change. Provisioning asks where the money to pay it comes from. A
household can provision an annual holiday it could also renounce, and can decline
to provision an irreducible expense it prefers to absorb month by month.

## Expenses over time

**Period** — one calendar month. Every movement belongs to exactly one period.

**Year** — one calendar year. A year is twelve periods.

**Reference Period** — the most recent twelve complete periods. Calculations of
what a household must set aside are based on what it spent over its reference
period.

**Recurring Expense** — spending that repeats on a known rhythm. Monthly
recurring expenses fall in every period. Non-monthly recurring expenses fall
less often than every period, and are what a provision account exists to fund.

**Provision Target** — what a provision account must hold to cover one full year
of the household's provisioned expenses. It is calculated from what the
household spent on those categories over its reference period, increased by an
inflation rate.

**Inflation Rate** — the yearly rate by which past amounts are increased when
calculating a provision target. It defaults to two percent and the household may
change it.

**Contingency Target** — what a contingency account must hold. Unlike a provision
target it is not calculated. The household states it.

**Shortfall** — the amount by which an account's balance falls below its target.

## Co-ownership

**Co-ownership** — the legal association of the owners of a building, holding and
spending money on their behalf. Local equivalents: association des
copropriétaires / ACP (BE), vereniging van mede-eigenaars / VME (BE).

**Syndic** — the party that administers a co-ownership and invoices its members.

**Syndic Statement** — a document issued by the syndic to the household, stating
what it owes. A syndic statement is not a movement. Paying it is.

**Common Charges** — expenses of the co-ownership shared among its members in
proportion to their share of the building. Cleaning, lift maintenance,
common-area electricity, management fees.

**Individual Charges** — expenses the syndic bills to one household for its own
consumption, chiefly heating. Paid in advance against an estimate.

**Charge Settlement** — the syndic's statement of what a household's individual
charges actually came to over the co-ownership's financial year, set against what
it paid in advance. It produces an amount owed by or due to the household.

**Working Capital Fund** — money held by the co-ownership to pay its periodic
expenses, funded by advances from its members. A member's share is repayable when
the property is sold. Local equivalent: fonds de roulement.

**Reserve Fund** — money held by the co-ownership to pay expenses that do not
recur, such as replacing a lift or a roof. A member's share is not repayable on
sale unless the sale contract says so. Local equivalent: fonds de réserve.

**Fund Contribution** — a payment by the household into a working capital fund or
a reserve fund. A fund contribution is a transaction. It is not money the
household holds: the co-ownership holds the fund, and the household holds a claim
on it proportional to its share of the building. A contribution to a working
capital fund is attributable to the household and may be recovered on sale. A
contribution to a reserve fund is not.

Working Capital Fund and Reserve Fund always mean the co-ownership's money. They
never refer to an account held by the household.

## Investments

**Security** — one financial instrument that can be held in a securities account:
a share, a bond, a SICAV, a unit in a fund. Local equivalent: titre.

**Position** — the quantity of one security the household holds in one securities
account at a stated moment. Buying increases a position; selling reduces it. A
position of zero means the household no longer holds that security.

**Security Transaction** — the purchase or sale of a security: which one, whether
bought or sold, how many units, at what price, and what fee was charged. A
security transaction changes a position. It is settled by movements in the
household's accounts, and OptiBudget links it to them so that the same money is
never counted twice — once as the purchase and again as the payment.

**Investment Income** — money a security pays its holder without any part of the
position being sold: a dividend, a distribution, a coupon, interest.

**Average Cost** — what one unit of a position cost, taken as the total the
household paid for every unit it bought divided by the number of units bought.
Where a position was built by purchases at different prices, average cost is what
OptiBudget uses to say what a sold or held unit cost. OptiBudget states that it
uses average cost wherever it shows a figure derived from it.

**Valuation** — the value of one unit of a security on a stated date. A valuation
is not a movement: it changes what the household's holdings are worth without any
money changing hands. Every valuation is of one of two kinds, and the kind is
always recorded.

**Statement Valuation** — a valuation calculated by the bank on the closing date
of a period it reports on, typically a quarter or a year. It is the authoritative
record of what a security was worth on that date, and is never replaced or
overwritten. Local equivalent: valeur d'inventaire.

**Indicative Valuation** — a valuation the household records for a security on a
date of its choosing, taken from a public quotation. It exists so the household
can see what its holdings are worth today rather than at the last statement date.
It is not authoritative and never replaces a statement valuation.

**Gain** — what a position has earned or lost, in euros: what the household would
receive for the units it still holds at their most recent valuation, plus what it
received for units already sold, plus the investment income the position has
paid, less the average cost of every unit it bought and less every fee charged.

**Return** — a gain expressed as a percentage of what the household paid. Gain and
return are both stated net of fees, and both are stated against a named
valuation, with its date and kind.

## Balances and views

**Balance** — the amount of money an account holds at a stated moment, derived
from its reference balance and the movements recorded around it. Every balance is
shown with the coverage date of its account. A balance is money only. A valuation
is never part of a balance.

**Holdings** — what the household owns in its securities accounts: its positions,
each valued at the most recent valuation of the security. Holdings are stated
separately from balances, and where they are shown, the date and kind of the
valuations used are shown with them.
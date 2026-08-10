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

## Accounts

**Account** — a bank account held by the household. Every account has exactly one
role. OptiBudget recognises four.

**Spending Account** — the account from which the household pays third parties.
It is the only account that can pay a third party. Local equivalent: compte à
vue (BE), compte courant (LU).

**Provision Account** — a savings account holding enough money to pay at least
one full year of the household's non-monthly recurring expenses. It cannot pay a
third party. When such an expense falls due, money is transferred from here to
the spending account, and the payment is made from there.

**Contingency Account** — a savings account holding money against large expenses
the household cannot predict: an accident, a serious illness, a structural
repair. Like the provision account, it cannot pay a third party. Money is
transferred from here to the spending account when such an expense arises.

**Securities Account** — an account holding securities, linked to a spending
account. Local equivalents: compte-titres (BE), dossier titres (LU).

## Money moving

**Movement** — any change of money recorded by OptiBudget. Every movement is
either a transaction or a transfer, never both.

**Transaction** — a movement in which money enters or leaves the household. A
payment to a third party, income received, a fee charged by a bank.

**Transfer** — a movement of money between two accounts held by the same
household. A transfer does not change what the household owns. It appears in the
bank exports of both accounts, as a debit in one and a credit in the other, and
OptiBudget records those two lines as one transfer.

Paying an expense from provisioned money is two movements: a transfer from the
provision account to the spending account, then a transaction from the spending
account to the third party. Only the transaction is spending.

**Import** — the act of reading a bank's exported file of movements for one
account into OptiBudget.

## Classifying spending

**Category** — the kind of thing a transaction was for. Categories are arranged
in exactly two levels: a parent category and, beneath it, leaf categories. Every
transaction has exactly one leaf category. Where a transaction covers more than
one kind of thing, it takes the leaf category of the dominant part.

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
funds it in advance from the provision account rather than from the income of
the period in which it falls. It has two values: **Provisioned** and **Not
Provisioned**. Provisioning applies only to categories whose reducibility is
irreducible, because spending the household could avoid is not worth funding in
advance. OptiBudget supplies a default value per category; the household may
change it.

Reducibility and provisioning are independent properties answering different
questions. Reducibility asks how far the spending could change. Provisioning
asks where the money to pay it comes from.

## Expenses over time

**Period** — one calendar month. Every movement belongs to exactly one period.

**Year** — one calendar year. A year is twelve periods.

**Recurring Expense** — spending that repeats on a known rhythm. Monthly
recurring expenses fall in every period. Non-monthly recurring expenses fall
less often than every period, and are what the provision account exists to fund.

## Co-ownership

**Co-ownership** — the legal association of the owners of a building, holding and
spending money on their behalf. Local equivalents: association des
copropriétaires / ACP (BE), vereniging van mede-eigenaars / VME (BE).

**Syndic** — the party that administers a co-ownership and invoices its members.

**Syndic Statement** — a document issued by the syndic to the household, stating
what it owes. A syndic statement is not itself a movement. Paying it is.

**Common Charges** — expenses of the co-ownership shared among its members in
proportion to their share of the building. Cleaning, lift maintenance,
common-area electricity, management fees.

**Individual Charges** — expenses the syndic bills to one household for its own
consumption, chiefly heating. Paid in advance against an estimate and settled
against actual use at the end of the co-ownership's financial year.

**Working Capital Fund** — money held by the co-ownership to pay its periodic
expenses, funded by advances from its members. A member's share is repayable
when the property is sold. Local equivalent: fonds de roulement.

**Reserve Fund** — money held by the co-ownership to pay expenses that do not
recur, such as replacing a lift or a roof. A member's share is not repayable on
sale unless the sale contract says so. Local equivalent: fonds de réserve.

**Fund Contribution** — a payment by the household into the working capital fund
or the reserve fund. A fund contribution is a transaction. Whether the household
can recover it later depends on which fund received it.

Working Capital Fund and Reserve Fund always mean the co-ownership's money. They
never refer to an account held by the household.

## Investments

**Security** — one financial instrument that can be held in a securities
account: a share, a bond, a SICAV, a unit in a fund. Local equivalent: titre.

**Position** — the quantity of one security the household holds in one securities
account at a stated moment. Buying increases a position; selling reduces it. A
position of zero means the household no longer holds that security.

**Valuation** — the value of one unit of a security on a stated date. A valuation
is not a movement: it changes what the household's holdings are worth without
any money changing hands. Every valuation is of one of two kinds, and the kind
is always recorded.

**Statement Valuation** — a valuation calculated by the bank on the closing date
of a period it reports on, typically a quarter or a year. It is the
authoritative record of what a security was worth on that date. A statement
valuation is never replaced or overwritten. Local equivalent: valeur
d'inventaire.

**Indicative Valuation** — a valuation the household records for a security on a
date of its choosing, taken from a public quotation. It exists so the household
can see what its holdings are worth today rather than at the last statement
date, when deciding whether to buy or sell. It is not authoritative and never
replaces a statement valuation.

## Balances and views

**Balance** — the amount of money an account holds at a stated moment, derived
from the movements imported for it.

**Holdings** — what the household owns in its securities accounts: its positions,
each valued at the most recent valuation of the security. Holdings are stated
separately from balances, because a balance derives from movements and a
valuation does not. Where holdings are shown, the date and kind of the
valuations used are shown with them.
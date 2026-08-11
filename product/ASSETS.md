# Assets

Logos, fonts, colours, icons, and their licences. This document states what
OptiBudget is built from visually. It does not specify a technology, a
framework, or how these are implemented — that belongs to `engineering/`.

## Logo

OptiBudget has a mark: a house roof and chimney above an "OB" monogram,
where the "O" is a ring containing an ascending three-bar chart. Four
variants exist:

| Variant | Fill | Ground |
|---|---|---|
| Colour, primary | White symbol | OptiBudget Teal circle |
| Colour, reversed | OptiBudget Teal symbol and outline | White |
| Monochrome, primary | White symbol | Black circle |
| Monochrome, reversed | Black symbol and outline | White |

The teal pair is the OptiBudget mark. The monochrome pair exists for
single-colour reproduction and for contexts that reference the parent
identity, Kaboosha, which remains black and white — OptiBudget's own
identity is the teal pair, and teal is what distinguishes the product from
its parent at a glance.

No wordmark-only form. The mark always appears complete; it is not
subdivided or redrawn.

### Where the files live

`assets/brand/`, at the repository root. Not `product/` — that folder holds
markdown documents, not binary assets. Not a framework asset folder either,
since `engineering/ARCHITECTURE.md` has not yet chosen a framework; any
coding vendor drafting engineering documents reads the logo from this path
regardless of what it later builds.

| File | Variant |
|---|---|
| `assets/brand/optibudget-mark-color-on-teal.png` | Colour, primary |
| `assets/brand/optibudget-mark-color-on-white.png` | Colour, reversed |
| `assets/brand/optibudget-mark-mono-on-black.png` | Monochrome, primary |
| `assets/brand/optibudget-mark-mono-on-white.png` | Monochrome, reversed |

PNG is the only format available; there is no vector (SVG) source. If a
vector source is produced later, adding it is a future revision of this
document, not an assumption made now. Any use requiring scaling beyond the
exported resolution (large-format printing, very small favicons) waits on
that revision. Original artwork; owned by the household; no external
licence applies.

## Colour

**OptiBudget Teal — `#007F78`** is the one brand colour: primary actions,
links, active states, and the primary logo fill. It appears nowhere else,
and no other colour competes with it for that role.

**Neutral base**

| Role | Hex |
|---|---|
| Page background | `#FAFAF8` |
| Card / surface background | `#FFFFFF` |
| Border | `#E4E2DA` |
| Text, primary | `#1C1C1A` |
| Text, secondary | `#6B6B66` |
| Text, muted | `#9A9A94` |

**Semantic colours** — reserved. They mark the sign of a figure (a balance,
a gain, an amount entering or leaving) or an error state. They are never
used for decoration or general UI emphasis, and never substitute for the
brand teal.

| Role | Hex | Meaning |
|---|---|---|
| Positive | `#2F6D3B` | A positive balance, gain, or confirmation |
| Negative | `#A33A2E` | A negative balance, loss, or error |

Positive green and OptiBudget Teal are both blue-adjacent greens; kept
distinct on purpose (teal reads blue-cyan, positive reads yellow-green) so
a balance figure is never mistaken for a brand accent or vice versa. Note
also that "Positive" and "Negative" here name balance-sign colours, not the
logo's colour/monochrome variants above — the two use unrelated vocabulary
on purpose.

No colour in this document encodes Reducibility or Provisioning; those are a
`product/UX.md` decision, made when that document is drafted, and may draw
from this palette without extending it.

## Typography

**Inter**, a single sans-serif typeface for all weights and sizes. Licensed
under the SIL Open Font License 1.1 — free for commercial use, may be
self-hosted or served, no attribution required in the product itself.
Supports full Latin diacritics, which French (REQ-087) requires.

No second typeface. No serif, no monospace, anywhere in the product.

## Icons

**Lucide** — an open-source icon set, MIT licensed, free for commercial use
with no attribution required. Chosen as the default for its coverage of
financial and household-management concepts (accounts, transfers, categories,
charts) and its single-weight, outline style, which matches the calm,
neutral colour direction above.

Icons are used functionally — to label an action or a concept — never
decoratively.

## Licence summary

| Asset | Licence | Attribution required |
|---|---|---|
| OptiBudget logo (4 variants, PNG, `assets/brand/`) | Original artwork, owned by the household | No |
| Inter (typeface) | SIL Open Font License 1.1 | No |
| Lucide (icons) | MIT | No |

Nothing in this document requires payment, renewal, or a licence key.
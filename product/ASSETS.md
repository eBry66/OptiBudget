# Assets

Logos, fonts, colours, icons, and their licences. This document states what
OptiBudget is built from visually. It does not specify a technology, a
framework, or how these are implemented — that belongs to `engineering/`.

## Logo

OptiBudget has no graphic mark. The product identifies itself with a text
wordmark: "OptiBudget", set in the primary typeface at semibold weight, in
the primary text colour. No icon, symbol, or mascot accompanies it.

If a graphic mark is designed later, it is added here and this document is
re-approved. Until then, any screen or document showing a logo shows the
wordmark alone.

## Colour

A neutral base with one accent colour, plus two semantic colours reserved for
financial meaning rather than general emphasis.

**Neutral base**

| Role | Hex |
|---|---|
| Page background | `#FAFAF8` |
| Card / surface background | `#FFFFFF` |
| Border | `#E4E2DA` |
| Text, primary | `#1C1C1A` |
| Text, secondary | `#6B6B66` |
| Text, muted | `#9A9A94` |

**Accent** — used for primary actions, links, and active states. Nowhere
else.

| Role | Hex |
|---|---|
| Accent | `#B5651D` |

**Semantic colours** — reserved. They mark the sign of a figure (a balance,
a gain, an amount entering or leaving) or an error state. They are never used
for decoration or for general UI emphasis, and never substitute for the
accent colour.

| Role | Hex | Meaning |
|---|---|---|
| Positive | `#2F6D3B` | A positive balance, gain, or confirmation |
| Negative | `#A33A2E` | A negative balance, loss, or error |

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
| Inter (typeface) | SIL Open Font License 1.1 | No |
| Lucide (icons) | MIT | No |

Nothing in this document requires payment, renewal, or a licence key.
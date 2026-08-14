# Document Conventions

Machinery. Applies to every document in this repository that defines a
literal, machine-matchable contract for how other content must be
structured — naming patterns, field lists, ID formats, heading shapes.
Examples already in this repository: `engineering/TESTING.md`'s test
naming contract, `product/ACCEPTANCE.md`'s `AC-0NN` pattern,
`product/DECISIONS.md`'s Decided/Why/Rules-out shape.

## Self-containment

A document that defines a contract states that contract in a section
within itself — typically titled `## Format` — not in a separate spec
file and not only in chat history or a handoff. Anyone reading the
governed document alone must be able to produce a compliant entry without
consulting anything else.

## Heading nesting

A repeated structural unit (a log entry, a table row equivalent, a list
item standing in for a heading) is nested one level below the section
that introduces it. If `## Log` introduces entries, entries are `###`,
never `##`. A sibling-level heading for a repeated unit is a format
violation, not a style choice.

## Field lists

Where a document requires an ordered, labelled set of fields per entry
(`DEPENDENCIES.md`'s eight fields; `DECISIONS.md`'s Decided/Why/Rules
out/Revisit when), the governing document states: the exact field labels,
in the exact required order, and which fields are conditionally required
(e.g. a field that's only valid when another field holds a specific
value). "Roughly these fields" is not a contract.

## ID and heading grammar

Where entries are identified by a generated string (`AC-0NN`, `DOC-0NN`,
a package-name-and-version heading), the exact grammar is stated as a
literal pattern, not described in prose. `### <package> <version> —
<YYYY-MM-DD>` is a contract; "a heading with the package name and date"
is not.

## Discovery

Any vendor session's read-before-acting sequence (`AGENTS.md`'s "Read
before doing anything" list, `orchestration/BOOTSTRAP.md`'s session-
opening block) includes this document. A vendor drafting or reviewing any
structured document checks this file's rules apply, then checks the
governed document's own `## Format` section for the specifics.

## Verification method

Two standing rules for how any text edit in this repository is made and
checked, established after repeated, verified failures of the informal
alternatives during 2026-08-14 governance work.

**Writing:** never place a blank line inside a PowerShell here-string
(`@'...'@`) that will be pasted into an interactive console session.
Paste handling has silently dropped interior blank lines multiple times,
even though the write call itself (`WriteAllText`, `AppendAllText`)
executed without error. Where a blank line is structurally required,
build it explicitly in code — split the content at that point and join
the parts with an explicit line-break sequence — rather than including it
literally inside the here-string body.

**Verifying:** after any text edit, confirm the result with
`Select-String -Path <file> -Pattern "<text near the edit>" -Context 2,2`
at every point a blank line or other whitespace-sensitive join was made.
Do not rely on `git diff` alone — its hunk-context trimming can make a
missing blank line indistinguishable from a correctly present one when
read casually. Do not rely on `Get-Content -Raw` pasted into chat —
console rendering has produced both corrupted characters and apparently
missing blank lines that were not actually present in the file.
`Select-String -Context` has been reliable without exception; the other
two have each been misleading at least once.

This applies to every text edit in this repository, not only cases where
a problem is suspected.
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
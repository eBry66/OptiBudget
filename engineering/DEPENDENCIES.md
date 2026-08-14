# Dependencies

Append-only log of every runtime dependency added to OptiBudget, for
release-management-grade tracking. This is not an ADR and not a decision
record — `product/DECISIONS.md` records why a dependency was chosen when
that choice is significant enough to warrant one; this file records only
the fact that it was added, at what version, and what security check was
run against it. A dependency that changes the architecture — a new ORM, a
new state-management library, anything that constrains future choices or
is expensive to reverse — additionally requires a full ADR in
`engineering/adr/` per `orchestration/PROJECT_RULES.md`. Ordinary
dependencies get an entry here and nothing more.

**Not a DOC-id.** This file is not entered in `orchestration/approvals.yaml`
or `orchestration/bootstrap.yaml` in this revision — see `product/
DECISIONS.md`, 2026-08-14, "Dependency tracking: two-phase approach." Do
not reference `next.mjs approve` for this file; it is not gate-0 machinery
and carries no DOC-id. Whether it graduates to DOC-id treatment is a v2
question, revisited when `product/SCOPE.md` reopens.

**devDependencies are out of scope.** This log tracks runtime
(`dependencies`) packages only — code that ships and executes in
production. Build- and test-time tooling (TypeScript, Vitest, Tailwind,
type-only `@types/*` packages) is not logged here.

## Format

`## Log` (below) introduces the repeated structural unit, so every entry
is a level-3 heading, nested one level below it, per `orchestration/
DOCUMENT_CONVENTIONS.md`.

**Heading grammar** — the exact literal pattern, for a normal addition:

```
### <package-name>@<version>
```

and, for a removal, the same pattern suffixed:

```
### <package-name>@<version> (removed)
```

`<version>` is the version being removed (the last version in use) on a
removal entry.

**Field list** — every entry, regardless of heading, carries exactly these
eight fields, in this exact order, as a bullet list immediately below the
heading. All eight are mandatory on every entry; none is conditional:

```
### <package-name>@<version>

- **Package name:** <package name>
- **Version:** <version>
- **Reason:** <one-line reason>
- **Added by:** <task-0NN | HITL>
- **Date:** <YYYY-MM-DD>
- **Security check method:** <e.g. "npm audit", "manually checked osv.dev">
- **Checked at:** <YYYY-MM-DD>
- **Result:** <e.g. "0 vulnerabilities found">
```

`Added by` is exactly one of two values: the task id, `task-0NN`, when the
entry lands through the task pipeline, or `HITL`, when added directly,
outside a task. No other value is valid — not a vendor name, not a
free-text description of who or what made the change.

`Package name` and `Version` restate what the heading already carries —
kept as their own fields, not folded away, so a script reading the field
list alone (without parsing the heading) still gets the complete record.
`Security check method` names the exact method used (a tool name or
"manually checked <source>") — a `Result` with no named `Security check
method` is not verifiable and must be rejected by whoever reviews the
entry. `Checked at` is the date the check ran, which may differ from
`Date` (the date the dependency was added); a result is evidence for that
point in time only, not a permanent claim that the dependency remains
safe.

Entries are appended in chronological order, newest at the bottom, matching
`product/DECISIONS.md`'s convention.

**Entries are never edited or deleted once added — the log is append-only.**
A version bump gets its own new entry: same package name, the new version
in both the heading and the `Version` field, and a `Reason` stating what
changed. A removal also gets its own new entry: same package name, heading
and `Version` field as described above under Heading grammar, and `Reason`
stating why it was removed. Nothing is ever amended in place.

## Log

### next@16.3.0

- **Package name:** next
- **Version:** 16.3.0
- **Reason:** Application framework, set by `engineering/ARCHITECTURE.md` (DOC-015).
- **Added by:** HITL
- **Date:** 2026-08-12
- **Security check method:** npm audit
- **Checked at:** 2026-08-14
- **Result:** 0 vulnerabilities found (0 info, 0 low, 0 moderate, 0 high, 0 critical)

### react@19.1.0

- **Package name:** react
- **Version:** 19.1.0
- **Reason:** UI library required by Next.js 16.3.0.
- **Added by:** HITL
- **Date:** 2026-08-12
- **Security check method:** npm audit
- **Checked at:** 2026-08-14
- **Result:** 0 vulnerabilities found (0 info, 0 low, 0 moderate, 0 high, 0 critical)

### react-dom@19.1.0

- **Package name:** react-dom
- **Version:** 19.1.0
- **Reason:** DOM renderer required alongside React 19.1.0.
- **Added by:** HITL
- **Date:** 2026-08-12
- **Security check method:** npm audit
- **Checked at:** 2026-08-14
- **Result:** 0 vulnerabilities found (0 info, 0 low, 0 moderate, 0 high, 0 critical)

### @supabase/supabase-js@2.45.0

- **Package name:** @supabase/supabase-js
- **Version:** 2.45.0
- **Reason:** Supabase client library, set by `engineering/ARCHITECTURE.md` (DOC-015).
- **Added by:** HITL
- **Date:** 2026-08-12
- **Security check method:** npm audit
- **Checked at:** 2026-08-14
- **Result:** 0 vulnerabilities found (0 info, 0 low, 0 moderate, 0 high, 0 critical)

### @supabase/ssr@0.5.0

- **Package name:** @supabase/ssr
- **Version:** 0.5.0
- **Reason:** Server-side Supabase session handling for Next.js Server Actions/Server Components, per `engineering/ARCHITECTURE.md` (DOC-015).
- **Added by:** HITL
- **Date:** 2026-08-12
- **Security check method:** npm audit
- **Checked at:** 2026-08-14
- **Result:** 0 vulnerabilities found (0 info, 0 low, 0 moderate, 0 high, 0 critical)

### lucide-react@0.460.0

- **Package name:** lucide-react
- **Version:** 0.460.0
- **Reason:** Icon set, set by `product/ASSETS.md` (DOC-014, "Lucide icons").
- **Added by:** HITL
- **Date:** 2026-08-12
- **Security check method:** npm audit
- **Checked at:** 2026-08-14
- **Result:** 0 vulnerabilities found (0 info, 0 low, 0 moderate, 0 high, 0 critical)

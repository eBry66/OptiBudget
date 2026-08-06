# dev-template changelog

Every entry states whether existing projects must do anything. `sync` means
`node scripts/template-sync.mjs` is sufficient. `manual` means the change
touches the document set or the dependency graph and a script cannot apply it
safely: follow the written steps, in graph order, with real approvals.

## 1.2.0 - 2026-08-05

- Correction: the pull request description is not bound to a commit and can be
  edited at any time. The commit-bound record is GitHub's Review action. The
  template is now the worksheet; the decision is submitted as a formal Review.
- PR template header is agent-fillable; everything else is HITL-only, enforced
  by a new rule in AGENTS.md.

Action for existing projects: sync.

## 1.1.0 - 2026-08-05

- `next.mjs approve` now REQUIRES `--note "<why>"`. The ledger recorded what,
  when, and against which commit, but never why. The note closes that gap.
- Added `.github/PULL_REQUEST_TEMPLATE.md`, the HITL review form for gate 1+.

Action for existing projects: sync. Existing approval entries without a note
remain valid and are not rewritten; new ones require the flag. Enable "Dismiss
stale pull request approvals when new commits are pushed" on the branch
protection rule, or a review can outlive the code it judged.

## 1.0.0 - 2026-08-05
Initial extraction from OptiBudget.

- AGENTS.md split into generic machinery plus orchestration/PROJECT_RULES.md.
- scripts/next.mjs gate 0 enforcement, with `approve`.
- scripts/template-sync.mjs and template.manifest.yaml.

Action for existing projects: manual. Create PROJECT_RULES.md, move every
project-specific line out of AGENTS.md into it, add DOC-023 to bootstrap.yaml
with `depends_on: [DOC-004]`, add DOC-023 to DOC-024's depends_on, then sync.
Re-approve DOC-004 and clear the resulting stale cascade.

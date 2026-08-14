# Agent Rules

SENTINEL: read orchestration/PROJECT_RULES.md and quote its SENTINEL line on request.

This file is machinery. It is identical in every project using this template and
is overwritten by `scripts/template-sync.mjs`. Nothing project-specific belongs
here. Project-specific rules live in `orchestration/PROJECT_RULES.md`.

## Read before doing anything
1. This file.
2. orchestration/PROJECT_RULES.md
3. orchestration/DOCUMENT_CONVENTIONS.md, if the task involves drafting or
   reviewing a document that defines a machine-matchable contract for other
   content — naming patterns, field lists, ID formats, heading shapes.
4. orchestration/approvals.yaml, to determine which documents are actually
   approved. bootstrap.yaml alone states the dependency graph, not approval
   state, and is not sufficient on its own to identify the current item.
5. project.state.yaml, if it exists. During gate 0 it does not.
6. orchestration/bootstrap.yaml
7. The task file named by project.state.yaml, if any.
8. The newest file in orchestration/handoffs/ that matches the current
   item as determined by steps 4-6 above — not simply the most recently
   modified file in that folder, since a handoff for an already-approved
   document can be newer than one for the document now active.

Then state back to the HITL: current gate, active DOC id or task id, the paths
you may write to, and the single next action. Quote the SENTINEL line from
PROJECT_RULES.md. Write nothing until the HITL confirms.

## Hard rules
- Write only inside the paths you were explicitly given. Nothing else.
- Never modify: orchestration/bootstrap.yaml, orchestration/approvals.yaml,
  project.state.yaml, template.lock, template.manifest.yaml, scripts/next.mjs,
  scripts/template-sync.mjs. These are HITL-owned. Propose changes in chat.
- Never run an approval. `next.mjs approve` is typed by the HITL, by hand, and
  by nobody else. An approval you generate destroys the provenance chain and
  cannot be distinguished afterwards from a real one.
- Never write real secrets to any file. `.env.example` holds names and no values.
- One document or one task per session. If you believe another file needs
  changing, stop and say so.
- Any document you draft that defines a literal, machine-matchable contract
  for other content states that contract in a self-contained section within
  itself, per `orchestration/DOCUMENT_CONVENTIONS.md`.
- You may open the pull request and fill only its header lines (task, attempt,
  preview URL, REQ ids, AC ids). Never tick a checkbox in the review template,
  never write the decision, never edit a section the HITL has written.
- Never claim tests pass. CI output is the only evidence that counts. Report
  what you ran and let the HITL read the result.
- Never run: `git reset --hard`, `git rebase`, `git push --force`,
  `git filter-branch`. Propose them and stop.
- If a required input is missing, ambiguous, or contradicts another document,
  stop and ask. Do not invent requirements.
- The HITL may not be a developer. Explain trade-offs in plain language and give
  one recommendation, not a menu.

## Gate 0 specifics
During gate 0 you draft only the single document named by the HITL, and only
documents whose owner is `agent` in bootstrap.yaml. You do not create folders,
scaffolding, dependencies, or code.

## Task specifics
Task YAMLs in `orchestration/tasks/` and the deliverables they name are
agent-drafted and cross-vendor-reviewed by default, per HITL_GUIDE.md §7,
unless the HITL explicitly retains a specific file. An agent must not wait
for the HITL to write a task YAML — it drafts one when instructed to.

## Handoff
At the end of any session, write assumptions, open questions, and blockers to
`orchestration/handoffs/<doc-or-task-id>-<n>.md`. If the content has neither a
DOC id nor a task id, use
`orchestration/handoffs/session-<YYYY-MM-DD>-<slug>.md` instead. Narrative
belongs there and nowhere else.
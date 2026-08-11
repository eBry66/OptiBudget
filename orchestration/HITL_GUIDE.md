# OptiBudget HITL Guide v3

Windows 11 · VS Code · Git · GitHub · Vercel · Supabase
Audience: one non-technical HITL, working alone.
Supersedes: OptiBudget_HITL_Guide_2.docx

Revision note (this version): added `assets/brand/` to the standard folder
set (sections 3, 4.14), documented where binary brand assets live relative
to `product/ASSETS.md` (section 6.8), added `assets/**` to the template
content boundary (section 13.2), and brought the guide itself into the
approval graph as DOC-026 with `owner: hitl`, `depends_on: []` (sections
4.3, 4.13) — tracked the same way `AGENTS.md` already is.

## 0. How to Use This Guide

If you have never used Git and do not know what a commit is, read Appendix A at the end of this document first. Nothing in sections 2 to 5 will make sense without it.

Read section 1 fully before touching anything. Then execute sections 2 to 5 in order, top to bottom, without skipping. Every file you need is written out verbatim in section 4 — nothing in this guide says "copy the structure from elsewhere".

Rule for the whole document: if a step does not tell you exactly what to type or exactly what to paste, it is a defect. Report it rather than improvising.

Estimated time: 3 to 5 hours for sections 2 to 4, then 30 to 90 minutes per document in section 5. Gate 0 is roughly 15 to 25 hours of your time. That number is a fact, not a discouragement — decide now whether you accept it.

### Notation

- [P] permanent memory, [M] this project, [I] inference, [U] unknown.
- DOC-0NN ids are labels used by the enforcement script. They are not filenames.

## 1. Before You Start

### 1.1 Accounts and paid plans

This is the single most common way a rookie stalls on day one: the tool installs, then refuses to run because the free tier does not include it.

- Claude Code requires a Pro, Max, Team, Enterprise, or Console (API) account. The free Claude.ai plan does not include Claude Code access. Source: https://code.claude.com/docs/en/setup
- OpenAI Codex requires a paid ChatGPT plan or API billing. [I] Verify at the point of sign-in.
- Grok Build requires a SuperGrok or X Premium+ subscription, or an xAI API key. The free Grok tier does not include the coding agent. [I, from vendor-adjacent documentation, not xAI first-party docs]
- Mistral Code plan requirements: [U]. Verify before relying on it.
- GitHub: free plan is sufficient. Branch protection on public repositories is free; on private repositories it requires a paid plan. [I] If you keep OptiBudget private on the free plan and cannot enable branch protection, say so and stop — the entire enforcement design assumes it.
- Vercel Hobby: sufficient for previews. Commercial use is not permitted on Hobby.
- Supabase: free tier is sufficient to start. You need two projects.

### 1.2 How many vendors you actually need

Two. One implements, a different one reviews. That is the only rule that matters [M].

The uploaded guide adds Grok as a fourth vendor. There is no first-party xAI VS Code extension; the working route is the Grok Build CLI plus a community extension that is explicitly not affiliated with xAI. Adding it costs you a fourth config surface, a fourth subscription, and a third-party extension in your finance-app repository, in exchange for a third opinion you rarely need. Decision: start with two (Claude Code and Codex). Add Mistral only if you hit a case where the two disagree and you cannot arbitrate. Do not install Grok during gate 0.

### 1.3 What blocks everything

`product/ACCEPTANCE.md` and `engineering/TESTING.md` are the semantic ceiling of the whole system [M]. No script can check whether an acceptance criterion is meaningful. If those two documents are vague, every green CI check downstream is theatre. Budget your best thinking there, not on the config files.

## 2. Machine Setup

### 2.1 Git

1. Download Git for Windows from https://git-scm.com/downloads/win and install with default options.
2. Open PowerShell and run:

```powershell
git --version
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
```

The two `config` lines are not optional. Without them your first commit fails with "Please tell me who you are" and a rookie reads that as a broken install.

### 2.2 VS Code

Download from https://code.visualstudio.com. During install, tick "Add to PATH" so that `code .` works from PowerShell.

### 2.3 Node.js

Download the LTS installer from https://nodejs.org. Restart PowerShell, then:

```powershell
node -v
npm -v
```

Node 22 or later. Node is required for `scripts/next.mjs` and later for the app itself. It is not required by the Claude Code native installer.

### 2.4 Claude Code

Native install, from PowerShell (not as Administrator):

```powershell
irm https://claude.ai/install.ps1 | iex
claude --version
claude doctor
```

If you see `'irm' is not recognized`, you are in CMD, not PowerShell. Your prompt shows `PS C:\` in PowerShell.

Then, from inside `C:\Dev\OptiBudget`, run `claude` and follow the browser login prompt. Source: https://code.claude.com/docs/en/setup

The VS Code extension is optional. The CLI is the product; the extension is an interface on top of it. Install the extension only after the CLI works.

### 2.5 OpenAI Codex

Install Codex per OpenAI's current instructions and sign in. [U] Exact install command as of today — check the vendor page rather than trusting any guide, including this one.

### 2.6 Verifying that a vendor actually loaded your rules

This is the step the uploaded guide is missing entirely, and it is the difference between a governed agent and an unsupervised one.

`orchestration/PROJECT_RULES.md` in section 4.5 contains a line:

```
SENTINEL: OB-7Q4
```

At the first session with every vendor, in the project folder, ask exactly this:

```
Without searching the web, quote the SENTINEL line from
orchestration/PROJECT_RULES.md.
```

This tests the whole chain in one question: the vendor config had to load
`AGENTS.md`, and `AGENTS.md` had to send it on to `PROJECT_RULES.md`. A vendor
that answers correctly has read both.

If the vendor returns `OB-7Q4`, its configuration loaded. If it does not, its config file is wrong or unsupported, and every rule you wrote is being ignored. Fix that before writing a single document. Re-run this test after any change to `AGENTS.md`, `PROJECT_RULES.md`, the vendor config files, or a template sync.

## 3. Repository Creation

Run these two lines first, alone, and read the output before doing anything else:

```powershell
mkdir C:\Dev\OptiBudget
cd C:\Dev\OptiBudget
pwd
```

`pwd` must print `C:\Dev\OptiBudget`. If it prints anything else — most often `C:\Users\<you>` — stop. Do not run the next block. Every command below acts on whatever folder you are standing in, and PowerShell will carry them out in your home directory without complaint. See section 11.1 for how to undo that.

Only once `pwd` is correct:

```powershell
git init
mkdir orchestration, orchestration\tasks, product, engineering, engineering\adr, assets\brand, scripts, tests, src, supabase, supabase\migrations, .codex, .claude, .github, .github\workflows
code .
```

On github.com create an empty repository named `OptiBudget` with no README, no .gitignore, no licence. Then:

```powershell
git remote add origin https://github.com/YOUR-USERNAME/OptiBudget.git
```

Do not enable branch protection yet. See section 8.1 for why.

## 4. The Files, Verbatim

Create each file exactly as written. Then commit once at the end of this section:

```powershell
git add .
git commit -m "Bootstrap: config, dependency graph, enforcement script"
git branch -M main
git push -u origin main
```

### 4.1 .gitattributes

```
* text=auto eol=lf
```

### 4.2 .gitignore

```
node_modules/
.env
.env.local
.env.*.local
.vercel
.svelte-kit/
.next/
dist/
build/
coverage/
*.log
.DS_Store
Thumbs.db
```

### 4.3 orchestration/bootstrap.yaml

Two defects in the uploaded version are corrected here. First, `engineering/TESTING.md` was listed as two documents (#17 and #20) sharing one path; commit-hash staleness cannot distinguish two ids on one file, so part B is now its own file, `engineering/CHECK_MAP.md`. Second, `AGENTS.md` was listed twice (#4 and #23); it is now one document, DOC-004, revised and re-approved at the end of gate 0 like any other change. DOC-023 is reused for `orchestration/PROJECT_RULES.md`, which holds everything about this project that `AGENTS.md` must not contain (section 13).

Formatting rule: keep this exact shape. One list item per document, four keys, arrays inline in square brackets. The reader in `next.mjs` is deliberately restricted and will not parse anything fancier.

```yaml
version: 1
documents:
  - id: DOC-001
    path: .gitattributes
    owner: hitl
    depends_on: []
  - id: DOC-002
    path: .gitignore
    owner: hitl
    depends_on: []
  - id: DOC-003
    path: orchestration/bootstrap.yaml
    owner: hitl
    depends_on: []
  - id: DOC-004
    path: AGENTS.md
    owner: hitl
    depends_on: [DOC-003]
  - id: DOC-005
    path: CLAUDE.md
    owner: hitl
    depends_on: [DOC-004]
  - id: DOC-006
    path: .codex/config.toml
    owner: hitl
    depends_on: [DOC-004]
  - id: DOC-007
    path: .claude/settings.json
    owner: hitl
    depends_on: [DOC-004]
  - id: DOC-008
    path: product/PRODUCT.md
    owner: hitl
    depends_on: [DOC-004]
  - id: DOC-009
    path: product/GLOSSARY.md
    owner: hitl
    depends_on: [DOC-008]
  - id: DOC-010
    path: product/DECISIONS.md
    owner: hitl
    depends_on: [DOC-008]
  - id: DOC-011
    path: product/REQUIREMENTS.md
    owner: hitl
    depends_on: [DOC-009]
  - id: DOC-012
    path: product/SCOPE.md
    owner: hitl
    depends_on: [DOC-011]
  - id: DOC-013
    path: product/ACCEPTANCE.md
    owner: hitl
    depends_on: [DOC-012]
  - id: DOC-014
    path: product/ASSETS.md
    owner: hitl
    depends_on: [DOC-012]
  - id: DOC-015
    path: engineering/ARCHITECTURE.md
    owner: agent
    depends_on: [DOC-012]
  - id: DOC-016
    path: engineering/THREAT_MODEL.md
    owner: agent
    depends_on: [DOC-015]
  - id: DOC-017
    path: engineering/TESTING.md
    owner: hitl
    depends_on: [DOC-013]
  - id: DOC-018
    path: package.json
    owner: agent
    depends_on: [DOC-015]
  - id: DOC-019
    path: .env.example
    owner: agent
    depends_on: [DOC-016]
  - id: DOC-020
    path: engineering/CHECK_MAP.md
    owner: hitl
    depends_on: [DOC-017, DOC-018]
  - id: DOC-021
    path: orchestration/REVIEW_BRIEF.md
    owner: hitl
    depends_on: [DOC-013, DOC-016]
  - id: DOC-022
    path: orchestration/BOOTSTRAP.md
    owner: hitl
    depends_on: [DOC-004]
  - id: DOC-023
    path: orchestration/PROJECT_RULES.md
    owner: hitl
    depends_on: [DOC-004, DOC-008]
  - id: DOC-024
    path: project.state.yaml
    owner: hitl
    depends_on: [DOC-013, DOC-014, DOC-019, DOC-020, DOC-021, DOC-022, DOC-023]
  - id: DOC-025
    path: product/UX.md
    owner: hitl
    depends_on: [DOC-012]
  - id: DOC-026
    path: orchestration/HITL_GUIDE.md
    owner: hitl
    depends_on: []
```

### 4.4 AGENTS.md (machinery)

Generic. Contains no project noun. This exact file is reused unchanged in every future project and is overwritten by template syncs (section 13), so nothing about OptiBudget may be written into it.

```markdown
# Agent Rules

SENTINEL: read orchestration/PROJECT_RULES.md and quote its SENTINEL line on request.

This file is machinery. It is identical in every project using this template and
is overwritten by `scripts/template-sync.mjs`. Nothing project-specific belongs
here. Project-specific rules live in `orchestration/PROJECT_RULES.md`.

## Read before doing anything
1. This file.
2. orchestration/PROJECT_RULES.md
3. project.state.yaml, if it exists. During gate 0 it does not.
4. orchestration/bootstrap.yaml
5. The task file named by project.state.yaml, if any.
6. The newest file in orchestration/handoffs/ for the current item.

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

## Handoff
At the end of any session, write assumptions, open questions, and blockers to
`orchestration/handoffs/<doc-or-task-id>-<n>.md`. Narrative belongs there and
nowhere else.
```

### 4.5 orchestration/PROJECT_RULES.md (content)

Everything specific to OptiBudget that an agent must know before acting. Never overwritten by a template sync. Fill every angle-bracket placeholder; an unfilled placeholder is worse than an absent file, because an agent will read it as an instruction.

```markdown
# Project Rules

This file is CONTENT. The template never overwrites it. Everything specific to
this project belongs here and nowhere else.

SENTINEL: <choose a short unguessable string, e.g. OB-7Q4>

## What this project is
<One paragraph. The authoritative statement is product/PRODUCT.md; this is the
one-line version an agent reads first.>

## Stack
<e.g. SvelteKit on Vercel, Supabase Postgres with Row Level Security.>

## Highest-risk area
<The one thing that must never be got wrong. For a finance app: RLS policies.
Any work touching it requires explicit HITL confirmation before implementation.>

## Project-specific constraints
- <e.g. No new runtime dependency without an ADR in engineering/adr/.>
- <e.g. All currency values are integer minor units. Never floats.>

## Vendors in use
- <e.g. Claude Code (implement), OpenAI Codex (review). The vendor that drafted
  an artifact must not review it.>
```

This is DOC-023 in the graph, written after `PRODUCT.md` exists. During section 4 you create it with the SENTINEL line filled in and the rest as placeholders, so the section 2.6 test works from day one; you complete it properly at DOC-023 and approve it then.

### 4.6 CLAUDE.md

One line, nothing else:

```
@AGENTS.md
```

### 4.7 .codex/config.toml

```toml
# OptiBudget - Codex project configuration
# AGENTS.md is the canonical rule file for every vendor.
instructions_file = "AGENTS.md"
```

Confidence: low [I]. Codex's `.codex/` directory layering is documented; this exact key is not verified. Do not trust it — run the sentinel test in section 2.6. If it fails, fall back to pasting the section 4.11 session-opening block at the start of every Codex session, which works regardless of config support.

### 4.8 .claude/settings.json

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Edit(./orchestration/bootstrap.yaml)",
      "Edit(./orchestration/approvals.yaml)",
      "Edit(./project.state.yaml)",
      "Edit(./template.lock)",
      "Edit(./template.manifest.yaml)",
      "Edit(./scripts/**)"
    ]
  }
}
```

Deny only. An allow list is a maintenance burden that grows with every task and eventually gets set to a wildcard out of fatigue, which is worse than no list. Deny the four files whose integrity the whole system rests on and let AGENTS.md carry the rest.

Confidence: moderate [I] on the exact permission-rule syntax. Verify against https://code.claude.com/docs/en/settings. Treat it as a seatbelt, not a wall.

### 4.9 orchestration/approvals.yaml

Seed it with exactly this, then let the script append:

```yaml
approvals:
```

### 4.10 scripts/next.mjs

Provided as a separate file alongside this guide. Copy it to `scripts/next.mjs`. Do not edit it. It has been executed against a real Git repository and verified for: available/blocked/approved/modified/stale states, the prerequisite-drift cascade, refusal to approve an uncommitted file, and non-zero exit on any violation.

Commands, all run from `C:\Dev\OptiBudget`:

```powershell
node scripts/next.mjs status          # full board
node scripts/next.mjs next            # the one document you may write now
node scripts/next.mjs approve DOC-011 # record approval after committing
node scripts/next.mjs check           # exits non-zero on any violation
```

### 4.11 orchestration/BOOTSTRAP.md

This is the session-opening block. Paste it verbatim at the start of every session, with every vendor, without exception.

```
Read in this order and nothing else yet:
1. AGENTS.md
2. orchestration/PROJECT_RULES.md
3. orchestration/bootstrap.yaml
4. project.state.yaml, if it exists
5. the newest file in orchestration/handoffs/ for the current item

Then state back to me: current gate, active DOC id or task id, the paths you
are allowed to write, and the single next action. Quote the SENTINEL line from
orchestration/PROJECT_RULES.md. Do not write any file until I confirm.
```

If the vendor cannot state these back, the repository state is incomplete. Fix the repository, not the prompt [M].

### 4.12 project.state.yaml

Created last, at DOC-024, as the final act of gate 0:

```yaml
version: 1
gate: 1
active_task: task-001
attempt: 1
authorized_branch: task-001-ci-and-validators
allowed_paths:
  - .github/workflows/
  - scripts/
  - tests/
required_checks:
  - validate-state
  - validate-task
  - unit
frozen: false
```

### 4.13 orchestration/HITL_GUIDE.md (machinery)

This guide is itself a file in the repository, not just something you read
alongside it. Save this document, verbatim, at `orchestration/HITL_GUIDE.md`
as part of the initial bootstrap commit in section 4. It is DOC-026 in
`bootstrap.yaml` (section 4.3) — `depends_on: []`, because unlike most
documents in this graph it is not built on another document's content, only
on your own reading of it. Re-approve it, the same way you re-approve
`AGENTS.md` (DOC-004, section 10 point 4), whenever you hand-edit it or after
a future `scripts/template-sync.mjs` run changes it.

### 4.14 Resulting folder structure

What `C:\Dev\OptiBudget` contains once section 3's folders exist and every
file in section 4 has been created and committed. Folders with nothing in
them yet are noted as empty — Git does not track empty folders, so they
exist on your disk from `mkdir` but will not appear in `git status` until
something is placed inside.

```
C:\Dev\OptiBudget\
├── .claude\
│   └── settings.json
├── .codex\
│   └── config.toml
├── .github\
│   └── workflows\          (empty until task-001)
├── assets\
│   └── brand\               (empty until a logo exists — section 6.8)
├── engineering\
│   └── adr\                 (empty until an ADR is written)
├── orchestration\
│   ├── tasks\                (empty until task-001)
│   ├── approvals.yaml
│   ├── bootstrap.yaml
│   ├── BOOTSTRAP.md
│   ├── HITL_GUIDE.md
│   └── PROJECT_RULES.md      (placeholder — completed and approved at DOC-023)
├── product\                  (empty until the gate 0 loop, section 5)
├── scripts\
│   └── next.mjs
├── src\                      (empty until task-002 or later)
├── supabase\
│   └── migrations\           (empty until task-002 or later)
├── tests\                    (empty until task-001)
├── .gitattributes
├── .gitignore
├── AGENTS.md
└── CLAUDE.md
```

`orchestration/REVIEW_BRIEF.md` (DOC-021) and `project.state.yaml` (DOC-024)
are not in this tree — both are written later, once their prerequisites are
approved (section 4.9, section 4.12), not as part of the initial bootstrap.

## 5. The Gate 0 Loop

Repeat this exact cycle until section 10 says you are done. One document per cycle. No exceptions, no batching.

1. `node scripts/next.mjs next` — it names one document.
2. Write it. If `owner` is `hitl`, you write it. If `owner` is `agent`, section 7 applies.
3. `git add .` then `git commit -m "DOC-0NN: <path>"`
4. `node scripts/next.mjs approve DOC-0NN --note "one phrase saying why"`
5. `git add .` then `git commit -m "Approve DOC-0NN"`
6. `node scripts/next.mjs check` — must print CHECK OK. If it does not, section 11.

Why the two commits: the approval records the commit hash of the document, so the document must be committed first. The script refuses to approve an uncommitted or dirty file, which is the guard that makes this order safe.

The note is required, not optional. The ledger records what was approved, when, and against which commit — it has no way to record why, and six weeks later that is the only thing you will want. One phrase is enough: `--note "REQ-014 reworded after glossary update"`. On a trivial file, `--note "initial"` is a legitimate answer. An optional field on a solo project is an empty field within a week, which is why the script refuses without it.

Gate 0 approval needs no form, no preview URL, and no checklist. There is no running software and no CI to read. The question is one sentence: does this document still say what I intend, in the vocabulary the glossary defines, consistent with everything approved before it. A six-question form here is ceremony, and ceremony that outweighs its value gets filled in dishonestly.

### 5.1 What the states mean

- available — you may write this now.
- blocked — a prerequisite is unapproved. Not your next move.
- approved — current and consistent.
- modified — the file changed after approval. Re-approve it.
- stale — a prerequisite was re-approved at a new commit. Re-read this document, then re-approve it.
- broken — approved but Git has no commit touching that path. Something was deleted or renamed outside the process.

Stale is not a bug. It is the design telling you that something you already accepted was written against an assumption that has since moved.

## 6. What Goes In Each HITL Document

The purpose of each document, and the minimum that makes it useful. Anything shorter is a placeholder and you are lying to yourself.

### 6.1 product/PRODUCT.md (DOC-008)

What OptiBudget is, who uses it, and an explicit "what it is not" list. One page. The "is not" list is the one that does work later, because it is what you point an agent at when it proposes scope creep.

### 6.2 product/GLOSSARY.md (DOC-009)

Every domain noun with exactly one definition: account, transaction, category, budget, envelope, period, reconciliation. If a word has two meanings anywhere in the project, this file has failed. Agents will silently pick one meaning and build on it.

### 6.3 product/DECISIONS.md (DOC-010)

Append-only. One line per decision: date, decision, why, what it rules out. Never rewrite history here.

### 6.4 product/REQUIREMENTS.md (DOC-011)

Numbered REQ-0NN statements in plain language, each using only words defined in the glossary. What the system must do, not how.

### 6.5 product/SCOPE.md (DOC-012)

Which REQ ids are in version 0.1.0 and which are explicitly out. Out is as important as in.

### 6.6 product/ACCEPTANCE.md (DOC-013)

The most important file you will write. Numbered AC-0NN, each one a thing you can do with your hands and see with your eyes:

```
AC-014: I can add a transaction of -42.50 EUR to the account "Main", and the
account balance shown on the dashboard decreases by exactly 42.50.
```

Test: if you cannot confirm an AC by operating the app, the AC is badly written. Fix the AC, not the code [M]. Each AC maps to exactly one REQ id.

### 6.7 product/UX.md (DOC-025)

Which screens exist, what appears on each, and how you move between them. Not a design specification and not a style guide — a screen inventory a vendor can build against without guessing. Section 16.3 covers how to arrive at it.

### 6.8 product/ASSETS.md (DOC-014)

Logos, fonts, colours, icons, and their licences. Short.

The files themselves — the logo images, and any other binary brand asset —
do not live in `product/`. They live in `assets/<category>/` at the
repository root (`assets/brand/` for the logo), created in section 3 like
any other folder. `product/ASSETS.md` describes what they are and states
their path; it does not contain them. Naming convention:
`<product>-<asset>-<variant>.<ext>`, lowercase, hyphen-separated — e.g.
`optibudget-mark-color-on-teal.png`. Changing which files exist there is a
change to `product/ASSETS.md` and needs re-approval, even though the binary
files are not themselves gated by `bootstrap.yaml`.

### 6.9 engineering/TESTING.md (DOC-017)

Part A, the naming contract. Exactly how a test declares which AC it covers, as a literal string an automated check can match:

```
Every test file name: tests/<area>/AC-0NN.<slug>.test.ts
Every test title must begin with: [AC-0NN]
A pull request fails if any AC id in ACCEPTANCE.md has no matching test.
```

Without this literal string, `check-coverage.mjs` has no specification and cannot be written [M].

### 6.10 engineering/CHECK_MAP.md (DOC-020)

Part B. A two-column mapping from each name in `required_checks` to the exact npm script that runs it. Written after `package.json` exists, which is why it depends on DOC-018.

### 6.11 orchestration/REVIEW_BRIEF.md (DOC-021)

The prompt you paste to the reviewing vendor. It must name the diff to review, the documents to review it against, and require output as a list of violations with file and line — not a summary, not praise.

## 7. Agent-Drafted Documents

DOC-015, DOC-016, DOC-018, DOC-019 are drafted by a coder. Procedure:

1. Open vendor A. Paste `orchestration/BOOTSTRAP.md`. Confirm the sentinel.
2. Instruct: draft exactly `<path>`, based on the listed prerequisites, and write no other file.
3. Commit the draft.
4. Open vendor B in a fresh session. Paste `orchestration/REVIEW_BRIEF.md`. Ask for violations against the prerequisite documents.
5. Have vendor A apply the violations, or reject and restart.
6. Commit, then approve.

The vendor that drafted a document must not review it [M]. That rule is the whole reason a second vendor exists.

For DOC-016, THREAT_MODEL.md: the highest-risk item in this stack is Supabase Row Level Security [M]. If the drafted threat model does not discuss RLS policies per table, it is incomplete regardless of how long it is.

## 8. GitHub, Vercel, Supabase

### 8.1 Branch protection timing

The uploaded guide enables branch protection on `main` in section 1.5, then instructs you to commit and push directly to `main` throughout gate 0. Those two instructions contradict each other: with "require a pull request" enabled, your gate 0 commits are rejected and you will not know why.

Correct order: gate 0 runs on `main` with no protection. Gate 0 is unenforced by construction anyway — only your discipline and `next.mjs` hold it [M]. Enable protection at the end of gate 0, in section 10, immediately before task-001, which is the first work an agent performs.

Settings, when you enable it: require a pull request, require status checks to pass, block force pushes. Do not grant yourself an admin bypass; it defeats the purpose.

### 8.2 Vercel

Do not import the repository during gate 0. There is no application yet, the build fails, and a failing deployment on day one teaches you to ignore red signals — which is the exact instinct that will later let a bad build through.

Import after the first application skeleton exists, in task-002. Then: production branch `main`, automatic preview per pull request, environment variables set separately for Preview and Production. The Supabase `service_role` key goes only into server-side Production variables — never in a `NEXT_PUBLIC_` variable, never in Preview, never in the repository [M]. The build command must not run migrations.

Create the Vercel account at that point too, signing in with GitHub, not before. An account created now sits unused for weeks and the connection to your repository will have to be re-authorised anyway.

Gap notice: this section states policy and timing. It does not yet contain the click-by-click import, framework, build, and environment-variable steps, because those depend on the framework `ARCHITECTURE.md` selects at DOC-015, which is not written. Writing them now would mean guessing settings for a stack that has not been chosen. They belong in this guide before task-002 begins, and until they are here you should treat Vercel setup as an unwritten step, not an obvious one. The same applies to section 8.3.

### 8.3 Supabase

Two projects: `optibudget-staging` and `optibudget-prod`. Previews point at staging. Migrations run against staging until a gate is approved [M]. Create them when task-002 needs them, not during gate 0.

### 8.4 Secrets

Real values live in exactly three places: GitHub Secrets, Vercel Environment Variables, and your local `.env`, which `.gitignore` excludes. `.env.example` contains variable names and empty values. If a real key ever reaches a commit, rotate it at the provider immediately — removing it from Git history is not sufficient, because the commit may already be pushed.

## 9. Switching Coders

Continuity lives in Git, not in chat memory [M].

1. Commit whatever exists, even if incomplete: `git add . ; git commit -m "WIP: partial work"`
2. Close the previous vendor's session completely. Do not leave it open "in case".
3. Stay on the same branch.
4. Open the new vendor and paste `orchestration/BOOTSTRAP.md`.
5. Confirm the sentinel and the stated-back summary before letting it write anything.

If the new vendor's summary is wrong, the problem is in your repository files, not in the vendor. Fix the files.

## 10. Gate 0 Exit

Gate 0 is complete when all of the following are true:

1. `node scripts/next.mjs next` reports that nothing is available.
2. `node scripts/next.mjs check` prints CHECK OK.
3. `orchestration/STALE_REPORT.md` lists nothing.
4. You have re-read `AGENTS.md` after writing every other document, revised it, re-approved DOC-004, and then cleared the resulting cascade of stale re-approvals. Expect roughly ten to twelve re-approvals, one command each. This cascade is the intended friction [M], not a malfunction.
5. `project.state.yaml` exists with `gate: 1`.

Then, in this order:

1. Enable branch protection on `main` (section 8.1).
2. Create branch `task-001-ci-and-validators`.
3. Write `orchestration/tasks/task-001.yml` defining the deliverables: `.github/workflows/ci.yml`, `scripts/validate-state.mjs`, `scripts/validate-task.mjs`, `scripts/check-coverage.mjs`, and fixture tests that prove each validator fails on a deliberately broken input.
4. Run task-001 through the section 7 procedure: one vendor implements, a different one reviews.

Task-001 is the only task where the enforcement machinery does not yet protect you, because it is the machinery [M]. Read its diff more carefully than any other, and require the fixture tests — a validator that has never been seen to fail is not evidence of anything.

## 11. Troubleshooting

### 11.1 Git and PowerShell

- "Please tell me who you are" — you skipped the `git config --global user.name` and `user.email` lines in section 2.1.
- `code` is not recognised — VS Code was installed without the PATH option. Reinstall and tick it, or open the folder from within VS Code.
- Push rejected, "protected branch" — you enabled branch protection early. See section 8.1.
- First push opens a browser window — that is Git Credential Manager. Sign in to GitHub and it will not ask again.
- Line-ending warnings on commit — expected. `.gitattributes` normalises to LF. Ignore them.
- I ran section 3 in the wrong folder, usually `C:\Users\<you>` — `git init` created a repository over your entire home directory and the project folders were made there. Fix it in this order. First, close the VS Code window that `code .` opened. Then, from that folder, delete the repository: `Remove-Item -Recurse -Force .git`. Then list what is inside the stray folders before deleting anything: `@("orchestration","product","engineering","scripts","tests","src","supabase",".github") | ForEach-Object { Get-ChildItem $_ -Recurse -File -ErrorAction SilentlyContinue }`. If that prints nothing, they are empty and safe to remove: `@("orchestration","product","engineering","scripts","tests","src","supabase",".github") | ForEach-Object { Remove-Item $_ -Recurse -Force -ErrorAction SilentlyContinue }`. Never delete `.codex` or `.claude` from your home directory. Those are the vendors' own configuration folders, they existed before you started, and `mkdir` refusing to create them is the reason they survived. Deleting them costs you your Claude Code login and settings.

### 11.2 next.mjs

- `missing file: orchestration/bootstrap.yaml` — you are not in `C:\Dev\OptiBudget`. Run `cd C:\Dev\OptiBudget`.
- `no documents parsed` — the YAML shape drifted. Every document is a list item starting with `- id:`, indented two spaces, with the other three keys indented four. Arrays inline in square brackets.
- `has uncommitted changes` — commit the file before approving. This guard is deliberate.
- `is not in git history` — you created the file but never committed it.
- `depends on unknown id` — a typo in a `depends_on` entry in bootstrap.yaml.
- `[broken]` — the file was deleted or renamed outside the process. Restore the path or amend bootstrap.yaml and re-approve.

### 11.3 Vendors

- The sentinel test fails — the config file is not being read. Fall back to pasting `orchestration/BOOTSTRAP.md` manually every session. That always works.
- A vendor edits files outside its allowed paths — `git checkout -- <path>` to revert them, then restate the constraint. If it happens twice with the same vendor on the same rule, the rule is not being loaded; re-run the sentinel test.
- A vendor claims tests pass — ignore the claim entirely. Only the GitHub Actions check counts [M].
- A vendor rewrites a finished document — that is why you commit before switching. `git checkout -- <path>` and restore.

## 12. Known Limits

Stated plainly so you do not mistake this system for more than it is.

- Gate 0 is unenforced by construction. Only your discipline and `next.mjs` hold it. Nothing stops you running `approve` on a document you did not read.
- Approval proves existence and dependency currency. It does not prove you understood the content.
- Rework high in the graph forces a manual cascade of re-approvals. Intentional.
- The semantic quality of `ACCEPTANCE.md` is the ceiling of the entire system. No script can check meaning [M].
- `next.mjs` uses a restricted YAML reader. It parses the shapes in this guide and nothing else. When task-001 delivers real CI, that CI should use a proper YAML library and this script becomes a convenience only.
- The `.claude/settings.json` deny list and the `.codex/config.toml` key are unverified against current vendor documentation [I]. Verify both, and until you do, treat AGENTS.md plus the sentinel test as your only real control.
- Two of the four vendors in the original guide have unverified or unofficial VS Code integration paths. Do not let tool-collecting substitute for building the product.
- `template-sync.mjs` propagates machinery only. Changes to the document set or the dependency graph are applied by you, by hand, per project. No script can merge a new document into an approved graph safely.
- A template makes a mistake reusable. Every defect you leave in the machinery is inherited by every project you start afterwards, and you will not notice it in the new project because it arrived looking official.

## 13. The Template

### 13.1 When to extract it

Not yet, if OptiBudget has not reached task-002. You would be generalising from zero completed projects and templating your mistakes alongside your good decisions. After task-002 you will know which files you actually edited and which you never opened, and that distinction is precisely the boundary this section depends on. [I]

### 13.2 The boundary

Two zones, and the entire template mechanism is nothing but this line drawn in a file.

Machinery: identical in every project, contains no project noun, overwritten without being read. `AGENTS.md`, `CLAUDE.md`, `.gitattributes`, `.claude/settings.json`, `.codex/config.toml`, `scripts/next.mjs`, `scripts/template-sync.mjs`, `orchestration/BOOTSTRAP.md`, `orchestration/REVIEW_BRIEF.md`, `orchestration/HITL_GUIDE.md`, and later `.github/workflows/`.

Content: specific to one project, never touched by any sync. `product/**`, `assets/**`, `engineering/**`, `src/**`, `tests/**`, `supabase/**`, `orchestration/tasks/**`, `orchestration/approvals.yaml`, `orchestration/PROJECT_RULES.md`, `orchestration/bootstrap.yaml`, `project.state.yaml`, `package.json`, `.env.example`, `.gitignore`, `README.md`.

`bootstrap.yaml` sits on the content side even though its shape is generic: its document list is a project decision, and overwriting it would invalidate every approval that references a DOC id.

### 13.3 template.manifest.yaml

The boundary written down. At the template root:

```yaml
template_version: 1.0.0

machinery:
  - AGENTS.md
  - CLAUDE.md
  - .gitattributes
  - .claude/settings.json
  - .codex/config.toml
  - scripts/next.mjs
  - scripts/template-sync.mjs
  - orchestration/BOOTSTRAP.md
  - orchestration/REVIEW_BRIEF.md
  - orchestration/HITL_GUIDE.md
```

Explicit paths only. `template-sync.mjs` refuses to run on a manifest containing a wildcard, because a wildcard eventually sweeps up a content file and destroys work you cannot recover from the diff you did not read.

### 13.4 Creating the template repository

1. New GitHub repository named `dev-template`.
2. Add the machinery files, `template.manifest.yaml`, a `CHANGELOG.md`, and a `template.lock` with `template_version: 0.0.0`.
3. Add `orchestration/PROJECT_RULES.md` as a placeholder stub. It ships with the template but is not in the manifest, so it is created once and never overwritten.
4. Settings, General, tick "Template repository".
5. Commit, then `git tag v1.0.0` and `git push --tags`.

Tags are what make this work. `template-sync.mjs` syncs to a tag, never to a branch, so a project can never pick up half-finished template work.

### 13.5 Starting a new project

On GitHub, "Use this template", name the repository, clone it. Then:

1. Edit `template.lock`: set `template_repo` to the template's URL.
2. Fill in `orchestration/PROJECT_RULES.md`, starting with a fresh SENTINEL string.
3. Write `orchestration/bootstrap.yaml` for this project's document set.
4. Run the section 2.6 sentinel test.
5. Begin the gate 0 loop at section 5.

Sections 2 and 4 of this guide collapse to about twenty minutes on the second project. The 15 to 25 hour estimate in section 0 is almost entirely gate 0 authoring, and that cost does not transfer — it is the part that is genuinely about your product. [I]

### 13.6 Updating an older project

From the project root, on a clean working tree:

```powershell
node scripts/template-sync.mjs --dry-run     # what would change
node scripts/template-sync.mjs               # copy machinery, write template.lock
git diff                                     # read every change
node scripts/next.mjs check                  # AGENTS.md changes cascade staleness
git add . ; git commit -m "Sync template v1.2.0"
```

The script commits nothing, deliberately. The `git diff` step is your review, and it is the only reason the mechanism is safe. If you ever find yourself running the sync and committing without reading, you have built an unattended channel that pushes untested code into every project you own.

It refuses to run on a dirty working tree so that the sync diff stands alone and is readable. It reports `Already on template vX` and exits when there is nothing to do.

### 13.7 Versioning

Semver tags on the template. `CHANGELOG.md` records every change and states, explicitly, one of two words for existing projects:

- sync — `template-sync.mjs` is sufficient.
- manual — the change touches the document set or the dependency graph. Written steps, applied by you, in graph order, with real approvals.

`template.lock` in each project records which version it is on, so you can see at a glance which projects are behind.

### 13.8 What a sync cannot do

If template 1.3 adds a document to the standard graph, no script can merge it into a project whose gate 0 is already approved: it changes the dependency graph underneath existing approvals. Those go in the changelog as manual instructions.

That is not a gap to engineer around. Backporting a structural decision into a project designed without it is a decision, and decisions are yours.

## 14. Where To Work: iPad Chat and Claude Code

### 14.1 The principle

The iPad decides. The PC executes.

Everything that touches the filesystem, Git, or an approval happens in VS Code. Everything that is thinking, drafting, reviewing, or judging can happen on an iPad — and much of it is better there, because the iPad has no terminal to be tempted by.

### 14.2 On the iPad, in Claude Chat

- Drafting `PRODUCT.md`, `GLOSSARY.md`, `REQUIREMENTS.md`, `SCOPE.md`, `ACCEPTANCE.md`. This is the expensive, high-value part of gate 0 and it is pure thinking. Draft in chat, refine, then paste into the repo from the PC.
- Stress-testing acceptance criteria. Paste an AC and ask what a malicious or careless implementation could do that still satisfies the words as written. This is the highest-leverage use of chat in the whole project.
- Reviewing an agent-drafted document by pasting it in and asking where it contradicts a prerequisite.
- Reading `HITL_GUIDE.md` and asking what a step means before running it.
- Manual acceptance testing: open the Vercel preview URL in Safari and confirm each AC by hand. This is the step nothing else can replace, and it needs no terminal.
- Reading pull requests in the GitHub mobile app: the diff, the reviewer's violation list, and the green or red check.

### 14.3 On the PC, in Claude Code

- Every Git operation.
- Every `node scripts/next.mjs` command, and every approval without exception.
- `template-sync.mjs`, migrations, and any repository restructuring.
- Task implementation and review sessions with the vendors.
- Anything involving `.env` or a real key.

### 14.4 Never from the iPad

Approvals. `approvals.yaml` must only ever be written by `next.mjs approve`, run by you, from the project root, after you read the document. Editing it through the GitHub web interface produces an entry indistinguishable from a real one, and the provenance chain is then worth nothing.

### 14.5 Moving work from iPad to repository

Two routes.

The clean one: open Claude Code on the PC, paste the drafted text, tell it which path to write, review, commit, approve.

The direct one: GitHub's web editor on the iPad, committing to a task branch and opening a pull request. Note that once branch protection is on, the web editor cannot commit to `main` — which is the protection working as intended, not a fault.

Do not use the web editor for `approvals.yaml`, `bootstrap.yaml`, `project.state.yaml`, or `template.lock`.

### 14.6 The four-action loop is iPad-native

From gate 1 onward your loop is: read the checklist, use the app, confirm the check is green, write one accept or reject line. All four are doable from an iPad. The build loop needs a PC; the decision loop does not.

## 16. The Two Phases: Product and Engineering

### 16.1 The split

Every document in the graph belongs to one of two phases, and the split is the reason the folder names are what they are.

Product, in `product/`, answers why and what. Owned by the HITL. Written in plain language, in the vocabulary the glossary defines, containing no technology and no implementation. A person who has never seen the codebase should be able to read `product/` and know what the application is for and how they would recognise it working.

Engineering, in `engineering/` and in code, answers how. Drafted by a coding vendor, reviewed by a different one, approved by the HITL. It may not introduce a requirement. If an engineering document needs something the product documents do not say, that is a defect in the product phase and the correct response is to stop and go back, not to invent it.

The boundary is enforced by the dependency graph, not by good intentions: `engineering/ARCHITECTURE.md` depends on `product/SCOPE.md`, so it cannot be written until scope is approved.

### 16.2 What the product phase delivers

Read as a sequence, these documents narrow from purpose to observable behaviour.

`PRODUCT.md` states why the application exists and what it is not. `GLOSSARY.md` fixes one meaning per domain noun. `REQUIREMENTS.md` states what the system must do. `SCOPE.md` states which of those requirements are in this version. `ACCEPTANCE.md` states how you will recognise each one working, by hand. `UX.md` states which screens exist and how you move between them. `ASSETS.md` states what it is built from visually. `DECISIONS.md` records what was chosen and what that ruled out.

Nothing in that list mentions a framework, a database, or a language. If yours does, it has drifted into the engineering phase.

### 16.3 Prototyping

Optional. It is a way of discovering what you want, not a stage anything depends on. A HITL who already knows the product can skip it entirely and lose nothing.

Prototyping happens in chat, on the iPad or anywhere else, and never in the repository. You describe a screen, the assistant builds something you can click, you use it and discover what is wrong or missing. Two or three rounds is usually enough.

Two routes into the loop, and they suit different people. If you think visually, sketch on paper, photograph the sketch, and use it as the input. If you do not, start from a prototype and give written feedback or an annotated screenshot of it. Both routes converge on the same place.

What the loop actually produces is not the prototype. It is a shorter list of things you now know: requirements you had not thought of, acceptance criteria you can phrase precisely because you have seen the alternative, and a screen inventory you can defend. Those go into `REQUIREMENTS.md`, `ACCEPTANCE.md`, and `UX.md` as text.

The prototype itself is thrown away. So are the sketches and the annotated screenshots — they are working material, they live outside the repository, and they are not documents. An image committed to the repository is read by an agent as a specification it must satisfy literally, without any way of knowing which parts you meant and which were your pen wandering. Ambiguous input to a stateless agent is worse than no input.

### 16.4 The rule that makes this safe

Prototype code is never merged into OptiBudget. Not adapted, not used as a starting point, not "cleaned up first".

The reason is not code quality. It is that nobody rewrites something that already works, so a prototype that reaches the repository quietly becomes the architecture — chosen in an afternoon, by nobody, and never reviewed. Everything in this system exists to stop unreviewed work becoming permanent.

Record this once in `DECISIONS.md` so it is a decision you made rather than a habit you have.

### 16.5 When to prototype

Before `REQUIREMENTS.md` if you are unsure what the product is. Between `SCOPE.md` and `UX.md` if you know what it does but not what it looks like. It is not tied to a DOC id, because it feeds several: DOC-011, DOC-013, and DOC-025.

It must be finished before DOC-015. From `ARCHITECTURE.md` onward the vendors are working from your documents, and a screen inventory that arrives after the architecture is a change request rather than an input.

### 16.6 The handover

The engineering phase begins when `SCOPE.md` is approved. From that moment the product documents are the specification, and the only thing a vendor may do with a question is stop and ask.

That is the whole contract. The product phase is where you are irreplaceable and where the system cannot check your work. The engineering phase is where the vendors are fast and the machinery can check theirs.

## Appendix A. Vocabulary and Core Mechanics

Read this before section 2 if you have never used Git. Every term below appears in this guide or in an error message you will meet. Definitions are deliberately short; the goal is recognition, not expertise.

### A.1 The one mental model that matters

Git keeps your work in three places, and every confusion a beginner has comes from not knowing which place a file is in.

1. The working directory — the files as they exist on your disk right now. Editing a file changes only this.
2. The staging area — a holding pen listing which changes you intend to save next. `git add` moves changes here.
3. The repository history — permanent, named snapshots. `git commit` moves everything staged into here.

Nothing is safe until it reaches place 3. Files in place 1 can be lost by a bad edit; commits effectively cannot.

### A.2 Committing, step by step

A commit is a saved snapshot of the whole project at one moment, with a message saying what changed. It is the unit everything else in this project is built on: approvals record a commit, agents read commits, CI runs on commits.

From `C:\Dev\OptiBudget` in PowerShell:

```powershell
git status          # what changed, and what is staged
git add .           # stage every change in the folder
git commit -m "DOC-011: product/REQUIREMENTS.md"
```

`git status` before and after is not optional for a beginner. It is the only way to see which of the three places your work is in.

The message is not decoration. In this project it is how you find, six weeks later, the commit an approval points at. Use the format `DOC-0NN: <path>` during gate 0.

Nothing leaves your PC until you push (A.4). Committing is private; pushing is publishing.

### A.3 Git vocabulary

- repository (repo) — the project folder plus its complete history. `C:\Dev\OptiBudget` is one.
- git init — turns a plain folder into a repository. Done once, in section 3.
- staged / unstaged — a change that will, or will not, be included in your next commit.
- clean / dirty — a working directory with no uncommitted changes is clean. `next.mjs approve` refuses to run on a dirty file.
- commit hash (SHA) — the unique 40-character fingerprint of a commit, such as `9f3c1ab...`. Usually shown shortened to seven characters. Your `approvals.yaml` stores these; that is how staleness is detected.
- HEAD — Git's word for "the commit you are currently sitting on."
- branch — an independent line of work. `main` is the trunk. Task work happens on its own branch so a failure can be thrown away without touching `main`.
- checkout / switch — move onto a different branch.
- diff — the exact list of lines added and removed between two states. When you ask a second vendor to review, the diff is what it reviews.
- git checkout -- path — throw away uncommitted edits to one file and restore the last committed version. This is your undo when an agent damages a file.
- merge — combine another branch's commits into the current one.
- .gitignore — a list of paths Git must never track. `.env` is in it because it holds real secrets.
- WIP — work in progress. A deliberately incomplete commit made so you can safely switch vendors.

### A.4 GitHub vocabulary

- remote — a copy of your repository hosted elsewhere. Yours is called `origin` and lives on GitHub.
- push — upload your local commits to the remote. `git push`
- pull — download commits from the remote into your local copy. `git pull`
- clone — make a fresh local copy of a remote repository.
- pull request (PR) — a proposal to merge one branch into another, with a page showing the diff, the review, and the check results. From gate 1 onward this is where you do your accept/reject.
- branch protection — a GitHub setting that refuses direct pushes to `main` and requires a PR with passing checks. Section 8.1 explains why you enable it late, not early.
- GitHub Actions — GitHub's automation. It runs your checks on every push.
- workflow — one automation file, such as `.github/workflows/ci.yml`, describing what runs and when.
- CI (continuous integration) — the umbrella term for those automated checks. In this project CI is the only acceptable evidence that something works.
- status check — one named result on a PR, shown as a green tick or a red cross. Your entire technical review reduces to reading these.
- artifact — a file a CI run produces and stores for you to download, such as a test report.
- exit code — a number a script returns when it finishes. Zero means success; anything else means failure, and CI treats it as a red cross. `next.mjs check` uses this.

### A.5 Terminal and Node vocabulary

- PowerShell — the Windows command line you type into. Its prompt shows `PS C:\`.
- CLI (command line interface) — a tool you run by typing rather than clicking. Claude Code is one.
- cd — change directory. Almost every "missing file" error in this project is caused by running a command from the wrong folder.
- Node.js — the runtime that executes JavaScript outside a browser. It runs `next.mjs`.
- npm — Node's package installer, bundled with Node.
- package.json — the file declaring your project's dependencies and its named scripts.
- script — a named shortcut defined in `package.json`, run as `npm run <name>`. `CHECK_MAP.md` maps each required check to one of these.
- node_modules — the folder of downloaded dependencies. Never committed; it is in `.gitignore`.
- .mjs — a JavaScript file using modern module syntax. `next.mjs` is one.

### A.6 File format vocabulary

- Markdown (.md) — plain text with light formatting marks. This guide is Markdown.
- YAML (.yaml) — a data format where indentation carries meaning. Two spaces versus four changes the structure. Never paste YAML out of Word.
- JSON (.json) — a data format using braces and double quotes. Strict: a trailing comma or a curly quote makes the file invalid.
- TOML (.toml) — a simpler key-equals-value data format. Used by Codex configuration.
- schema — the expected shape of a data file. When a validator says a file is invalid, it means the file does not match the schema.

### A.7 Hosting and database vocabulary

- Vercel — the service that builds and hosts the application.
- deployment — one built, running copy of the app at a URL.
- preview deployment — a temporary deployment built from a pull request, at its own URL. This is where you perform your manual acceptance checks by hand.
- production — the live deployment built from `main`.
- environment variable — a named configuration value supplied at runtime rather than written in the code, such as a database URL.
- secret — an environment variable whose value must never be seen, such as an API key. Stored only in GitHub Secrets, Vercel Environment Variables, and your local `.env`.
- Supabase — the hosted database and authentication service behind the app.
- migration — a versioned file describing a change to the database structure. Applied in order, never edited after being applied.
- seed — sample data loaded into a fresh database for testing.
- RLS (Row Level Security) — Supabase rules deciding which rows each user may read or write. This is the highest-risk item in the whole application: an RLS mistake shows one user another user's finances, and no test you can perform by hand will reliably catch it.

### A.8 This project's own vocabulary

- HITL (human in the loop) — you. The only person who decides.
- vendor / coder — one AI coding tool: Claude Code, Codex, Mistral Code.
- stateless — the fact that each vendor session begins with no memory of any previous one. This is why the repository, not the chat, holds the project state.
- gate — a checkpoint between phases of work. Gate 0 is the document set; gate 1 begins real code.
- DOC id — a label such as DOC-011 identifying one document in `bootstrap.yaml`. Not a filename.
- dependency graph — the `depends_on` lists declaring which document must exist before which other.
- approval — your recorded statement that a document is accepted, stored in `approvals.yaml` with the commit hash it applied to.
- stale — an approved document whose prerequisite has since been re-approved at a newer commit. It needs re-reading and re-approving.
- task YAML — a file in `orchestration/tasks/` defining one unit of agent work: what to build, where it may write, which checks must pass.
- allowed_paths — the only folders an agent may write to during a task. Anything outside is a violation.
- required_checks — the named CI checks that must be green before a task can be accepted.
- attempt — the counter of how many times a task has been rejected and restarted.
- handoff — a file an agent writes recording assumptions, open questions, and blockers, so the next session can continue.
- REQ id — a numbered requirement in `REQUIREMENTS.md`.
- AC id — a numbered acceptance criterion in `ACCEPTANCE.md`, phrased as something you can do and see.
- ADR (architecture decision record) — a short note recording one technical decision and its reasoning, kept in `engineering/adr/`.
- RTM (requirements traceability matrix) — the mapping proving every requirement has a test. Generated by CI, never maintained by hand.

### A.9 Undoing mistakes

- I edited a file and want the committed version back: `git checkout -- path/to/file`
- I staged something by accident: `git restore --staged path/to/file`
- I want to see what I am about to commit: `git diff --staged`
- I committed with a bad message, and have not pushed: `git commit --amend -m "better message"`
- An agent changed files it should not have: `git status` to see them, then `git checkout --` each one.
- I do not understand what state I am in: `git status` and `git log --oneline -5`. Read them before typing anything else.

Do not use `git reset --hard`, `git rebase`, or `git push --force`. They discard work permanently and you have no reason to need them.

### A.10 Template vocabulary

- template repository — a GitHub repository marked so that "Use this template" creates a new project from it, with no shared history.
- machinery — files identical in every project, overwritten by a sync without being read.
- content — files specific to one project, never touched by a sync.
- manifest — `template.manifest.yaml`, the explicit list of machinery paths. The boundary, written down.
- lock file — `template.lock`, recording which template version this project is on.
- tag — a permanent name for one commit, such as `v1.2.0`. Syncs target tags, never branches.
- semver — version numbering as major.minor.patch. Patch means a fix, minor means an addition, major means something you must read carefully.
- dry run — a mode that reports what would change and writes nothing. Run it first, every time.
- idempotent — running the same command twice changes nothing the second time. `template-sync.mjs` is.


## 15. Task Review, Gate 1 Onward

Gate 0 approves documents. From task-001 the unit of review is a pull request, and the six questions that matter are different ones.

### 15.1 When it first applies

Not until task-001. The template does nothing until a pull request exists, and no pull request exists until an agent pushes a branch. Before then the file sits unused in the repository, which is correct.

### 15.2 Where the form lives, and one correction

`.github/PULL_REQUEST_TEMPLATE.md`, committed once at the repository root path shown. GitHub then pre-fills the description of every new pull request with it, automatically, with no configuration.

Correction to an earlier claim in this guide: the pull request description is not bound to a commit. It can be edited at any time, and nothing records when or against what. The commit-bound artifact is GitHub's Review action — the Approve or Request changes button — which is what the stale-review setting in 15.5 dismisses.

So the two are used together. The description is the worksheet you fill in while reviewing. The Review action is the signed record. Complete the checklist in the description, then submit a Review carrying your decision line. Without the second step, your accept exists only as editable text.

### 15.3 Who fills in what

The implementing agent opens the pull request and fills the five header lines: task id, attempt, preview URL, REQ ids, AC ids. Nothing else. `AGENTS.md` forbids it from ticking a checkbox, writing in Accepted deviations, or writing a decision — an agent that fills in your review has not saved you time, it has removed the review.

Everything below the header is yours.

Not a `reviews/` folder. Three reasons: a second ledger can drift from `approvals.yaml`; a file written after the fact is not bound to the commit it judged, whereas a pull request review is; and a folder in the repository cannot be filled in from an iPad, which defeats the property that makes this workable at all.

### 15.4 The review sequence

1. GitHub, on any device — read the diff, the requirements it claims to satisfy, and the reviewing vendor's findings.
2. CI — read green or red. This is the only evidence that a check passed.
3. Vercel preview URL — open the app and confirm each acceptance criterion with your hands.
4. Pull request description — complete the template. On a phone or tablet, tap the checkboxes directly in the rendered description; GitHub saves each tick immediately and you never edit Markdown by hand.
5. Files changed tab, Review changes — write the decision line and submit as Approve or Request changes. This is the record that survives.
6. `product/DECISIONS.md` — one line with the date, task id, decision, and the pull request URL.

Steps 1 to 5 need a browser and nothing else. Only the merge and any subsequent approval command need the PC.

### 15.5 Required branch protection setting

Enable "Dismiss stale pull request approvals when new commits are pushed."

Without it you can approve on Monday, an agent pushes on Tuesday, and your approval still shows as valid against code you have never seen. That single setting is what binds your judgment to a specific commit.

### 15.6 The resulting audit trail

- Engineering evidence: the diff and the CI run, in GitHub.
- Human reasoning: the completed checklist in the description, and the submitted Review, which GitHub attaches to the exact commit and dismisses if that commit changes.
- Authoritative record: `product/DECISIONS.md` and, for documents, `approvals.yaml`.

Each layer points at the next. None duplicates another, which is what keeps them from disagreeing.

### 15.7 The question your checklist cannot answer

"Are the automated test results sufficient?" cannot be answered by looking at CI. Green means the tests that exist passed; it says nothing about the tests that were never written. The real answer comes from `check-coverage.mjs`, which fails when an AC id in `ACCEPTANCE.md` has no matching test [M]. Keep the checkbox, but read it as a coverage question, not a CI question.

### 15.8 The trap

Every box on the form except one is a paper check that a careful liar could tick without leaving their chair. The exception is confirming each acceptance criterion by hand in the preview.

That is the only step where your judgment is irreplaceable, and it is the first one that gets skipped when you are tired. The template therefore asks you to list which AC ids you actually exercised — a shorter list than the one you claimed is not a failure, but leaving it blank is.

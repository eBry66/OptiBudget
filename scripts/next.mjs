#!/usr/bin/env node
// scripts/next.mjs - Gate 0 document order enforcement. Zero dependencies.
// Commands: status | next | approve <DOC-ID> --note "why" | check
// Run from the repository root.

import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const BOOTSTRAP = 'orchestration/bootstrap.yaml';
const APPROVALS = 'orchestration/approvals.yaml';
const STALE_REPORT = 'orchestration/STALE_REPORT.md';

function die(msg) { console.error('ERROR: ' + msg); process.exit(2); }

// --- restricted YAML reader -------------------------------------------------
// Accepts ONLY the shapes documented in the guide: a top-level key, then a list
// of blocks, each block a flat map of scalar or inline-array values.
function readBlocks(file) {
  if (!existsSync(file)) die(`missing file: ${file}`);
  const text = readFileSync(file, 'utf8');
  const chunks = text.split(/^[ \t]*-[ \t]+(?=id:)/m).slice(1);
  return chunks.map((chunk) => {
    const obj = {};
    for (const line of chunk.split(/\r?\n/)) {
      const m = line.match(/^[ \t]*([a-z_]+):[ \t]*(.*?)[ \t]*$/);
      if (!m) continue;
      const [, key, raw] = m;
      if (raw.startsWith('[')) {
        obj[key] = raw.replace(/^\[|\]$/g, '').split(',')
          .map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      } else {
        obj[key] = raw.replace(/^["']|["']$/g, '');
      }
    }
    return obj;
  });
}

// --- git helpers ------------------------------------------------------------
function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}
function commitOf(path) {
  try { return git(['log', '-n', '1', '--format=%H', '--', path]) || null; }
  catch { return null; }
}
function isDirty(path) {
  try { return git(['status', '--porcelain', '--', path]).length > 0; }
  catch { return true; }
}

// --- model ------------------------------------------------------------------
const docs = readBlocks(BOOTSTRAP);
if (!docs.length) die(`no documents parsed from ${BOOTSTRAP}`);

const approvals = new Map(); // id -> { commit, based_on: Map(depId -> sha) }
if (existsSync(APPROVALS)) {
  for (const a of readBlocks(APPROVALS)) {
    const based = new Map();
    for (const pair of a.based_on || []) {
      const [depId, sha] = pair.split('@');
      if (depId && sha) based.set(depId, sha);
    }
    approvals.set(a.id, { commit: a.commit, based_on: based, approved_at: a.approved_at, note: a.note });
  }
}

const byId = new Map(docs.map((d) => [d.id, d]));
for (const d of docs) {
  for (const dep of d.depends_on || []) {
    if (!byId.has(dep)) die(`${d.id} depends on unknown id ${dep}`);
  }
}

function evaluate() {
  const state = new Map(); // id -> { status, reason }
  for (const d of docs) {
    const deps = d.depends_on || [];
    const appr = approvals.get(d.id);
    const head = commitOf(d.path);

    if (!appr) {
      const missing = deps.filter((x) => !approvals.has(x));
      state.set(d.id, missing.length
        ? { status: 'blocked', reason: 'waiting on ' + missing.join(', ') }
        : { status: 'available', reason: existsSync(d.path) ? 'written, not approved' : 'not written' });
      continue;
    }
    if (!head) { state.set(d.id, { status: 'broken', reason: 'approved but no commit touches ' + d.path }); continue; }
    if (head !== appr.commit) { state.set(d.id, { status: 'modified', reason: 'changed since approval; re-approve' }); continue; }

    const drifted = deps.filter((dep) => {
      const depAppr = approvals.get(dep);
      if (!depAppr) return true;
      return appr.based_on.get(dep) !== depAppr.commit;
    });
    state.set(d.id, drifted.length
      ? { status: 'stale', reason: 'prerequisite moved: ' + drifted.join(', ') }
      : { status: 'approved', reason: [appr.approved_at, appr.note].filter(Boolean).join(' - ') });
  }
  return state;
}

function writeStaleReport(state) {
  const rows = docs.filter((d) => ['stale', 'modified', 'broken'].includes(state.get(d.id).status));
  if (!rows.length) { if (existsSync(STALE_REPORT)) writeFileSync(STALE_REPORT, '# Stale Report\n\nNone. All approved documents are current.\n'); return; }
  const lines = ['# Stale Report', '', 'Re-approve every document listed here before advancing.', ''];
  for (const d of rows) lines.push(`- ${d.id}  ${d.path}  [${state.get(d.id).status}] ${state.get(d.id).reason}`);
  writeFileSync(STALE_REPORT, lines.join('\n') + '\n');
}

// --- commands ---------------------------------------------------------------
const cmd = process.argv[2] || 'status';
const state = evaluate();

if (cmd === 'status') {
  for (const d of docs) {
    const s = state.get(d.id);
    console.log(`${s.status.padEnd(10)} ${d.id}  ${d.path}${s.reason ? '  (' + s.reason + ')' : ''}`);
  }
  writeStaleReport(state);
  process.exit(0);
}

if (cmd === 'next') {
  const d = docs.find((x) => state.get(x.id).status === 'available');
  const broken = docs.filter((x) => ['stale', 'modified', 'broken'].includes(state.get(x.id).status));
  if (broken.length) {
    console.log('BLOCKED. Clear these first (see ' + STALE_REPORT + '):');
    for (const b of broken) console.log(`  ${b.id}  ${b.path}  [${state.get(b.id).status}]`);
    writeStaleReport(state);
    process.exit(1);
  }
  if (!d) { console.log('Gate 0 document set is complete. Nothing available.'); process.exit(0); }
  console.log(`NEXT: ${d.id}  ${d.path}  owner=${d.owner}`);
  process.exit(0);
}

if (cmd === 'approve') {
  const id = process.argv[3];
  if (!id) die('usage: node scripts/next.mjs approve DOC-0NN --note "why"');
  const ni = process.argv.indexOf('--note');
  const note = ni > -1 ? (process.argv[ni + 1] || '') : '';
  if (!note.trim()) {
    die('a --note is required. One phrase saying why this version is acceptable.\n' +
        '       The ledger records what and when; the note is the only place it records why.\n' +
        '       Example: node scripts/next.mjs approve DOC-011 --note "REQ-014 reworded after glossary update"');
  }
  const safeNote = note.replace(/[\r\n]+/g, ' ').replace(/"/g, "'").trim().slice(0, 300);
  const d = byId.get(id);
  if (!d) die(`unknown document id ${id}`);
  if (!existsSync(d.path)) die(`${d.path} does not exist yet`);
  if (isDirty(d.path)) die(`${d.path} has uncommitted changes. Commit it first.`);
  const head = commitOf(d.path);
  if (!head) die(`${d.path} is not in git history. Commit it first.`);
  const based = [];
  for (const dep of d.depends_on || []) {
    const depAppr = approvals.get(dep);
    if (!depAppr) die(`prerequisite ${dep} is not approved yet`);
    const depDoc = byId.get(dep);
    if (commitOf(depDoc.path) !== depAppr.commit) die(`prerequisite ${dep} changed since its approval. Re-approve ${dep} first.`);
    based.push(`${dep}@${depAppr.commit}`);
  }
  if (!existsSync(APPROVALS)) writeFileSync(APPROVALS, 'approvals:\n');
  const entry = [
    `  - id: ${id}`,
    `    path: ${d.path}`,
    `    commit: ${head}`,
    `    approved_at: ${new Date().toISOString().slice(0, 10)}`,
    `    based_on: [${based.join(', ')}]`,
    `    note: "${safeNote}"`,
    '',
  ].join('\n');
  appendFileSync(APPROVALS, entry);
  console.log(`Approved ${id} at ${head.slice(0, 7)}: ${safeNote}`);
  console.log(`Now commit ${APPROVALS}.`);
  process.exit(0);
}

if (cmd === 'check') {
  const bad = docs.filter((d) => ['stale', 'modified', 'broken'].includes(state.get(d.id).status));
  writeStaleReport(state);
  if (bad.length) {
    console.error('CHECK FAILED');
    for (const b of bad) console.error(`  ${b.id}  ${b.path}  [${state.get(b.id).status}]  ${state.get(b.id).reason}`);
    process.exit(1);
  }
  console.log('CHECK OK');
  process.exit(0);
}

die(`unknown command "${cmd}". Use: status | next | approve <DOC-ID> | check`);

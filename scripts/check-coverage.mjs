#!/usr/bin/env node
// scripts/check-coverage.mjs - fails when an AC id in the active task's
// claims_acs has no matching test, per the naming contract in
// engineering/TESTING.md: test file name tests/<area>/AC-0NN.<slug>.test.ts,
// test title prefixed [AC-0NN]. Coverage is task-scoped (engineering/TESTING.md,
// "Coverage"): an AC id not claimed by the current task is not checked here,
// regardless of whether it has a test elsewhere. Zero dependencies.
// Usage: node scripts/check-coverage.mjs [--tests <dir>] [--state <path>] [--claims-acs <path-to-task-yml>]

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

// The requirement-group folders engineering/TESTING.md names as <area>.
const TESTING_AREAS = ['accounts', 'import', 'transactions', 'transfers', 'categories', 'reports'];

// Matches the full tests/<area>/AC-0NN.<slug>.test.ts path (relative to the
// tests root), not just the basename - so a file in the wrong folder, or
// with an uppercase/underscored slug, is correctly not counted as coverage.
const COVERAGE_PATH_RE = new RegExp(
  `^(${TESTING_AREAS.join('|')})/AC-(\\d{3})\\.[a-z0-9]+(?:-[a-z0-9]+)*\\.test\\.ts$`
);

function die(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = { tests: 'tests', state: 'project.state.yaml', claimsAcs: undefined };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--tests') args.tests = argv[++i];
    else if (argv[i] === '--state') args.state = argv[++i];
    else if (argv[i] === '--claims-acs') args.claimsAcs = argv[++i];
  }
  return args;
}

function extractScalar(text, key) {
  const m = text.match(new RegExp(`^${key}:[ \\t]*(.*)$`, 'm'));
  if (!m) return undefined;
  return m[1].replace(/[ \t]+#.*$/, '').trim();
}

function extractList(text, key) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((l) => new RegExp(`^${key}:[ \\t]*(#.*)?$`).test(l));
  if (start === -1) return undefined;
  const items = [];
  for (let i = start + 1; i < lines.length; i++) {
    const m = lines[i].match(/^[ \t]+-[ \t]+(.+)$/);
    if (!m) break;
    items.push(m[1].replace(/[ \t]+#.*$/, '').trim().replace(/^["']|["']$/g, ''));
  }
  return items;
}

// claims_acs may be written as the literal inline empty list (claims_acs: [])
// or as a multi-line "- AC-0NN" block; both are valid per engineering/TESTING.md.
// Returns undefined when the field is absent entirely.
function extractClaimsAcs(text) {
  const inline = text.match(/^claims_acs:[ \t]*\[([^\]]*)\][ \t]*(#.*)?$/m);
  if (inline) {
    const inner = inline[1].trim();
    if (inner === '') return [];
    return inner.split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  }
  return extractList(text, 'claims_acs');
}

function normalizeAcId(raw) {
  const m = raw.match(/^(?:AC-)?(\d{3})$/);
  return m ? m[1] : raw;
}

function toPosix(p) {
  return p.split(/[\\/]/).join('/');
}

// Extracts it()/test() title strings - not just any occurrence of
// [AC-0NN] anywhere in the file, which would also match a comment or a
// stray literal that isn't actually a test's title.
function testTitlesIn(content) {
  const titles = [];
  const re = /\b(?:it|test)\s*\(\s*(['"`])((?:\\.|(?!\1)[^\\\n])*)\1/g;
  let m;
  while ((m = re.exec(content))) titles.push(m[2]);
  return titles;
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    // tests/fixtures/ holds deliberately broken inputs for this task's own
    // fixture tests, not application test files - scanning it would count
    // those fixtures as (mis)covering real AC ids.
    if (entry === 'fixtures') continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

// Resolves the set of AC ids this run must check: an explicit --claims-acs
// task file, or - mirroring validate-task.mjs's own default resolution -
// project.state.yaml's active_task. active_task: none is the resting state
// (orchestration/HITL_GUIDE.md convention): nothing is active, nothing to check.
function resolveClaimsAcsIds(args) {
  let taskPath = args.claimsAcs;
  if (!taskPath) {
    if (!existsSync(args.state)) die(`${args.state} does not exist`);
    const stateText = readFileSync(args.state, 'utf8');
    const activeTask = extractScalar(stateText, 'active_task');
    if (!activeTask) die(`${args.state} has no active_task`);
    if (activeTask === 'none') {
      console.log('OK: resting: active_task is none, nothing to check');
      process.exit(0);
    }
    taskPath = `orchestration/tasks/${activeTask}.yml`;
  }
  if (!existsSync(taskPath)) die(`${taskPath} does not exist`);
  const taskText = readFileSync(taskPath, 'utf8');
  const claims = extractClaimsAcs(taskText);
  if (claims === undefined) die(`${taskPath} has no claims_acs field`);
  return { taskPath, ids: new Set(claims.map(normalizeAcId)) };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const { taskPath, ids: claimedIds } = resolveClaimsAcsIds(args);

  if (claimedIds.size === 0) {
    console.log(`OK: ${taskPath}'s claims_acs is empty, nothing to check`);
    process.exit(0);
  }

  const testFiles = walk(args.tests).filter((f) => /\.test\.ts$/.test(f));

  const covered = new Map();
  for (const file of testFiles) {
    const rel = toPosix(relative(args.tests, file));
    const m = rel.match(COVERAGE_PATH_RE);
    if (!m) continue;
    const id = m[2];
    if (!claimedIds.has(id)) continue;
    if (!covered.has(id)) covered.set(id, []);
    covered.get(id).push(file);
  }

  const violations = [];

  for (const id of claimedIds) {
    if (!covered.has(id)) {
      violations.push(`AC-${id} has no matching test file (expected tests/<area>/AC-${id}.<slug>.test.ts)`);
    }
  }

  for (const [id, files] of covered) {
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      const titles = testTitlesIn(content);
      if (!titles.some((t) => t.startsWith(`[AC-${id}]`))) {
        violations.push(`${file} is named for AC-${id} but no test title is prefixed [AC-${id}]`);
      }
    }
  }

  if (violations.length) {
    console.error(`INVALID: coverage against ${taskPath}'s claims_acs`);
    for (const v of violations) console.error(`  - ${v}`);
    process.exit(1);
  }

  console.log(`OK: every AC id in ${taskPath}'s claims_acs has a matching, correctly titled test file under ${args.tests}/`);
  process.exit(0);
}

main();

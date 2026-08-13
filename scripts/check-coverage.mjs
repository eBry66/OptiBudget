#!/usr/bin/env node
// scripts/check-coverage.mjs - fails when an AC id in product/ACCEPTANCE.md has
// no matching test, per the naming contract in engineering/TESTING.md:
// test file name tests/<area>/AC-0NN.<slug>.test.ts, test title prefixed
// [AC-0NN]. Zero dependencies.
// Usage: node scripts/check-coverage.mjs [--acceptance <path>] [--tests <dir>]

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
  const args = { acceptance: 'product/ACCEPTANCE.md', tests: 'tests' };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--acceptance') args.acceptance = argv[++i];
    else if (argv[i] === '--tests') args.tests = argv[++i];
  }
  return args;
}

function acIdsIn(text) {
  const ids = new Set();
  const re = /\*\*AC-(\d{3})\*\*/g;
  let m;
  while ((m = re.exec(text))) ids.add(m[1]);
  return ids;
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

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!existsSync(args.acceptance)) die(`${args.acceptance} does not exist`);
  const acceptanceText = readFileSync(args.acceptance, 'utf8');
  const acIds = acIdsIn(acceptanceText);

  const testFiles = walk(args.tests).filter((f) => /\.test\.ts$/.test(f));

  const covered = new Map();
  for (const file of testFiles) {
    const rel = toPosix(relative(args.tests, file));
    const m = rel.match(COVERAGE_PATH_RE);
    if (!m) continue;
    const id = m[2];
    if (!covered.has(id)) covered.set(id, []);
    covered.get(id).push(file);
  }

  const violations = [];

  for (const id of acIds) {
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
    console.error(`INVALID: coverage against ${args.acceptance}`);
    for (const v of violations) console.error(`  - ${v}`);
    process.exit(1);
  }

  console.log(`OK: every AC id in ${args.acceptance} has a matching, correctly titled test file under ${args.tests}/`);
  process.exit(0);
}

main();

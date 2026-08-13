#!/usr/bin/env node
// scripts/check-coverage.mjs - fails when an AC id in product/ACCEPTANCE.md has
// no matching test, per the naming contract in engineering/TESTING.md:
// test file name tests/<area>/AC-0NN.<slug>.test.ts, test title prefixed
// [AC-0NN]. Zero dependencies.
// Usage: node scripts/check-coverage.mjs [--acceptance <path>] [--tests <dir>]

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

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

function walk(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
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

  const FILENAME_RE = /^AC-(\d{3})\..+\.test\.ts$/;
  const testFiles = walk(args.tests).filter((f) => /\.test\.ts$/.test(f));

  const covered = new Map();
  for (const file of testFiles) {
    const base = file.split(/[\\/]/).pop();
    const m = base.match(FILENAME_RE);
    if (!m) continue;
    if (!covered.has(m[1])) covered.set(m[1], []);
    covered.get(m[1]).push(file);
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
      if (!content.includes(`[AC-${id}]`)) {
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

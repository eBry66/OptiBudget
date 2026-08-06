#!/usr/bin/env node
// scripts/template-sync.mjs - pull machinery files from the dev-template.
// Zero dependencies. Copies files and writes template.lock. Commits nothing.
//
// Usage, from the project root:
//   node scripts/template-sync.mjs                 # sync to newest tag
//   node scripts/template-sync.mjs --tag v1.2.0    # sync to a specific tag
//   node scripts/template-sync.mjs --dry-run       # report only, change nothing
//
// After it runs: read `git diff`, run `node scripts/next.mjs check`, then commit.

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, rmSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const LOCK = 'template.lock';
const MANIFEST = 'template.manifest.yaml';

function die(msg) { console.error('ERROR: ' + msg); process.exit(2); }
function git(args, opts = {}) { return execFileSync('git', args, { encoding: 'utf8', ...opts }).trim(); }

// --- restricted YAML reader: `key: value` scalars and `- item` lists ---------
function readSimpleYaml(file) {
  const out = {};
  let listKey = null;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const item = line.match(/^[ \t]+-[ \t]+(.+?)[ \t]*$/);
    if (item && listKey) { out[listKey].push(item[1].replace(/^["']|["']$/g, '')); continue; }
    const kv = line.match(/^([a-z_]+):[ \t]*(.*?)[ \t]*$/);
    if (!kv) continue;
    const [, key, raw] = kv;
    if (raw === '') { listKey = key; out[key] = []; }
    else { listKey = null; out[key] = raw.replace(/^["']|["']$/g, ''); }
  }
  return out;
}

// --- arguments --------------------------------------------------------------
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const tagArg = args.includes('--tag') ? args[args.indexOf('--tag') + 1] : null;

// --- preconditions ----------------------------------------------------------
if (!existsSync('.git')) die('run this from the project root (no .git here)');
if (!existsSync(LOCK)) die(`missing ${LOCK}. Create it with template_repo and template_version.`);

const lock = readSimpleYaml(LOCK);
if (!lock.template_repo) die(`${LOCK} has no template_repo`);

if (!dryRun && git(['status', '--porcelain']).length > 0) {
  die('working tree is dirty. Commit or stash first, so the sync diff is readable on its own.');
}

// --- resolve the tag --------------------------------------------------------
function semverKey(t) {
  const m = t.match(/^v?(\d+)\.(\d+)\.(\d+)$/);
  return m ? Number(m[1]) * 1e6 + Number(m[2]) * 1e3 + Number(m[3]) : -1;
}
let tag = tagArg;
if (!tag) {
  const refs = git(['ls-remote', '--tags', '--refs', lock.template_repo])
    .split('\n').map((l) => l.split('\t')[1]).filter(Boolean)
    .map((r) => r.replace('refs/tags/', ''))
    .filter((t) => semverKey(t) >= 0)
    .sort((a, b) => semverKey(a) - semverKey(b));
  if (!refs.length) die('the template repository has no semver tags. Tag a release first.');
  tag = refs[refs.length - 1];
}
if (lock.template_version && tag.replace(/^v/, '') === String(lock.template_version).replace(/^v/, '')) {
  console.log(`Already on template ${tag}. Nothing to do.`);
  process.exit(0);
}

// --- clone the template -----------------------------------------------------
const tmp = mkdtempSync(join(tmpdir(), 'devtpl-'));
try {
  console.log(`Fetching template ${tag} ...`);
  try {
    git(['clone', '--quiet', '--depth', '1', '--branch', tag, lock.template_repo, tmp], { stdio: 'pipe' });
  } catch (e) {
    die(`could not clone ${lock.template_repo} at ${tag}. Check the URL and that the tag exists.`);
  }

  const manifestPath = join(tmp, MANIFEST);
  if (!existsSync(manifestPath)) die(`template ${tag} has no ${MANIFEST}`);
  const manifest = readSimpleYaml(manifestPath);
  const machinery = manifest.machinery || [];
  if (!machinery.length) die(`${MANIFEST} lists no machinery paths`);
  if (machinery.some((p) => p.includes('*'))) {
    die('machinery contains a wildcard. The manifest must be an explicit allowlist; a wildcard will eventually overwrite a content file.');
  }

  // --- copy ------------------------------------------------------------------
  const added = [], changed = [], same = [], missing = [];
  for (const rel of machinery) {
    const src = join(tmp, rel);
    if (!existsSync(src)) { missing.push(rel); continue; }
    const srcBody = readFileSync(src);
    if (!existsSync(rel)) added.push(rel);
    else if (Buffer.compare(srcBody, readFileSync(rel)) === 0) { same.push(rel); continue; }
    else changed.push(rel);
    if (!dryRun) { mkdirSync(dirname(rel), { recursive: true }); copyFileSync(src, rel); }
  }

  // --- report ----------------------------------------------------------------
  const label = dryRun ? 'WOULD ' : '';
  for (const p of added) console.log(`${label}ADD      ${p}`);
  for (const p of changed) console.log(`${label}OVERWRITE ${p}`);
  for (const p of same) console.log(`unchanged  ${p}`);
  for (const p of missing) console.log(`MISSING IN TEMPLATE  ${p}   (declared in manifest, absent from ${tag})`);

  if (dryRun) { console.log('\nDry run. Nothing was written.'); process.exit(0); }

  writeFileSync(LOCK, [
    `template_repo: ${lock.template_repo}`,
    `template_version: ${tag.replace(/^v/, '')}`,
    `synced_at: ${new Date().toISOString().slice(0, 10)}`,
    '',
  ].join('\n'));

  console.log(`\nSynced to ${tag}. ${added.length} added, ${changed.length} overwritten, ${same.length} unchanged.`);
  console.log('\nNow, in this order:');
  console.log('  1. git diff                      read every change before accepting it');
  console.log('  2. node scripts/next.mjs check   AGENTS.md changes will cascade staleness');
  console.log('  3. git add . ; git commit -m "Sync template ' + tag + '"');
  console.log('\nRead the template CHANGELOG for this version. Document-set changes are never applied by this script.');
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

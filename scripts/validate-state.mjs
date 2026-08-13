#!/usr/bin/env node
// scripts/validate-state.mjs - validates project.state.yaml against the shape
// documented in orchestration/HITL_GUIDE.md §4.12. Zero dependencies.
// Usage: node scripts/validate-state.mjs [path-to-state-yaml]

import { readFileSync, existsSync } from 'node:fs';

const REQUIRED_KEYS = [
  'version', 'gate', 'active_task', 'attempt', 'authorized_branch',
  'allowed_paths', 'required_checks', 'frozen',
];

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

function main() {
  const path = process.argv[2] || 'project.state.yaml';
  if (!existsSync(path)) {
    console.error(`ERROR: ${path} does not exist`);
    process.exit(1);
  }
  const text = readFileSync(path, 'utf8');
  const violations = [];

  for (const key of REQUIRED_KEYS) {
    const scalar = extractScalar(text, key);
    const list = extractList(text, key);
    if (scalar === undefined && list === undefined) {
      violations.push(`missing required key: ${key}`);
    }
  }

  const gate = extractScalar(text, 'gate');
  if (gate !== undefined && !/^-?\d+$/.test(gate)) {
    violations.push(`gate must be an integer, got: ${JSON.stringify(gate)}`);
  }

  const attempt = extractScalar(text, 'attempt');
  if (attempt !== undefined && !/^-?\d+$/.test(attempt)) {
    violations.push(`attempt must be an integer, got: ${JSON.stringify(attempt)}`);
  }

  const frozen = extractScalar(text, 'frozen');
  if (frozen !== undefined && frozen !== 'true' && frozen !== 'false') {
    violations.push(`frozen must be a boolean (true or false), got: ${JSON.stringify(frozen)}`);
  }

  const allowedPaths = extractList(text, 'allowed_paths');
  if (allowedPaths !== undefined && allowedPaths.length === 0) {
    violations.push('allowed_paths must be a non-empty list');
  }

  // Resting/active invariant (product/DECISIONS.md, 2026-08-13): resting
  // requires attempt==0 and authorized_branch==main; active requires
  // attempt>=1 and authorized_branch!=main. This is layered on top of the
  // allowed_paths check above, which is unconditional in both shapes.
  const activeTask = extractScalar(text, 'active_task');
  const authorizedBranch = extractScalar(text, 'authorized_branch');
  if (activeTask === 'none') {
    if (attempt !== undefined && attempt !== '0') {
      violations.push(`attempt must be 0 when active_task is none (resting), got: ${JSON.stringify(attempt)}`);
    }
    if (authorizedBranch !== undefined && authorizedBranch !== 'main') {
      violations.push(`authorized_branch must be main when active_task is none (resting), got: ${JSON.stringify(authorizedBranch)}`);
    }
  } else if (activeTask !== undefined) {
    if (attempt !== undefined && /^-?\d+$/.test(attempt) && Number(attempt) < 1) {
      violations.push(`attempt must be >= 1 when a task is active (active_task: ${activeTask}), got: ${JSON.stringify(attempt)}`);
    }
    if (authorizedBranch !== undefined && authorizedBranch === 'main') {
      violations.push(`authorized_branch must not be main when a task is active (active_task: ${activeTask})`);
    }
  }

  const requiredChecks = extractList(text, 'required_checks');
  if (requiredChecks !== undefined && requiredChecks.length === 0) {
    violations.push('required_checks must be a non-empty list');
  }

  if (violations.length) {
    console.error(`INVALID: ${path}`);
    for (const v of violations) console.error(`  - ${v}`);
    process.exit(1);
  }

  console.log(`OK: ${path} matches the project.state.yaml shape (HITL_GUIDE.md §4.12)`);
  process.exit(0);
}

main();

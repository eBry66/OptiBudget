#!/usr/bin/env node
// scripts/validate-task.mjs - validates a task YAML against project.state.yaml:
// (1) the task's allowed_paths is a subset of project.state.yaml's allowed_paths;
// (2) every file the task's diff touches falls within the task's own
//     allowed_paths.
// Zero dependencies.
// Usage: node scripts/validate-task.mjs [--task <path>] [--state <path>] [--base <ref>]

import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

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

function die(msg) {
  console.error(`ERROR: ${msg}`);
  process.exit(1);
}

function readYamlFile(path, label) {
  if (!existsSync(path)) die(`${label} does not exist: ${path}`);
  return readFileSync(path, 'utf8');
}

function parseArgs(argv) {
  const args = { task: undefined, state: 'project.state.yaml', base: undefined };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--task') args.task = argv[++i];
    else if (argv[i] === '--state') args.state = argv[++i];
    else if (argv[i] === '--base') args.base = argv[++i];
  }
  return args;
}

function isWithinAllowedPaths(file, allowedPaths) {
  return allowedPaths.some((p) => file === p || file.startsWith(p.endsWith('/') ? p : `${p}/`));
}

function resolveBaseRef(args) {
  if (args.base) return args.base;
  if (process.env.GITHUB_BASE_REF) return `origin/${process.env.GITHUB_BASE_REF}`;
  return 'main';
}

function diffFiles(base) {
  try {
    const out = execFileSync('git', ['diff', '--name-only', `${base}...HEAD`], { encoding: 'utf8' });
    return out.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  } catch (err) {
    die(`could not compute diff against ${base}: ${err.message}`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  const stateText = readYamlFile(args.state, 'state file');
  const stateAllowedPaths = extractList(stateText, 'allowed_paths');
  if (stateAllowedPaths === undefined) die(`${args.state} has no allowed_paths list`);

  let taskPath = args.task;
  if (!taskPath) {
    const activeTask = extractScalar(stateText, 'active_task');
    if (!activeTask) die(`${args.state} has no active_task and no --task was given`);
    taskPath = `orchestration/tasks/${activeTask}.yml`;
  }

  const taskText = readYamlFile(taskPath, 'task file');
  const taskAllowedPaths = extractList(taskText, 'allowed_paths');
  if (taskAllowedPaths === undefined || taskAllowedPaths.length === 0) {
    die(`${taskPath} has no allowed_paths list`);
  }

  const escaping = taskAllowedPaths.filter((p) => !stateAllowedPaths.includes(p));
  if (escaping.length) {
    console.error(`INVALID: ${taskPath}`);
    console.error(`  - allowed_paths escapes ${args.state}'s allowed_paths: ${escaping.join(', ')}`);
    process.exit(1);
  }

  const base = resolveBaseRef(args);
  const changedFiles = diffFiles(base);

  const outside = changedFiles.filter((f) => !isWithinAllowedPaths(f, taskAllowedPaths));
  if (outside.length) {
    console.error(`INVALID: diff against ${base} touches files outside ${taskPath}'s allowed_paths:`);
    for (const f of outside) console.error(`  - ${f}`);
    process.exit(1);
  }

  console.log(
    `OK: ${taskPath}'s allowed_paths is a subset of ${args.state}'s, and the diff ` +
    `against ${base} (${changedFiles.length} file(s)) stays within it`
  );
  process.exit(0);
}

main();

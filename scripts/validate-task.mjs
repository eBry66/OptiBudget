#!/usr/bin/env node
// scripts/validate-task.mjs - validates a task YAML against project.state.yaml:
// (1) the task's id, branch, and attempt equal project.state.yaml's
//     active_task, authorized_branch, and attempt;
// (2) the task's allowed_paths is a subset of project.state.yaml's allowed_paths;
// (3) every file the task's diff touches falls within the task's own
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

function toInt(raw) {
  return /^-?\d+$/.test(raw ?? '') ? Number(raw) : NaN;
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
    if (activeTask === 'none') {
      console.log(`OK: ${args.state} is resting (active_task: none); nothing to validate`);
      process.exit(0);
    }
    taskPath = `orchestration/tasks/${activeTask}.yml`;
  }

  const taskText = readYamlFile(taskPath, 'task file');

  const taskId = extractScalar(taskText, 'id');
  const taskBranch = extractScalar(taskText, 'branch');
  const taskAttempt = extractScalar(taskText, 'attempt');
  const stateActiveTask = extractScalar(stateText, 'active_task');
  const stateAuthorizedBranch = extractScalar(stateText, 'authorized_branch');
  const stateAttempt = extractScalar(stateText, 'attempt');

  const identityViolations = [];
  if (taskId !== stateActiveTask) {
    identityViolations.push(
      `id (${JSON.stringify(taskId)}) does not equal ${args.state}'s active_task (${JSON.stringify(stateActiveTask)})`
    );
  }
  if (taskBranch !== stateAuthorizedBranch) {
    identityViolations.push(
      `branch (${JSON.stringify(taskBranch)}) does not equal ${args.state}'s authorized_branch (${JSON.stringify(stateAuthorizedBranch)})`
    );
  }
  const taskAttemptNum = toInt(taskAttempt);
  const stateAttemptNum = toInt(stateAttempt);
  if (Number.isNaN(taskAttemptNum) || Number.isNaN(stateAttemptNum) || taskAttemptNum !== stateAttemptNum) {
    identityViolations.push(
      `attempt (${JSON.stringify(taskAttempt)}) does not equal ${args.state}'s attempt (${JSON.stringify(stateAttempt)}) as an integer`
    );
  }
  if (identityViolations.length) {
    console.error(`INVALID: ${taskPath}`);
    for (const v of identityViolations) console.error(`  - ${v}`);
    process.exit(1);
  }

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

  // A task's own YAML and project.state.yaml are structurally guaranteed to
  // appear in the diff whenever a branch opens or closes that task, and
  // neither belongs in a task's own allowed_paths (they're state-machine
  // bookkeeping, not something the task writes to). Exempt exactly these
  // two paths from the outside-allowed_paths check, and nothing else.
  const exemptPaths = new Set([`orchestration/tasks/${taskId}.yml`, 'project.state.yaml']);
  const outside = changedFiles.filter((f) => !isWithinAllowedPaths(f, taskAllowedPaths) && !exemptPaths.has(f));
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

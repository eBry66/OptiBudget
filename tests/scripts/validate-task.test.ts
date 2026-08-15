import { describe, it, expect } from 'vitest';
import { spawnSync, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SCRIPT = fileURLToPath(new URL('../../scripts/validate-task.mjs', import.meta.url));
const FIXTURES = fileURLToPath(new URL('../fixtures/validate-task/', import.meta.url));

// A self-contained throwaway git repo, so diff-touching-allowed_paths tests
// exercise a real `git diff` without depending on this project's own,
// mutable commit history.
function makeTempRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'validate-task-diff-'));
  const git = (args: string[]) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' });
  git(['init', '-q']);
  git(['config', 'user.email', 'test@example.com']);
  git(['config', 'user.name', 'Test']);
  writeFileSync(join(dir, 'README.md'), 'base\n');
  git(['add', '.']);
  git(['commit', '-q', '-m', 'base']);
  const base = git(['rev-parse', 'HEAD']).trim();
  return { dir, git, base };
}

const TASK_777 = [
  'id: task-777',
  'branch: task-777-example',
  'attempt: 1',
  'claims_acs: []',
  'allowed_paths:',
  '  - scripts/',
  '',
].join('\n');

const STATE_FOR_777 = [
  'version: 1',
  'gate: 1',
  'active_task: task-777',
  'attempt: 1',
  'authorized_branch: task-777-example',
  'allowed_paths:',
  '  - scripts/',
  'required_checks:',
  '  - unit',
  'frozen: false',
  '',
].join('\n');

function run(taskFile: string, extraArgs: string[] = []) {
  return spawnSync(
    'node',
    [SCRIPT, '--task', `${FIXTURES}${taskFile}`, '--state', `${FIXTURES}state.yaml`, ...extraArgs],
    { encoding: 'utf8' }
  );
}

describe('scripts/validate-task.mjs', () => {
  it("fails when a task YAML's id/branch/attempt do not equal project.state.yaml's", () => {
    const result = run('identity-mismatch-task.yml');
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("does not equal");
    expect(result.stderr).toContain('active_task');
    expect(result.stderr).toContain('authorized_branch');
    expect(result.stderr).toContain('as an integer');
  });

  it("fails when a task YAML's allowed_paths escapes project.state.yaml's", () => {
    const result = run('escaping-task.yml');
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('allowed_paths escapes');
    expect(result.stderr).toContain('src/');
  });

  it('fails when a task YAML has no claims_acs field at all', () => {
    const result = run('missing-claims-acs-task.yml');
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('claims_acs');
  });

  it('fails when claims_acs names an AC id absent from product/ACCEPTANCE.md, naming it', () => {
    const result = run('unknown-ac-task.yml', ['--acceptance', `${FIXTURES}ACCEPTANCE.md`]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('AC-999');
  });

  it('passes when allowed_paths is a subset and the diff (here, empty) stays within it', () => {
    const result = run('valid-task.yml', ['--base', 'HEAD']);
    expect(result.status).toBe(0);
  });

  it('exits cleanly when active_task is none and no --task is given', () => {
    const result = spawnSync(
      'node',
      [SCRIPT, '--state', `${FIXTURES}resting-state.yaml`],
      { encoding: 'utf8' }
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('resting');
  });

  it("passes when the diff touches only the task's own YAML and project.state.yaml", () => {
    const { dir, git, base } = makeTempRepo();
    try {
      mkdirSync(join(dir, 'orchestration', 'tasks'), { recursive: true });
      writeFileSync(join(dir, 'orchestration', 'tasks', 'task-777.yml'), TASK_777);
      writeFileSync(join(dir, 'project.state.yaml'), STATE_FOR_777);
      git(['add', '.']);
      git(['commit', '-q', '-m', 'open task-777']);

      const result = spawnSync('node', [SCRIPT, '--base', base], { cwd: dir, encoding: 'utf8' });
      expect(result.status).toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('still fails when the diff touches a file outside allowed_paths and outside the task/state exception', () => {
    const { dir, git, base } = makeTempRepo();
    try {
      mkdirSync(join(dir, 'orchestration', 'tasks'), { recursive: true });
      writeFileSync(join(dir, 'orchestration', 'tasks', 'task-777.yml'), TASK_777);
      writeFileSync(join(dir, 'project.state.yaml'), STATE_FOR_777);
      mkdirSync(join(dir, 'product'), { recursive: true });
      writeFileSync(join(dir, 'product', 'DECISIONS.md'), 'unrelated change\n');
      git(['add', '.']);
      git(['commit', '-q', '-m', 'open task-777 plus an out-of-scope file']);

      const result = spawnSync('node', [SCRIPT, '--base', base], { cwd: dir, encoding: 'utf8' });
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain('outside');
      expect(result.stderr).toContain('product/DECISIONS.md');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

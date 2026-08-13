import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../../scripts/validate-task.mjs', import.meta.url));
const FIXTURES = fileURLToPath(new URL('../fixtures/validate-task/', import.meta.url));

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
});

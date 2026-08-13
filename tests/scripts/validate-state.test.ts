import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../../scripts/validate-state.mjs', import.meta.url));
const FIXTURES = fileURLToPath(new URL('../fixtures/validate-state/', import.meta.url));

function run(path: string) {
  return spawnSync('node', [SCRIPT, path], { encoding: 'utf8' });
}

describe('scripts/validate-state.mjs', () => {
  it('fails on a state file missing a required key', () => {
    const result = run(`${FIXTURES}missing-frozen.state.yaml`);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('missing required key: frozen');
  });

  it('fails when gate is not an integer', () => {
    const result = run(`${FIXTURES}gate-not-integer.state.yaml`);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('gate must be an integer');
  });

  it('passes on the real project.state.yaml', () => {
    const result = run('project.state.yaml');
    expect(result.status).toBe(0);
  });

  it('passes on a valid resting state (active_task: none, attempt: 0, authorized_branch: main)', () => {
    const result = run(`${FIXTURES}resting-valid.state.yaml`);
    expect(result.status).toBe(0);
  });

  it('fails on a resting state with an empty allowed_paths (unconditional check still applies at rest)', () => {
    const result = run(`${FIXTURES}resting-empty-allowed-paths.state.yaml`);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('allowed_paths must be a non-empty list');
  });

  it('fails when active_task is none but attempt is not 0', () => {
    const result = run(`${FIXTURES}resting-bad-attempt.state.yaml`);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('attempt must be 0 when active_task is none');
  });

  it('fails when active_task is none but authorized_branch is not main', () => {
    const result = run(`${FIXTURES}resting-bad-branch.state.yaml`);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('authorized_branch must be main when active_task is none');
  });

  it('fails when a task is active but attempt is 0', () => {
    const result = run(`${FIXTURES}active-bad-attempt.state.yaml`);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('attempt must be >= 1 when a task is active');
  });

  it('fails when a task is active but authorized_branch is main', () => {
    const result = run(`${FIXTURES}active-branch-is-main.state.yaml`);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('authorized_branch must not be main when a task is active');
  });
});

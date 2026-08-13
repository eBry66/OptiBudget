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
});

import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT = fileURLToPath(new URL('../../scripts/check-coverage.mjs', import.meta.url));
const FIXTURES = fileURLToPath(new URL('../fixtures/check-coverage/', import.meta.url));

function run(caseDir: string) {
  return spawnSync(
    'node',
    [
      SCRIPT,
      '--claims-acs', `${FIXTURES}${caseDir}/task.yml`,
      '--tests', `${FIXTURES}${caseDir}/tests`,
    ],
    { encoding: 'utf8' }
  );
}

describe('scripts/check-coverage.mjs', () => {
  it('fails when a claimed AC id has no matching test file, naming it', () => {
    const result = run('missing-ac');
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('AC-002 has no matching test file');
  });

  it('fails when a matched test file has no title prefixed [AC-0NN]', () => {
    const result = run('bad-title');
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('no test title is prefixed [AC-001]');
  });

  it("fails when the test file's area folder is not one of TESTING.md's named areas", () => {
    const result = run('wrong-area');
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('AC-001 has no matching test file');
  });

  it('fails when [AC-0NN] appears only in a comment, not as a real test title', () => {
    const result = run('stray-mention');
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('no test title is prefixed [AC-001]');
  });

  it('passes when every AC id in claims_acs has a matching, correctly titled test file', () => {
    const result = run('satisfied');
    expect(result.status).toBe(0);
  });

  it('passes with nothing checked when claims_acs is the literal empty list', () => {
    const result = run('empty-claims');
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('empty');
  });

  it('fails when a claims_acs item is a bare digit id instead of AC-0NN', () => {
    const result = run('bare-digit-claims');
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('malformed');
    expect(result.stderr).toContain('AC-0NN');
  });

  it('fails when claims_acs is a non-list scalar value', () => {
    const result = run('malformed-claims');
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('malformed');
  });

  it('exits cleanly when active_task is none and no --claims-acs is given', () => {
    const result = spawnSync(
      'node',
      [SCRIPT, '--state', `${FIXTURES}resting-state.yaml`],
      { encoding: 'utf8' }
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('resting');
  });
});

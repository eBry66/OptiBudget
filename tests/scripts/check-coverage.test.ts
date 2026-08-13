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
      '--acceptance', `${FIXTURES}${caseDir}/ACCEPTANCE.md`,
      '--tests', `${FIXTURES}${caseDir}/tests`,
    ],
    { encoding: 'utf8' }
  );
}

describe('scripts/check-coverage.mjs', () => {
  it('fails when an AC id has no matching test file', () => {
    const result = run('missing-ac');
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('AC-002 has no matching test file');
  });

  it('fails when a matched test file has no title prefixed [AC-0NN]', () => {
    const result = run('bad-title');
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('no test title is prefixed [AC-001]');
  });
});

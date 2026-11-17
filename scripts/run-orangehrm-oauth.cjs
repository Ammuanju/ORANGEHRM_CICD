const { spawnSync } = require('node:child_process');
const { resolve } = require('node:path');

const cliPath = require.resolve('@playwright/test/cli');
const result = spawnSync(
  process.execPath,
  [
    cliPath,
    'test',
    'tests/api/orangehrm-oauth.spec.ts',
    '--headed',
    '--workers=1',
  ],
  {
    env: {
      ...process.env,
      ORANGEHRM_OAUTH_INTERACTIVE: '1',
    },
    stdio: 'inherit',
    cwd: resolve(__dirname, '..'),
  },
);

if (result.error) {
  console.error(`Could not start the OrangeHRM OAuth test: ${result.error.message}`);
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 1;
}

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const TOKEN_FILE = resolve(
  process.cwd(),
  'playwright',
  '.auth',
  'orangehrm-token.json',
);
const TOKEN_EXPIRY_BUFFER_MS = 30_000;

test('API_005 - Verify Invalid Access Token', async ({ request }) => {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error('BASE_URL is missing from the environment.');
  }

  let endpoint: URL;
  try {
    endpoint = new URL('/web/index.php/api/v2/leave/leave-types', baseUrl);
  } catch {
    throw new Error('BASE_URL must be a valid URL.');
  }

  const response = await request.get(endpoint.toString(), {
    headers: {
      Authorization: 'Bearer invalid_test_token',
      Accept: 'application/json',
    },
  });

  expect(response.status()).toBe(401);
});

test.describe('API_006 - Verify Invalid API Endpoint', () => {
  test.describe.configure({ retries: 0 });

  test('returns 404 for an authenticated request to an invalid endpoint', async ({
    request,
  }) => {
    const baseUrl = process.env.BASE_URL;
    if (!baseUrl) {
      throw new Error('BASE_URL is missing from the environment.');
    }

    const accessToken = await readAccessToken();
    let endpoint: URL;
    try {
      endpoint = new URL(
        '/web/index.php/api/v2/leave/invalid-test-endpoint',
        baseUrl,
      );
    } catch {
      throw new Error('BASE_URL must be a valid URL.');
    }

    const response = await request.get(endpoint.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    expect(response.status()).toBe(404);
  });
});

async function readAccessToken(): Promise<string> {
  let fileContents: string;
  try {
    fileContents = await readFile(TOKEN_FILE, 'utf8');
  } catch (error) {
    if (isRecord(error) && error.code === 'ENOENT') {
      throw new Error(
        'OAuth token file is missing. Run `npm run orangehrm:oauth` to authenticate and save a token.',
      );
    }
    throw new Error('Could not read the OrangeHRM OAuth token file.');
  }

  let tokenJson: unknown;
  try {
    tokenJson = JSON.parse(fileContents);
  } catch {
    throw new Error(
      'OAuth token file is not valid JSON. Run `npm run orangehrm:oauth` to create a new token.',
    );
  }

  if (
    !isRecord(tokenJson) ||
    typeof tokenJson.access_token !== 'string' ||
    tokenJson.access_token.length === 0 ||
    typeof tokenJson.expires_at !== 'number' ||
    !Number.isFinite(tokenJson.expires_at)
  ) {
    throw new Error(
      'OAuth token file is missing a valid access token or expiry. Run `npm run orangehrm:oauth` to authenticate again.',
    );
  }

  if (Date.now() >= tokenJson.expires_at - TOKEN_EXPIRY_BUFFER_MS) {
    throw new Error(
      'OrangeHRM access token is expired or near expiry. Run `npm run orangehrm:oauth` to authenticate again.',
    );
  }

  return tokenJson.access_token;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

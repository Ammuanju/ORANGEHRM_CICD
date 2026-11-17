import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

const TOKEN_FILE = resolve(
  process.cwd(),
  'playwright',
  '.auth',
  'orangehrm-token.json',
);
const LEAVE_TYPES_PATH = '/web/index.php/api/v2/leave/leave-types';
const TOKEN_EXPIRY_BUFFER_MS = 30_000;

interface StoredToken {
  access_token: string;
  expires_at: number;
}

test.use({ trace: 'off' });

test('GET OrangeHRM Leave Types', async ({ request }) => {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error('BASE_URL is missing from the environment.');
  }

  const accessToken = await readAccessToken();
  let endpoint: URL;
  try {
    endpoint = new URL(LEAVE_TYPES_PATH, baseUrl);
  } catch {
    throw new Error('BASE_URL must be a valid URL.');
  }

  const response = await request.get(endpoint.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (response.status() === 401) {
    throw new Error(
      'OrangeHRM rejected the access token (401). It may be expired or revoked; run `npm run orangehrm:oauth` to authenticate again.',
    );
  }

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']?.toLowerCase()).toContain(
    'application/json',
  );

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error('OrangeHRM response body is not valid JSON.');
  }

  if (!isRecord(body)) {
    throw new Error('OrangeHRM response body must be a JSON object.');
  }

  if (!Array.isArray(body.data)) {
    throw new Error('OrangeHRM response field `data` must be an array.');
  }

  if (isRecord(body.meta) && 'total' in body.meta) {
    if (typeof body.meta.total !== 'number') {
      throw new Error('OrangeHRM response field `meta.total` must be a number.');
    }
    expect(Number.isFinite(body.meta.total)).toBe(true);
    expect(body.meta.total).toBeGreaterThanOrEqual(0);
  }
});

test('API_004 - Filter Leave Types by Name', async ({ request }) => {
  const baseUrl = process.env.BASE_URL;
  if (!baseUrl) {
    throw new Error('BASE_URL is missing from the environment.');
  }

  const accessToken = await readAccessToken();
  let endpoint: URL;
  try {
    endpoint = new URL(LEAVE_TYPES_PATH, baseUrl);
  } catch {
    throw new Error('BASE_URL must be a valid URL.');
  }
  endpoint.searchParams.set('name', 'US');

  const response = await request.get(endpoint.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });

  if (response.status() === 401) {
    throw new Error(
      'OrangeHRM rejected the access token (401). It may be expired or revoked; run `npm run orangehrm:oauth` to authenticate again.',
    );
  }

  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']?.toLowerCase()).toContain(
    'application/json',
  );

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error('OrangeHRM response body is not valid JSON.');
  }

  if (!isRecord(body)) {
    throw new Error('OrangeHRM response body must be a JSON object.');
  }
  if (!Array.isArray(body.data)) {
    throw new Error('OrangeHRM response field `data` must be an array.');
  }

  for (const leaveType of body.data) {
    if (!isRecord(leaveType) || typeof leaveType.name !== 'string') {
      throw new Error('Each returned leave type must have a string `name`.');
    }
    expect(leaveType.name.toLowerCase()).toContain('us');
  }
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

  const token: StoredToken = {
    access_token: tokenJson.access_token,
    expires_at: tokenJson.expires_at,
  };
  if (Date.now() >= token.expires_at - TOKEN_EXPIRY_BUFFER_MS) {
    throw new Error(
      'OrangeHRM access token is expired or near expiry. Run `npm run orangehrm:oauth` to authenticate again.',
    );
  }

  return token.access_token;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

import { randomBytes, timingSafeEqual } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import {
  buildAuthorizationUrl,
  exchangeAuthorizationCode,
} from '../../utils/orangehrm-oauth';
import {
  generateCodeChallenge,
  generateCodeVerifier,
} from '../../utils/pkce';

test.use({
  trace: 'off',
  screenshot: 'off',
  video: 'off',
});

test('builds the OrangeHRM authorization URL with PKCE and state', () => {
  const url = buildAuthorizationUrl(
    'https://orangehrm.example/',
    'test-client-id',
    'http://localhost:3000/callback',
    'test-challenge',
    'test-state',
  );

  expect(url.pathname).toBe('/web/index.php/oauth2/authorize');
  expect(url.searchParams.get('response_type')).toBe('code');
  expect(url.searchParams.get('client_id')).toBe('test-client-id');
  expect(url.searchParams.get('redirect_uri')).toBe(
    'http://localhost:3000/callback',
  );
  expect(url.searchParams.get('code_challenge')).toBe('test-challenge');
  expect(url.searchParams.get('code_challenge_method')).toBe('S256');
  expect(url.searchParams.get('state')).toBe('test-state');
});

test('completes OrangeHRM OAuth authorization with PKCE', async ({ page }) => {
  test.skip(
    process.env.ORANGEHRM_OAUTH_INTERACTIVE !== '1',
    'Run this manual browser flow with npm run orangehrm:oauth.',
  );
  test.setTimeout(7 * 60 * 1000);

  const baseUrl = requiredEnv('BASE_URL');
  const clientId = requiredEnv('ORANGEHRM_CLIENT_ID');
  const clientSecret = requiredEnv('ORANGEHRM_CLIENT_SECRET');
  const redirectUri = requiredEnv('ORANGEHRM_REDIRECT_URI');
  const callback = validateCallbackUri(redirectUri);
  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  const state = randomBytes(32).toString('base64url');
  const authorizationUrl = buildAuthorizationUrl(
    baseUrl,
    clientId,
    redirectUri,
    challenge,
    state,
  );
  const callbackListener = await listenForCallback(callback, state);
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    console.log('Opening OrangeHRM authorization in the browser.');
    console.log(
      `Sign in and approve access. Waiting for the callback at ${redirectUri}.`,
    );
    await page.goto(authorizationUrl.toString(), {
      waitUntil: 'domcontentloaded',
    });

    const code = await Promise.race([
      callbackListener.code,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error('Timed out waiting for the OAuth callback.')),
          5 * 60 * 1000,
        );
      }),
    ]);

    console.log('Authorization received; exchanging the code for tokens.');
    const tokens = await exchangeAuthorizationCode(
      baseUrl,
      clientId,
      clientSecret,
      redirectUri,
      code,
      verifier,
    );

    expect(tokens.access_token.length).toBeGreaterThan(0);
    expect(tokens.token_type.toLowerCase()).toBe('bearer');

    const tokenPath = resolve(
      process.cwd(),
      'playwright',
      '.auth',
      'orangehrm-token.json',
    );
    await mkdir(dirname(tokenPath), { recursive: true });
    await writeFile(
      tokenPath,
      JSON.stringify(
        {
          ...tokens,
          expires_at: Date.now() + tokens.expires_in * 1000,
        },
        null,
        2,
      ),
      { encoding: 'utf8' },
    );
    console.log(
      `OAuth completed. Token response saved to ${relative(process.cwd(), tokenPath)}.`,
    );
    console.log('Token values were not printed.');
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
    await closeServer(callbackListener.server);
  }
});

interface CallbackUri {
  hostname: string;
  pathname: string;
  port: number;
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function validateCallbackUri(value: string): CallbackUri {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('ORANGEHRM_REDIRECT_URI must be a valid URL.');
  }

  if (
    url.protocol !== 'http:' ||
    !['localhost', '127.0.0.1'].includes(url.hostname) ||
    !url.port ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      'ORANGEHRM_REDIRECT_URI must be an HTTP localhost URL with an explicit port and no query or fragment.',
    );
  }

  return {
    hostname: url.hostname,
    pathname: url.pathname,
    port: Number(url.port),
  };
}

function listenForCallback(
  callback: CallbackUri,
  expectedState: string,
): Promise<{ server: Server; code: Promise<string> }> {
  let resolveCode: (code: string) => void = () => undefined;
  let rejectCode: (error: Error) => void = () => undefined;
  const code = new Promise<string>((resolve, reject) => {
    resolveCode = resolve;
    rejectCode = reject;
  });

  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url ?? '/', 'http://localhost');
    if (request.method !== 'GET' || requestUrl.pathname !== callback.pathname) {
      response.writeHead(404).end();
      return;
    }

    const receivedState = requestUrl.searchParams.get('state') ?? '';
    if (!statesMatch(expectedState, receivedState)) {
      response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('OAuth state validation failed. You may close this window.');
      rejectCode(new Error('OAuth callback state did not match.'));
      return;
    }

    const authorizationError = requestUrl.searchParams.get('error');
    if (authorizationError) {
      response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('OrangeHRM authorization was not completed. You may close this window.');
      rejectCode(
        new Error(`OrangeHRM authorization failed: ${authorizationError}`),
      );
      return;
    }

    const authorizationCode = requestUrl.searchParams.get('code');
    if (!authorizationCode) {
      response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('No authorization code was returned. You may close this window.');
      rejectCode(new Error('OAuth callback did not contain an authorization code.'));
      return;
    }

    response.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Authorization received. You may close this window.');
    resolveCode(authorizationCode);
  });

  return new Promise((resolve, reject) => {
    server.once('error', (error) => {
      reject(
        new Error(
          `Could not listen on the OAuth callback port ${callback.port}. Ensure it is free and matches the registered redirect URI. ${
            error instanceof Error ? error.message : ''
          }`,
        ),
      );
    });
    server.listen(callback.port, callback.hostname, () => {
      resolve({ server, code });
    });
  });
}

function statesMatch(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

function closeServer(server: Server): Promise<void> {
  if (!server.listening) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(new Error(`Could not stop the OAuth callback server: ${error.message}`));
        return;
      }
      resolve();
    });
  });
}

export interface AuthorizationCodeExchange {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

export function buildAuthorizationUrl(
  baseUrl: string,
  clientId: string,
  redirectUri: string,
  codeChallenge: string,
  state: string,
): URL {
  const url = getOAuthEndpoint(baseUrl, '/web/index.php/oauth2/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('code_challenge', codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('state', state);
  return url;
}

export async function exchangeAuthorizationCode(
  baseUrl: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  code: string,
  codeVerifier: string,
): Promise<AuthorizationCodeExchange> {
  const tokenUrl = getOAuthEndpoint(baseUrl, '/web/index.php/oauth2/token');
  const form = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
    code_verifier: codeVerifier,
  });

  let response: Response;
  try {
    response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown network error';
    throw new Error(`Unable to reach the OrangeHRM token endpoint: ${detail}`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(
      `OrangeHRM token endpoint returned a non-JSON response (HTTP ${response.status}).`,
    );
  }

  if (!response.ok) {
    const message = isRecord(payload) && typeof payload.error_description === 'string'
      ? payload.error_description
      : isRecord(payload) && typeof payload.error === 'string'
        ? payload.error
        : 'Token exchange was rejected';
    throw new Error(`OrangeHRM token exchange failed (HTTP ${response.status}): ${message}`);
  }

  if (
    !isRecord(payload) ||
    typeof payload.access_token !== 'string' ||
    typeof payload.token_type !== 'string' ||
    typeof payload.expires_in !== 'number'
  ) {
    throw new Error('OrangeHRM returned an invalid token response.');
  }

  return {
    access_token: payload.access_token,
    token_type: payload.token_type,
    expires_in: payload.expires_in,
    ...(typeof payload.refresh_token === 'string' && {
      refresh_token: payload.refresh_token,
    }),
    ...(typeof payload.scope === 'string' && { scope: payload.scope }),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getOAuthEndpoint(baseUrl: string, endpointPath: string): URL {
  const base = new URL(baseUrl);
  const isLoopbackHttp =
    base.protocol === 'http:' &&
    (base.hostname === 'localhost' || base.hostname === '127.0.0.1');
  if (
    (base.protocol !== 'https:' && !isLoopbackHttp) ||
    base.username ||
    base.password
  ) {
    throw new Error('OrangeHRM OAuth requires an HTTPS base URL.');
  }
  return new URL(endpointPath, base.origin);
}

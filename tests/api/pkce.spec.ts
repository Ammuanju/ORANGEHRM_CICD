
import { test, expect } from '@playwright/test';
import {
  generateCodeVerifier,
  generateCodeChallenge
} from '../../utils/pkce';

test('API_002 - Verify PKCE Code Verifier and Challenge', async () => {

  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);

  console.log('Verifier generated:', !!verifier);
  console.log('Challenge generated:', !!challenge);

  expect(verifier).toBeTruthy();
  expect(challenge).toBeTruthy();
  expect(verifier.length).toBeGreaterThanOrEqual(43);
  expect(challenge.length).toBe(43);

});

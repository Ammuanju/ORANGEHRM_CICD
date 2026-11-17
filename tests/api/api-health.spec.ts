
import { test, expect } from '@playwright/test';

test.describe('OrangeHRM API Testing', () => {

  test('API_001 - Verify OrangeHRM website response', async ({ request }) => {

    const response = await request.get('https://opensource-demo.orangehrmlive.com/');

    console.log('Status Code:', response.status());

    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

  });

});

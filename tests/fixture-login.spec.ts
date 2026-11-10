import { test, expect } from '../fixtures/test';

test('Verify login page using custom fixture', async ({ loginPage }) => {
  await loginPage.navigate();

  await expect(loginPage.loginHeading).toBeVisible();
});

test('Verify valid login using custom fixture', async ({ loginPage, page }) => {
  await loginPage.navigate();

 const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

if (!username || !password) {
  throw new Error('Admin credentials are missing in .env');
}

await loginPage.login(username, password);

  await expect(page).toHaveURL(/dashboard/);
});
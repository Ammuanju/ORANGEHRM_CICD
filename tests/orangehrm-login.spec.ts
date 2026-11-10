import { loginData } from '../test-data/loginData';
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('Verify OrangeHRM login page', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.navigate();

  await expect(loginPage.loginHeading).toBeVisible();
});

test('ADM_LOGIN_001 - Login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.navigate();
 await loginPage.login(
  loginData.validUser.username,
  loginData.validUser.password
);

  await expect(page).toHaveURL(/dashboard/);
  await expect(
    page.getByRole('heading', { name: 'Dashboard' })
  ).toBeVisible();
});

test('ADM_LOGIN_002 - Login with invalid password', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.navigate();
 await loginPage.login(
  loginData.invalidPassword.username,
  loginData.invalidPassword.password
);

  await expect(loginPage.errorMessage).toBeVisible();
});

test('ADM_LOGIN_003 - Login with invalid username', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.navigate();
  await loginPage.login(
  loginData.invalidUsername.username,
  loginData.invalidUsername.password
);

  await expect(loginPage.errorMessage).toBeVisible();
});

test('ADM_LOGIN_004 - Login with empty username and password', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.navigate();
  await loginPage.loginButton.click();

  await expect(page.getByText('Required').first()).toBeVisible();
  await expect(page.getByText('Required').last()).toBeVisible();
});

test('ADM_LOGIN_005 - Verify user can logout', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.navigate();
   await loginPage.login(
  loginData.validUser.username,
  loginData.validUser.password
);
  await expect(page).toHaveURL(/dashboard/);

  await page.locator('.oxd-userdropdown-tab').click();
  await page.getByText('Logout', { exact: true }).click();

  await expect(page).toHaveURL(/auth\/login/);
  await expect(loginPage.loginHeading).toBeVisible();
});




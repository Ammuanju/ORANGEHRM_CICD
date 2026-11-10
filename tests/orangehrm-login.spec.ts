

import { test, expect } from '@playwright/test';

test('Verify OrangeHRM login page', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');

  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
});

test('ADM_LOGIN_001 - Login with valid credentials', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');

  await page.getByPlaceholder('Username').fill('Admin');
  await page.getByPlaceholder('Password').fill('admin123');

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).toHaveURL(/dashboard/);
  await expect(
    page.getByRole('heading', { name: 'Dashboard' })
  ).toBeVisible();
});


test('ADM_LOGIN_002 - Login with invalid password', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');

  await page.getByPlaceholder('Username').fill('Admin');
  await page.getByPlaceholder('Password').fill('wrongpassword');

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText('Invalid credentials')).toBeVisible();
});

test('ADM_LOGIN_003 - Login with invalid username', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');

  await page.getByPlaceholder('Username').fill('WrongUser');
  await page.getByPlaceholder('Password').fill('admin123');

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText('Invalid credentials')).toBeVisible();
});


test('ADM_LOGIN_004 - Login with empty username and password', async ({ page }) => {
  await page.goto('https://opensource-demo.orangehrmlive.com/');

  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByText('Required').first()).toBeVisible();
  await expect(page.getByText('Required').last()).toBeVisible();
});


test('ADM_LOGIN_005 - Verify user can logout', async ({ page }) => {
  // Open login page
  await page.goto('https://opensource-demo.orangehrmlive.com/');

  // Login
  await page.getByPlaceholder('Username').fill('Admin');
  await page.getByPlaceholder('Password').fill('admin123');
  await page.getByRole('button', { name: 'Login' }).click();

  // Verify dashboard
  await expect(page).toHaveURL(/dashboard/);

  // Open user profile menu
  await page.locator('.oxd-userdropdown-tab').click();

  // Click logout
  await page.getByText('Logout', { exact: true }).click();

  // Verify logout
  await expect(page).toHaveURL(/auth\/login/);
  await expect(
    page.getByRole('heading', { name: 'Login' })
  ).toBeVisible();
});




import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { loginData } from '../test-data/loginData';

const loginScenarios = [
  {
    scenario: 'Valid login',
    username: loginData.validUser.username,
    password: loginData.validUser.password,
    expectedResult: 'success',
  },
  {
    scenario: 'Invalid password',
    username: loginData.invalidPassword.username,
    password: loginData.invalidPassword.password,
    expectedResult: 'failure',
  },
  {
    scenario: 'Invalid username',
    username: loginData.invalidUsername.username,
    password: loginData.invalidUsername.password,
    expectedResult: 'failure',
  },
];

for (const data of loginScenarios) {
  test(`Data-driven test - ${data.scenario}`, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login(data.username, data.password);

    if (data.expectedResult === 'success') {
      await expect(page).toHaveURL(/dashboard/);
    } else {
      await expect(loginPage.errorMessage).toBeVisible();
    }
  });
}
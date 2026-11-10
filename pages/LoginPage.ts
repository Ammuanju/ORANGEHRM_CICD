
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly loginHeading: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;

    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.loginHeading = page.getByRole('heading', { name: 'Login' });
    this.errorMessage = page.getByText('Invalid credentials');
  }

  async navigate() {
  const baseUrl = process.env.BASE_URL;

  if (!baseUrl) {
    throw new Error('BASE_URL is not configured in .env');
  }

  await this.page.goto(baseUrl);
}

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async logout() {
  await this.page.locator('.oxd-userdropdown-tab').click();
  await this.page.getByText('Logout', { exact: true }).click();
}

async verifyLogout() {
  await this.page.waitForURL(/auth\/login/);
}
}

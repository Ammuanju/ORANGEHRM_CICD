
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('OrangeHRM Assign Leave Tests', () => {

  test('AL-UI-001 - Verify Assign Leave page UI', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.login(
      process.env.ADMIN_USERNAME!,
      process.env.ADMIN_PASSWORD!
    );

    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.openAssignLeave();

    await expect(dashboardPage.assignLeaveHeading).toBeVisible();

    await expect(page.getByRole('textbox', { name: 'Type for hints...' })).toBeVisible();
    await expect(page.locator('.oxd-select-text-input').nth(0)).toBeVisible();

    const dateFields = page.getByRole('textbox', { name: 'yyyy-dd-mm' });
    await expect(dateFields.nth(0)).toBeVisible();
    await expect(dateFields.nth(1)).toBeVisible();

    await expect(page.locator('form textarea')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Assign', exact: true })).toBeVisible();

    for (const fieldName of ['Employee Name', 'Leave Type', 'From Date', 'To Date']) {
      const requiredLabel = page
        .locator('label.oxd-input-field-required')
        .filter({ hasText: fieldName });

      await expect(requiredLabel).toBeVisible();
    }

  });

  test('AL-EMP-002 - Verify unmatched Employee Name search', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.login(
      process.env.ADMIN_USERNAME!,
      process.env.ADMIN_PASSWORD!
    );

    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.openAssignLeave();

    const employeeName = page.getByRole('textbox', { name: 'Type for hints...' });
    await employeeName.fill('zz_no_match_94721');

    const employeeSuggestions = page.getByRole('listbox');
    await expect(employeeSuggestions).toBeVisible();
    await expect(
      employeeSuggestions.getByRole('option', { name: 'No Records Found', exact: true })
    ).toBeVisible();
  });

  test('AL-TYPE-001 - Verify Leave Type dropdown options', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.login(
      process.env.ADMIN_USERNAME!,
      process.env.ADMIN_PASSWORD!
    );

    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.openAssignLeave();

    const leaveTypeDropdown = page.locator('.oxd-select-text-input').nth(0);
    await leaveTypeDropdown.click();

    const leaveTypeOptions = [
      'CAN - Bereavement',
      'CAN - FMLA',
      'CAN - Matternity',
      'CAN - Personal',
      'CAN - Vacation',
      'US - Bereavement',
      'US - FMLA',
      'US - Matternity',
      'US - Personal',
      'US - Vacation',
    ];

    for (const optionName of leaveTypeOptions) {
      await expect(
        page.getByRole('option', { name: optionName, exact: true })
      ).toBeVisible();
    }

    await page.getByRole('option', { name: 'CAN - Vacation', exact: true }).click();
    await expect(leaveTypeDropdown).toHaveText('CAN - Vacation');
  });

  test('AL-DATE-001 - Verify Calendar Date Selection', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.login(
      process.env.ADMIN_USERNAME!,
      process.env.ADMIN_PASSWORD!
    );

    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.openAssignLeave();

    const dateFields = page.getByRole('textbox', { name: 'yyyy-dd-mm' });
    await dateFields.nth(0).click();

    const today = page.getByText('Today', { exact: true });
    await expect(today).toBeVisible();
    await today.click();

    const currentDate = await page.evaluate(() => {
      const date = new Date();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${date.getFullYear()}-${day}-${month}`;
    });

    await expect(dateFields.nth(0)).toHaveValue(currentDate);
    await expect(dateFields.nth(1)).toHaveValue(currentDate);
    await expect(page.locator('.oxd-select-text-input').nth(1)).toBeVisible();
  });

  test('AL-DUR-001 - Verify Duration dropdown options', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.login(
      process.env.ADMIN_USERNAME!,
      process.env.ADMIN_PASSWORD!
    );

    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.openAssignLeave();

    const fromDate = page.getByRole('textbox', { name: 'yyyy-dd-mm' }).nth(0);
    await fromDate.click();

    const today = page.getByText('Today', { exact: true });
    await expect(today).toBeVisible();
    await today.click();

    const durationDropdown = page.locator('.oxd-select-text-input').nth(1);
    await durationDropdown.click();

    const durationOptions = [
      'Full Day',
      'Half Day - Morning',
      'Half Day - Afternoon',
      'Specify Time',
    ];

    for (const optionName of durationOptions) {
      await expect(
        page.getByRole('option', { name: optionName, exact: true })
      ).toBeVisible();
    }

    await page.getByRole('option', { name: 'Full Day', exact: true }).click();
    await expect(durationDropdown).toHaveText('Full Day');
  });

  test('AL-DUR-002 - Verify Specify Time duration fields', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.login(
      process.env.ADMIN_USERNAME!,
      process.env.ADMIN_PASSWORD!
    );

    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.openAssignLeave();

    const fromDate = page.getByRole('textbox', { name: 'yyyy-dd-mm' }).nth(0);
    await fromDate.click();

    const today = page.getByText('Today', { exact: true });
    await expect(today).toBeVisible();
    await today.click();

    const durationDropdown = page.locator('.oxd-select-text-input').nth(1);
    await durationDropdown.click();
    await page.getByRole('option', { name: 'Specify Time', exact: true }).click();

    const timeFields = page.getByRole('textbox', { name: 'hh:mm' });
    await expect(timeFields).toHaveCount(2);
    await expect(timeFields.nth(0)).toBeVisible();
    await expect(timeFields.nth(1)).toBeVisible();
    await expect(timeFields.nth(0)).toHaveValue('09:00 AM');
    await expect(timeFields.nth(1)).toHaveValue('05:00 PM');
    await expect(timeFields.nth(0)).toHaveValue(/^(0[1-9]|1[0-2]):[0-5]\d (AM|PM)$/);
    await expect(timeFields.nth(1)).toHaveValue(/^(0[1-9]|1[0-2]):[0-5]\d (AM|PM)$/);
  });

  test('AL-COM-001 - Verify Comments field', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.login(
      process.env.ADMIN_USERNAME!,
      process.env.ADMIN_PASSWORD!
    );

    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.openAssignLeave();

    const comments = page.locator('form textarea');
    await expect(comments).toBeVisible();

    const commentText = 'Test comment - UI verification';
    await comments.fill(commentText);

    await expect(comments).toHaveValue(commentText);
  });

  test('AL-UI-002 - Verify Assign Leave page remains functional after refresh', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.login(
      process.env.ADMIN_USERNAME!,
      process.env.ADMIN_PASSWORD!
    );

    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.openAssignLeave();

    await expect(dashboardPage.assignLeaveHeading).toBeVisible();

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    await expect(dashboardPage.assignLeaveHeading).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('textbox', { name: 'Type for hints...' })).toBeVisible();
    await expect(page.locator('.oxd-select-text-input').nth(0)).toBeVisible();

    const dateFields = page.getByRole('textbox', { name: 'yyyy-dd-mm' });
    await expect(dateFields.nth(0)).toBeVisible();
    await expect(dateFields.nth(1)).toBeVisible();
  });

  test('AL-UI-003 - Verify browser Back navigation from Assign Leave page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.login(
      process.env.ADMIN_USERNAME!,
      process.env.ADMIN_PASSWORD!
    );

    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.openAssignLeave();

    await expect(dashboardPage.assignLeaveHeading).toBeVisible();

    await page.goBack();

    await expect(dashboardPage.dashboardHeading).toBeVisible();
  });

  test('AL-EMP-003 - Verify Employee Name autocomplete selection', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.login(
      process.env.ADMIN_USERNAME!,
      process.env.ADMIN_PASSWORD!
    );

    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.openAssignLeave();

    const employeeName = page.getByRole('textbox', { name: 'Type for hints...' });
    await employeeName.fill('a');

    const suggestionsList = page.getByRole('listbox');
    await expect(suggestionsList).toBeVisible();
    await expect.poll(async () => (await suggestionsList.innerText()).trim())
      .not.toMatch(/^Searching\.{3,}$/);

    const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim();
    const optionNames = (await suggestionsList.getByRole('option').allInnerTexts())
      .map(normalizeWhitespace);
    expect(
      optionNames.filter(name => name && name !== 'No Records Found').length,
      `No employee suggestions were available. Actual options: ${JSON.stringify(optionNames)}`
    ).toBeGreaterThan(0);

    const selectedEmployee = optionNames.find(name => name && name !== 'No Records Found')!;
    const matchingSuggestion = suggestionsList.getByRole('option', {
      name: selectedEmployee,
      exact: true
    });
    await matchingSuggestion.click();

    await expect.poll(async () =>
      normalizeWhitespace(await employeeName.inputValue())
    ).toBe(selectedEmployee);
  });

});

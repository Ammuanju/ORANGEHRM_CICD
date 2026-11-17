
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('OrangeHRM Dashboard Tests', () => {

  test('DASH_001 - Verify Dashboard and Quick Launch shortcuts', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();

    await loginPage.login(
      process.env.ADMIN_USERNAME!,
      process.env.ADMIN_PASSWORD!
    );

    await dashboardPage.verifyDashboardLoaded();

    await expect(dashboardPage.timeAtWork).toBeVisible();
    await expect(dashboardPage.myActions).toBeVisible();
    await expect(dashboardPage.buzzLatestPosts).toBeVisible();
    await expect(dashboardPage.employeesOnLeave).toBeVisible();
    await expect(dashboardPage.distributionBySubUnit).toBeVisible();
    await expect(dashboardPage.distributionByLocation).toBeVisible();

    await expect(dashboardPage.assignLeave).toBeVisible();
    await expect(dashboardPage.leaveList).toBeVisible();
    await expect(dashboardPage.timesheets).toBeVisible();
    await expect(dashboardPage.applyLeave).toBeVisible();
    await expect(dashboardPage.myLeave).toBeVisible();
    await expect(dashboardPage.myTimesheets).toBeVisible();

  });


  test('DASH_002 - Verify Assign Leave navigation', async ({ page }) => {

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();

    await loginPage.login(
      process.env.ADMIN_USERNAME!,
      process.env.ADMIN_PASSWORD!
    );

    await dashboardPage.verifyDashboardLoaded();

    await dashboardPage.openAssignLeave();

    await expect(page).toHaveURL(/\/web\/index\.php\/leave\/assignLeave$/);
    await expect(dashboardPage.assignLeaveHeading).toBeVisible();

  });

  test('DASH_003 - Verify Leave List navigation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.login(
      process.env.ADMIN_USERNAME!,
      process.env.ADMIN_PASSWORD!
    );
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.openLeaveList();

    await expect(page).toHaveURL(/\/web\/index\.php\/leave\/viewLeaveList$/);
    await expect(dashboardPage.leaveListHeading).toBeVisible();
  });

  test('DASH_004 - Verify Timesheets navigation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.login(
      process.env.ADMIN_USERNAME!,
      process.env.ADMIN_PASSWORD!
    );
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.openTimesheets();

    await expect(page).toHaveURL(/\/web\/index\.php\/time\/viewEmployeeTimesheet$/);
    await expect(dashboardPage.timesheetsHeading).toBeVisible();
  });

  test('DASH_005 - Verify Apply Leave navigation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.login(
      process.env.ADMIN_USERNAME!,
      process.env.ADMIN_PASSWORD!
    );
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.openApplyLeave();

    await expect(page).toHaveURL(/\/web\/index\.php\/leave\/applyLeave$/);
    await expect(dashboardPage.applyLeaveHeading).toBeVisible();
  });

  test('DASH_006 - Verify My Leave navigation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.login(
      process.env.ADMIN_USERNAME!,
      process.env.ADMIN_PASSWORD!
    );
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.openMyLeave();

    await expect(page).toHaveURL(/\/web\/index\.php\/leave\/viewMyLeaveList$/);
    await expect(dashboardPage.myLeaveHeading).toBeVisible();
  });

  test('DASH_007 - Verify My Timesheet navigation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.navigate();
    await loginPage.login(
      process.env.ADMIN_USERNAME!,
      process.env.ADMIN_PASSWORD!
    );
    await dashboardPage.verifyDashboardLoaded();
    await dashboardPage.openMyTimesheet();

    await expect(page).toHaveURL(/\/web\/index\.php\/time\/viewMyTimesheet$/);
    await expect(dashboardPage.myTimesheetHeading).toBeVisible();
  });

});

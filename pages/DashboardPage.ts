
import { Page, Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly dashboardHeading: Locator;
  readonly assignLeaveHeading: Locator;
  readonly leaveListHeading: Locator;
  readonly timesheetsHeading: Locator;
  readonly applyLeaveHeading: Locator;
  readonly myLeaveHeading: Locator;
  readonly myTimesheetHeading: Locator;

  // Quick Launch shortcuts
  readonly assignLeave: Locator;
  readonly leaveList: Locator;
  readonly timesheets: Locator;
  readonly applyLeave: Locator;
  readonly myLeave: Locator;
  readonly myTimesheets: Locator;
  readonly timeAtWork: Locator;
  readonly myActions: Locator;
  readonly buzzLatestPosts: Locator;
  readonly employeesOnLeave: Locator;
  readonly distributionBySubUnit: Locator;
  readonly distributionByLocation: Locator;

  constructor(page: Page) {
    this.page = page;

        // Dashboard widgets
    this.timeAtWork = page.getByText('Time at Work');
    this.myActions = page.getByText('My Actions');
    this.buzzLatestPosts = page.getByText('Buzz Latest Posts');
    this.employeesOnLeave = page.getByText('Employees on Leave Today');
    this.distributionBySubUnit = page.getByText('Employee Distribution by Sub Unit');
    this.distributionByLocation = page.getByText('Employee Distribution by Location');

    this.dashboardHeading = page.getByRole('heading', {
      name: 'Dashboard'
    });

    this.assignLeave = page.getByRole('button', { name: 'Assign Leave' });
    this.assignLeaveHeading = page.getByRole('heading', { name: 'Assign Leave' });
    this.leaveList = page.getByRole('button', { name: 'Leave List' });
    this.leaveListHeading = page.getByRole('heading', { name: 'Leave List' });
    this.timesheets = page.getByRole('button', { name: 'Timesheets' });
    this.timesheetsHeading = page.getByRole('heading', { name: 'Timesheets Pending Action' });
    this.applyLeave = page.getByRole('button', { name: 'Apply Leave' });
    this.applyLeaveHeading = page.getByRole('heading', { name: 'Apply Leave' });
    this.myLeave = page.getByRole('button', { name: 'My Leave' });
    this.myLeaveHeading = page.getByRole('heading', { name: 'My Leave List' });
    this.myTimesheets = page.getByRole('button', { name: 'My Timesheet' });
    this.myTimesheetHeading = page.getByRole('heading', { name: 'My Timesheet' });
  }

  async verifyDashboardLoaded() {
    await this.dashboardHeading.waitFor();
  }

  async openAssignLeave() {
    await this.assignLeave.click();
    await this.page.waitForURL(/\/leave\/assignLeave$/, { timeout: 15000 });
    await Promise.all([
      expect(this.assignLeaveHeading).toBeVisible({ timeout: 15000 }),
      expect(this.page.getByRole('textbox', { name: 'Type for hints...' }))
        .toBeVisible({ timeout: 15000 })
    ]);
  }

  async openLeaveList() {
    await this.leaveList.click();
    await this.page.waitForURL(/\/leave\/viewLeaveList$/);
  }

  async openTimesheets() {
    await this.timesheets.click();
    await this.page.waitForURL(/\/time\/viewEmployeeTimesheet$/);
  }

  async openApplyLeave() {
    await this.applyLeave.click();
    await this.page.waitForURL(/\/leave\/applyLeave$/);
  }

  async openMyLeave() {
    await this.myLeave.click();
    await this.page.waitForURL(/\/leave\/viewMyLeaveList$/);
  }

  async openMyTimesheet() {
    await this.myTimesheets.click();
    await this.page.waitForURL(/\/time\/viewMyTimesheet$/);
  }
}

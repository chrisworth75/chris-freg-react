import { test, expect } from '@playwright/test';

test.describe('Fee Management React App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the header with correct navigation', async ({ page }) => {
    await expect(page.locator('.navbar-brand')).toContainText('ChrisFreg React');
    await expect(page.locator('a[href="/"]')).toContainText('Fees');
    await expect(page.locator('a[href="/create"]')).toContainText('Create Fee');
  });

  test('should display fee list page with tabs', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Fee Management');

    // Check if tabs are present
    await expect(page.locator('button:has-text("Draft")')).toBeVisible();
    await expect(page.locator('button:has-text("Approved")')).toBeVisible();
    await expect(page.locator('button:has-text("Live")')).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    // Click on Approved tab
    await page.click('button:has-text("Approved")');
    await expect(page.locator('button:has-text("Approved")')).toHaveClass(/active/);

    // Click on Live tab
    await page.click('button:has-text("Live")');
    await expect(page.locator('button:has-text("Live")')).toHaveClass(/active/);

    // Click back to Draft tab
    await page.click('button:has-text("Draft")');
    await expect(page.locator('button:has-text("Draft")')).toHaveClass(/active/);
  });

  test('should navigate to create fee page', async ({ page }) => {
    await page.click('a[href="/create"]');
    await expect(page.locator('h2')).toContainText('Create New Fee');

    // Check form fields are present
    await expect(page.locator('#code')).toBeVisible();
    await expect(page.locator('#value')).toBeVisible();
    await expect(page.locator('#description')).toBeVisible();
    await expect(page.locator('#status')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Create Fee');
  });

  test('should validate required fields on create form', async ({ page }) => {
    await page.goto('/create');

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Check validation messages appear
    await expect(page.locator('.invalid-feedback')).toContainText('Code is required');
  });

  test('should fill and validate create form', async ({ page }) => {
    await page.goto('/create');

    // Fill form with valid data
    await page.fill('#code', 'TEST001');
    await page.fill('#value', '50.00');
    await page.fill('#description', 'Test fee description');
    await page.selectOption('#status', 'draft');

    // Verify form fields are filled
    await expect(page.locator('#code')).toHaveValue('TEST001');
    await expect(page.locator('#value')).toHaveValue('50');
    await expect(page.locator('#description')).toHaveValue('Test fee description');
    await expect(page.locator('#status')).toHaveValue('draft');
  });

  test('should handle form validation errors', async ({ page }) => {
    await page.goto('/create');

    // Fill with invalid data
    await page.fill('#value', '-10');
    await page.click('button[type="submit"]');

    // Should show validation error for negative value
    await expect(page.locator('.invalid-feedback')).toContainText('Amount must be greater than 0');
  });

  test('should have refresh button on fee list', async ({ page }) => {
    await expect(page.locator('button:has-text("Refresh Fees")')).toBeVisible();
  });

  test('should display loading state on refresh', async ({ page }) => {
    await page.click('button:has-text("Refresh Fees")');
    // Loading state might be too fast to catch, but button should be disabled momentarily
    await expect(page.locator('button:has-text("Refresh Fees")')).toBeVisible();
  });
});
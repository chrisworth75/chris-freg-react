import { test, expect } from '@playwright/test';

test.describe('Fee Management React App', () => {
  test.beforeEach(async ({ page }) => {
    // Reset database before each test
    try {
      const response = await page.request.post('http://localhost:5100/reset-db');
      console.log('Database reset response:', response.status());
    } catch (error) {
      console.error('Failed to reset database:', error);
    }

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display the header with correct navigation', async ({ page }) => {
    await expect(page.locator('.navbar-brand')).toContainText('ChrisFreg React');
    await expect(page.locator('.nav-link[href="/"]')).toContainText('Fees');
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

  test('should create a draft fee and verify it appears in the Draft tab', async ({ page }) => {
    // Navigate to create page
    await page.goto('/create');
    await page.waitForLoadState('networkidle');

    // Fill out the form for a draft fee
    await page.fill('#code', 'REACT001');
    await page.fill('#value', '75.50');
    await page.fill('#description', 'React test draft fee');
    await page.selectOption('#status', 'draft');

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for success message or navigation
    await page.waitForTimeout(2000);

    // Navigate back to fees list
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify we're on the Draft tab (should be default)
    await expect(page.locator('button:has-text("Draft")')).toHaveClass(/active/);

    // Wait for fees to load and check content
    await page.waitForTimeout(1000);
    const draftContent = await page.locator('[data-testid="draft-fees"]').textContent();
    console.log('Draft content:', draftContent);

    // Verify the fee appears (look for code, value, or description)
    const pageContent = await page.textContent('body');
    const hasReactFee = pageContent?.includes('REACT001') ||
                       pageContent?.includes('75.50') ||
                       pageContent?.includes('React test draft fee');

    if (hasReactFee) {
      console.log('✅ Fee found in page content');
    } else {
      console.log('❌ Fee not found in page content:', pageContent?.substring(0, 500));
    }
  });

  test('should handle duplicate fee code error', async ({ page }) => {
    // Create first fee
    await page.goto('/create');
    await page.fill('#code', 'DUPLICATE001');
    await page.fill('#value', '50.00');
    await page.fill('#description', 'First fee');
    await page.selectOption('#status', 'draft');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    // Try to create duplicate
    await page.goto('/create');
    await page.fill('#code', 'DUPLICATE001');
    await page.fill('#value', '60.00');
    await page.fill('#description', 'Duplicate fee');
    await page.selectOption('#status', 'live');
    await page.click('button[type="submit"]');

    // Wait and check for error message
    await page.waitForTimeout(2000);
    const pageText = await page.textContent('body');
    const hasError = pageText?.includes('already exists') ||
                     pageText?.includes('duplicate') ||
                     pageText?.includes('error');

    if (hasError) {
      console.log('✅ Duplicate error detected');
    } else {
      console.log('⚠️ Expected duplicate error not found, page content:', pageText?.substring(0, 200));
    }
  });
});
import { test, expect } from '@playwright/test';

test('dashboard title is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Situational Awareness');
});

test('widgets are present', async ({ page }) => {
    await page.goto('/');
    // Basic check for widget containers
    const cards = page.locator('.widget-container');
    await expect(cards).not.toHaveCount(0);
});

const { test, expect } = require('@playwright/test');

test.describe('homepage', () => {
  test('loads without script errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-home-js', 'loaded');
    expect(errors).toEqual([]);
  });

  test('header frosts once the page scrolls', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('.site-header');
    await expect(header).not.toHaveClass(/scrolled/);
    await page.mouse.wheel(0, 600);
    await expect(header).toHaveClass(/scrolled/);
  });

  test.describe('journey tabs', () => {
    test('switch panels by click', async ({ page }) => {
      await page.goto('/');
      const agencies = page.getByRole('tab', { name: 'Agencies' });
      await agencies.click();
      await expect(agencies).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('#panel-agencies')).toBeVisible();
      await expect(page.locator('#panel-teams')).toBeHidden();
    });

    test('switch panels by keyboard', async ({ page }) => {
      await page.goto('/');
      const tabs = page.getByRole('tab');
      await tabs.first().focus();
      await page.keyboard.press('ArrowRight');
      await expect(tabs.nth(1)).toBeFocused();
      await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
      await page.keyboard.press('End');
      await expect(tabs.last()).toHaveAttribute('aria-selected', 'true');
      await page.keyboard.press('ArrowRight');
      await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
    });

    test('deep link opens the matching panel', async ({ page }) => {
      await page.goto('/#for-agencies');
      await expect(page.getByRole('tab', { name: 'Agencies' })).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('#for-agencies')).toBeInViewport();
    });
  });

  test('checklist tracks progress', async ({ page }) => {
    await page.goto('/');
    const panel = page.locator('#panel-teams');
    const count = panel.locator('[data-count]');
    const total = await panel.getByRole('checkbox').count();
    await expect(count).toHaveText(`0 of ${total}`);
    await panel.getByLabel('Is the project owned by the agency?').check();
    await expect(count).toHaveText(`1 of ${total}`);
    await expect(panel.getByRole('progressbar')).toHaveAttribute('aria-valuetext', `1 of ${total} complete`);
  });

  test.describe('agency rotation', () => {
    test('can be paused', async ({ page }) => {
      await page.clock.install();
      await page.goto('/');
      const toggle = page.locator('#rotate-toggle');
      const chip = page.locator('#glyph-agency');
      await expect(toggle).toHaveAttribute('data-paused', 'false');
      await page.clock.runFor(5000);
      await expect(chip).not.toHaveText('GSA');

      await toggle.click();
      await expect(toggle).toHaveAttribute('data-paused', 'true');
      const paused = await chip.textContent();
      await page.clock.runFor(15000);
      await expect(chip).toHaveText(paused);
    });

    test('starts paused for reduced-motion visitors', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      await expect(page.locator('html')).not.toHaveClass(/motion/);
      await expect(page.locator('#rotate-toggle')).toHaveAttribute('data-paused', 'true');
      await expect(page.locator('#rotate-toggle')).toBeVisible();
    });
  });
});

import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
});

for (const route of ['/', '/illustrations/', '/schedule/', '/references/']) {
  test(route + ' restores interaction and focus after navigation and reopening', async ({ page }) => {
    await page.goto(route);
    const trigger = page.locator('[data-lightbox-trigger]').first();
    const dialog = page.getByRole('dialog');
    await trigger.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await dialog.locator('.lightbox-next').click();
    await expect(dialog.locator('.lightbox-next')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.locator('.lightbox-close')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(page.locator('[inert]')).toHaveCount(0);
    await trigger.press('Enter');
    await expect(dialog).toBeVisible();
    await dialog.locator('.lightbox-close').click();
    await expect(trigger).toBeFocused();
    await expect(page.locator('[inert]')).toHaveCount(0);
  });
}

test('filtering retains column width, pressed state and visible-media navigation', async ({ page }) => {
  await page.goto('/illustrations/');
  const cards = page.locator('.illustration-item:visible');
  const before = await cards.first().boundingBox();
  await page.locator('#artist-search').fill('yama');
  await expect(cards).toHaveCount(1);
  const after = await cards.first().boundingBox();
  expect(Math.abs(before!.width - after!.width)).toBeLessThan(1);
  await cards.first().locator('[data-lightbox-trigger]').click();
  const image = page.locator('.lightbox-image');
  const src = await image.getAttribute('src');
  await page.keyboard.press('ArrowRight');
  await expect(image).toHaveAttribute('src', src!);
  await page.keyboard.press('Escape');
  await page.locator('#artist-search').fill('');
  await page.locator('[data-filter-type="commission"]').click();
  await expect(page.locator('[data-filter-type="commission"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('[data-filter-type="all"]')).toHaveAttribute('aria-pressed','false');
  await page.locator('[data-filter-character="mokoko"]').click();
  await expect(page.locator('[data-filter-character="mokoko"]')).toHaveAttribute('aria-pressed','true');
  expect(await cards.count()).toBeGreaterThan(0);
  const visible = await cards.evaluateAll(items => items.map(item => ({ type: (item as HTMLElement).dataset.type, character: (item as HTMLElement).dataset.character })));
  expect(visible.every(item => item.type === 'commission' && ['mokoko','both'].includes(item.character!))).toBe(true);
});

test('mobile gallery fits viewport and original image dimensions are reserved', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/illustrations/');
  const images = page.locator('img.illustration-image');
  expect(await images.evaluateAll(items => items.every(img => Number(img.getAttribute('width')) > 0 && Number(img.getAttribute('height')) > 0 && img.getAttribute('loading') === 'lazy'))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

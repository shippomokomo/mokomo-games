import { test, expect } from '@playwright/test';

for (const route of ['/', '/illustrations/', '/schedule/', '/references/']) {
  test(route + ' exposes named native buttons and supports Space activation', async ({ page }) => {
    await page.goto(route);
    const triggers = page.locator('[data-lightbox-trigger]');
    expect(await triggers.evaluateAll(elements => elements.every(element => element.tagName === 'BUTTON' && !!element.getAttribute('aria-label') && element.getAttribute('aria-haspopup') === 'dialog'))).toBe(true);
    const first = triggers.first();
    await first.focus();
    await page.keyboard.press('Space');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('header.site-header')).toHaveAttribute('inert', '');
    await page.keyboard.press('Shift+Tab');
    await expect(page.locator('.lightbox-next')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(first).toBeFocused();
    await expect(page.locator('header.site-header')).not.toHaveAttribute('inert', '');
  });
}

test('video preview stays deferred, media navigation follows DOM order, close releases video', async ({ page }) => {
  await page.goto('/illustrations/');
  const previews = page.locator('.illustration-video');
  expect(await previews.count()).toBeGreaterThan(0);
  // Offscreen previews do not load until the intersection observer reaches them.
  await expect(previews.last()).not.toHaveAttribute('src', /.+/);
  const cards = page.locator('.illustration-item');
  const mediaSources = await cards.locator('img, video').evaluateAll(elements => elements.map(element => element.getAttribute('data-full')));
  const trigger = page.locator('button[data-lightbox-trigger]').filter({ has: page.locator('video') }).first();
  const src = await trigger.locator('video').getAttribute('data-full');
  const index = mediaSources.indexOf(src);
  await trigger.click();
  const video = page.locator('.lightbox-video');
  await expect(video).toBeVisible();
  await expect(video).toHaveAttribute('src', src!);
  await page.keyboard.press('ArrowRight');
  const activeMedia = page.locator('.lightbox-image:not([hidden]), .lightbox-video:not([hidden])');
  await expect(activeMedia).toHaveAttribute('src', mediaSources[(index + 1) % mediaSources.length]!);
  await page.keyboard.press('ArrowLeft');
  await expect(video).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(video).not.toHaveAttribute('src', /.+/);
  expect(await video.evaluate(element => (element as HTMLVideoElement).paused)).toBe(true);
  await expect(trigger).toBeFocused();
});

test('Schedule past years keep deferred images and open through native buttons', async ({ page }) => {
  await page.goto('/schedule/');
  const past = page.locator('details').nth(1);
  const image = past.locator('img').first();
  const src = await image.getAttribute('data-src');
  expect(src).toBeTruthy();
  await expect(image).not.toHaveAttribute('src', /.+/);
  await past.locator('summary').click();
  await expect(image).toHaveAttribute('src', src!);
  await past.locator('[data-lightbox-trigger]').first().click();
  await expect(page.locator('.lightbox-image')).toHaveAttribute('src', src!);
  await page.keyboard.press('Escape');
  await expect(page.locator('[inert]')).toHaveCount(0);
});

test('artist filtering with one, two or three works keeps the full-gallery card width', async ({ page }) => {
  await page.goto('/illustrations/');
  const width = (await page.locator('.illustration-item').first().boundingBox())!.width;
  const counts = await page.locator('.illustration-item').evaluateAll(items => {
    const result: Record<string, number> = {};
    items.forEach(item => { const artist = (item as HTMLElement).dataset.artist!; result[artist] = (result[artist] || 0) + 1; });
    return result;
  });
  for (const count of [1, 2, 3]) {
    const artist = Object.keys(counts).find(key => counts[key] === count)!;
    expect(artist).toBeTruthy();
    await page.locator('.artist-filter-button[data-artist-id="' + artist + '"]').first().click();
    const visible = page.locator('.illustration-item:visible');
    await expect(visible).toHaveCount(count);
    expect(Math.abs((await visible.first().boundingBox())!.width - width)).toBeLessThan(1);
    await page.locator('.artist-filter-clear').click();
  }
});

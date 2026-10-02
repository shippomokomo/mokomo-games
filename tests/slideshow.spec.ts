import { test, expect } from '@playwright/test';

const picture = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" fill="green"/></svg>';

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  await page.route('https://static.cloudflareinsights.com/**', route => route.abort());
});

test('prefetches the next image while retaining the displayed image and caption', async ({ page }) => {
  const requests: string[] = [];
  await page.route('**/images/illustrations/**', async route => {
    if (!requests.includes(route.request().url())) requests.push(route.request().url());
    await route.fulfill({ contentType: 'image/svg+xml', body: picture });
  });
  await page.goto('/slideshow/?duration=60000&fade=0');
  await expect.poll(() => requests.length).toBe(2);
  const visible = page.locator('.slide.is-visible');
  await expect(visible.locator('img')).toHaveAttribute('src', new URL(requests[0]).pathname);
  await expect(visible.locator('figcaption')).not.toBeEmpty();
  expect(await visible.locator('img').evaluate(img => (img as HTMLImageElement).naturalWidth)).toBe(10);
});

for (const stalledRequest of [0, 1]) {
  test(`recovers when image request ${stalledRequest + 1} never completes`, async ({ page }) => {
    const requests: string[] = [];
    await page.route('**/images/illustrations/**', async route => {
      if (!requests.includes(route.request().url())) requests.push(route.request().url());
      const index = requests.indexOf(route.request().url());
      if (index === stalledRequest) return; // Deliberately leave the request unresolved.
      await route.fulfill({ contentType: 'image/svg+xml', body: picture });
    });
    await page.goto('/slideshow/?duration=1000&fade=0', { waitUntil: 'domcontentloaded' });
    await expect.poll(() => requests.length).toBe(stalledRequest + 1);
    if (stalledRequest === 1) {
      await expect(page.locator('.slide.is-visible img')).toHaveAttribute('src', new URL(requests[0]).pathname);
    }
    await expect.poll(() => requests.length, { timeout: 15000 }).toBeGreaterThan(stalledRequest + 1);
    const recoveredSource = new URL(requests[stalledRequest + 1]).pathname;
    await expect(page.locator('.slide.is-visible img')).toHaveAttribute('src', recoveredSource);
    expect(await page.locator('.slide.is-visible img').evaluate(img => (img as HTMLImageElement).naturalWidth)).toBe(10);
  });
}

test('skips an image that fails to load', async ({ page }) => {
  const requests: string[] = [];
  await page.route('**/images/illustrations/**', async route => {
    if (!requests.includes(route.request().url())) requests.push(route.request().url());
    if (requests.length === 1) { await route.abort(); return; }
    await route.fulfill({ contentType: 'image/svg+xml', body: picture });
  });
  await page.goto('/slideshow/?duration=60000&fade=0', { waitUntil: 'domcontentloaded' });
  await expect.poll(() => requests.length).toBeGreaterThanOrEqual(2);
  await expect(page.locator('.slide.is-visible img')).toHaveAttribute('src', new URL(requests[1]).pathname);
});

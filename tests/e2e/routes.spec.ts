import { expect, test } from '@playwright/test';

/** KICKOFF §5: every route answers 200 and renders its h1 and the footer disclaimer. */
const PATHS = [
  '/', '/map', '/stages', '/stages/select', '/constraints', '/constraints/c-salary-above-rate', '/levers', '/levers/l-structured-interview',
  '/gates', '/gates/ugesp', '/states', '/states/us-wa', '/enablers', '/benchmarks', '/controversies', '/record', '/changes', '/read',
  '/glossary', '/concepts', '/concepts/reading-an-effect-size', '/figures', '/figures/validity-2022', '/references', '/methods', '/about', '/notes',
];

for (const p of PATHS) {
  test(`${p} renders its h1 and the footer disclaimer`, async ({ page }) => {
    const res = await page.goto(p);
    expect(res?.status()).toBe(200);
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.getByTestId('footer-disclaimer')).toContainText('Not legal, HR, compliance or financial advice');
  });
}

test('an unknown path shows the not-found page', async ({ page }) => {
  await page.goto('/no-such-page');
  await expect(page.locator('main h1')).toHaveText('Page not found');
});

test('every route in the spec is in the header nav', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  for (const name of ['Pathfinder', 'Map', 'Stages', 'Levers', 'Gates', 'States', 'Enablers', 'Benchmarks', 'Controversies', 'Changes', 'Decision record', 'Read', 'Glossary', '101s', 'Figures', 'References', 'Notes', 'Methods', 'About']) {
    await expect(nav.getByRole('link', { name, exact: true })).toBeVisible();
  }
});

test('a 101 has no self-check, and renders its maths', async ({ page }) => {
  await page.goto('/concepts/reading-an-effect-size');
  await expect(page.locator('main h1')).toBeVisible();
  await expect(page.getByText(/self-check/i)).toHaveCount(0);
  await expect(page.locator('main input[type=radio]')).toHaveCount(0);
  await expect(page.locator('.katex').first()).toBeVisible();
});

test('as_of appears on /, /read and /about', async ({ page }) => {
  for (const [p, id] of [['/', 'home-asof'], ['/read', 'read-asof'], ['/about', 'about-asof']]) {
    await page.goto(p);
    await expect(page.getByTestId(id)).toContainText('2026-10-22');
  }
});

test('dark mode toggles and persists across a reload', async ({ page }) => {
  await page.goto('/');
  const before = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  await page.getByTestId('theme-toggle').click();
  await expect.poll(() => page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(!before);
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(!before);
});

for (const route of ['/', '/read', '/map', '/figures/validity-2022']) {
  test(`375 px: ${route} lays out without horizontal page scroll`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(route);
    await expect(page.locator('main h1').first()).toBeVisible();
    await page.waitForTimeout(600);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over).toBeLessThanOrEqual(1);
  });
}

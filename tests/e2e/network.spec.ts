import { expect, test } from '@playwright/test';

/** KICKOFF §1, §5: no request leaves the page — every request goes to this site itself. */
test('no request leaves this site on any surface', async ({ page, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const outside: string[] = [];
  page.on('request', (r) => { const u = r.url(); if (!u.startsWith(origin) && !u.startsWith('data:') && !u.startsWith('blob:')) outside.push(`${new URL(page.url()).pathname} → ${u}`); });
  for (const p of ['/', '/map?node=c-salary-above-rate', '/stages/select', '/constraints/c-salary-above-rate', '/levers/l-structured-interview', '/gates/ugesp', '/states/us-ca', '/benchmarks', '/record', '/changes', '/read', '/figures/validity-2022', '/references', '/methods', '/glossary']) {
    await page.goto(p);
    await expect(page.locator('main h1').first()).toBeVisible();
    await page.waitForTimeout(300);
  }
  await page.goto('/');
  await page.getByTestId('state-select').selectOption('us-ca');
  await expect(page.getByTestId('state-panel')).toBeVisible();
  expect(outside).toEqual([]);
});

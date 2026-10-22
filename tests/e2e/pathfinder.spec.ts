import { expect, test } from '@playwright/test';

test('pathfinder: "pass, then decline" lists c-salary-above-rate with its reason; clear empties storage; the map opens with the field', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('pathfinder').getByText('Candidates pass but decline the offer').click();
  const row = page.getByTestId('result-c-salary-above-rate');
  await expect(row).toBeVisible();
  await expect(row.getByTestId('match-reasons')).toContainText('Candidates pass but decline the offer');
  await expect(page.getByTestId('not-advice')).toContainText('only ranked by match count');
  await expect(page.locator('main')).not.toContainText(/\brecommended (lever|constraint)\b|\bbest lever\b/i);
  expect(await page.evaluate(() => Object.keys(localStorage).some((k) => k.endsWith(':pathfinder-answers')))).toBe(true);

  // the state answer changes the overlay panel and not the order
  const before = await page.locator('[data-testid^="result-c-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')));
  await page.getByTestId('state-select').selectOption('us-wa');
  await expect(page.getByTestId('state-panel')).toContainText('Washington');
  const after = await page.locator('[data-testid^="result-c-"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-testid')));
  expect(after).toEqual(before);

  await page.getByTestId('open-map-field').click();
  await expect(page).toHaveURL(/\/map\?field=.*c-salary-above-rate/);
  await expect(page.getByTestId('field-banner')).toContainText('pathfinder');
  await page.getByTestId('graph-view').click();
  await expect(page.locator('[data-node="c-salary-above-rate"]')).toHaveAttribute('opacity', '1');
  const dimmed = page.locator('[data-testid="map-node"][opacity="0.22"]');
  expect(await dimmed.count()).toBeGreaterThan(50);

  await page.goto('/');
  await page.getByTestId('clear-answers').click();
  expect(await page.evaluate(() => Object.keys(localStorage).some((k) => k.endsWith(':pathfinder-answers')))).toBe(false);
  await expect(page.getByTestId('result-c-salary-above-rate')).toHaveCount(0);
});

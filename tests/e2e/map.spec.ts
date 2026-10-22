import { expect, test } from '@playwright/test';

test('map: a node opens its record and dependency lists; a row opens the cited edge; walks dim the rest; the URL round-trips', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.goto('/map');
  await page.locator('[data-testid="map-node"][data-node="c-salary-above-rate"]').click();
  const panel = page.getByTestId('node-panel');
  await expect(panel).toContainText('The salary the market expects exceeds what the contract rate can carry');
  await expect(panel.getByTestId('panel-record')).toContainText('What it is');
  await expect(panel.getByTestId('depends-on')).toBeVisible();
  await expect(panel.getByTestId('depended-on-by')).toBeVisible();
  await expect(page).toHaveURL(/node=c-salary-above-rate/);

  await panel.getByTestId('dependency-row').first().click();
  const edge = page.getByTestId('edge-panel');
  await expect(edge).toBeVisible();
  await expect(edge.getByTestId('edge-evidence').locator('button.bx-cite').first()).toBeVisible();
  await expect(page).toHaveURL(/edge=k-\d+/);

  await page.goto('/map?node=c-salary-above-rate');
  await page.getByTestId('walk-upstream').click();
  await expect(page).toHaveURL(/walk=upstream/);
  await expect.poll(() => page.locator('[data-testid="map-node"][opacity="0.22"]').count()).toBeGreaterThan(20);
  await page.reload();
  await expect(page.getByTestId('walk-upstream')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByTestId('node-panel')).toContainText('The salary the market expects');

  await page.getByTestId('table-view').click();
  await expect(page.getByTestId('map-table')).toBeVisible();
  await expect(page).toHaveURL(/view=table/);
  expect(await page.getByTestId('map-row').count()).toBe(144);
  await page.getByTestId('sort-relation').click();
  await expect(page.getByTestId('map-row').first()).toContainText('amplifies');
});

test('map at 375 px defaults to the table view', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/map');
  await expect(page.getByTestId('map-table')).toBeVisible();
  await expect(page.getByTestId('table-view')).toHaveAttribute('aria-pressed', 'true');
});

test('map nodes are reachable and selectable by keyboard; Esc clears', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 1000 });
  await page.goto('/map');
  const node = page.locator('[data-testid="map-node"][data-node="l-structured-interview"]');
  await node.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('node-panel')).toContainText('What it does not do');
  await node.focus();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('map-help')).toBeVisible();
});

import { expect, test } from '@playwright/test';

test('/states/us-wa: three overlays without the compilation tag (noncompete, stay-or-pay, mini-WARN) and six with it', async ({ page }) => {
  await page.goto('/states/us-wa');
  for (const o of ['noncompete', 'stay_or_pay', 'mini_warn']) await expect(page.getByTestId(`overlay-${o}`)).toHaveAttribute('data-pending', 'false');
  await expect(page.locator('[data-testid^="overlay-"][data-pending="true"]')).toHaveCount(6);
  await expect(page.locator('[data-testid^="overlay-"][data-pending="true"]').first().getByTestId('pending-tag')).toHaveText('compilation-sourced; statute not yet read');
  await expect(page.getByTestId('tag-count')).toContainText('6 of 9');
});

test('a Superseded: change is struck through, linked to its successor and not shown as current', async ({ page }) => {
  await page.goto('/changes');
  const e = page.getByTestId('change-ch-006');
  await expect(e).toHaveAttribute('data-superseded', 'true');
  await expect(e.getByTestId('change-what')).toHaveClass(/line-through/);
  await expect(e.getByTestId('superseded-chip')).toBeVisible();
  await expect(e.getByTestId('successor').locator('a')).toHaveAttribute('href', /#ch-027$/);
  await page.goto('/');
  await expect(page.getByTestId('changes-strip')).not.toContainText('Colorado AI Act effective date (delayed');
});

test('a lever page shows its limits line directly under the evidence block', async ({ page }) => {
  await page.goto('/levers/l-structured-interview');
  const pair = page.getByTestId('evidence-and-limits').first();
  const kids = await pair.evaluate((el) => [...el.children].map((c) => c.getAttribute('data-testid')));
  expect(kids).toEqual(['evidence-block', 'limits-line']);
  for (const id of ['lever-effect', 'lever-population', 'lever-kn']) await expect(pair.getByTestId(id)).toBeVisible();
  await expect(pair.getByTestId('grade-chip')).toHaveText('meta-analysis');
});

test('a constraint page keeps the fixed order and links to the map', async ({ page }) => {
  await page.goto('/constraints/c-salary-above-rate');
  const text = await page.locator('article').innerText();
  const order = ['WHAT IT IS', 'MECHANISM', 'HOW TO TELL', 'INDICATORS', 'LEVERS', 'GATES', 'DEPENDENCIES', 'DECIDED BY', 'EVIDENCE GRADE'].map((h) => text.indexOf(h));
  expect(order.every((x) => x >= 0)).toBe(true);
  expect([...order].sort((a, b) => a - b)).toEqual(order);
  await expect(page.getByTestId('see-on-map')).toHaveAttribute('href', '/map?node=c-salary-above-rate');
  await expect(page.getByTestId('dependency-lists')).toBeVisible();
});

test('/benchmarks with the fixture shows a refreshed BLS value beside the pack value', async ({ page }) => {
  await page.goto('/benchmarks');
  await expect(page.getByTestId('bls-fetched')).toBeVisible();
  const card = page.getByTestId('indicator-ind-jolts-pbs-openings-rate');
  await expect(card.getByTestId('pack-value')).toBeVisible();
  await expect(card.getByTestId('refreshed-value')).toContainText('BLS, refreshed');
  await expect(page.getByTestId('refresh-rule')).toContainText('BLS Public Data API');
});

test('/benchmarks without the data file shows the pack values and says so', async ({ page }) => {
  await page.route('**/data/benchmarks/latest.json', (r) => r.fulfill({ status: 404, body: 'not found' }));
  await page.goto('/benchmarks');
  await expect(page.getByTestId('bls-degraded')).toBeVisible();
  await expect(page.getByTestId('refreshed-value')).toHaveCount(0);
  await expect(page.getByTestId('indicator-ind-jolts-pbs-openings-rate').getByTestId('pack-value')).toBeVisible();
});

test('the decision record: pin two constraints, choose a lever, export, reload, import', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('pathfinder').getByText('Candidates pass but decline the offer').click();
  await page.getByTestId('start-record').click();
  await expect(page).toHaveURL(/\/record/);
  await expect(page.getByTestId('record-local-note')).toContainText('Stays in this browser');
  await page.getByTestId('record-name').fill('Test opening');
  await page.getByTestId('pin-primary-c-salary-above-rate').click();
  const second = page.getByTestId('record-field').locator('[data-testid^="pin-secondary-"]').first();
  await second.click();
  await page.getByTestId('record-levers').locator('input[type=checkbox]').first().check();
  await expect(page.getByTestId('record-levers').getByTestId('limits-line').first()).toBeVisible();
  await page.getByTestId('record-owner').fill('Hiring lead');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByTestId('export-record-json').click()]);
  const json = (await import('node:fs')).readFileSync((await dl.path())!, 'utf8');
  expect(json).toContain('Test opening');
  expect(json).toContain('c-salary-above-rate');
  await page.reload();
  await expect(page.getByTestId('record-name')).toHaveValue('Test opening');
  await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.endsWith(':decision-records')) localStorage.removeItem(k); });
  await page.reload();
  await expect(page.getByTestId('record-editor')).toHaveCount(0);
  await page.getByTestId('import-record').setInputFiles({ name: 'record.json', mimeType: 'application/json', buffer: Buffer.from(json) });
  await expect(page.getByTestId('record-name')).toHaveValue('Test opening');
  await expect(page.getByTestId('pin-primary-c-salary-above-rate')).toHaveAttribute('aria-pressed', 'true');
});

test('a chart tooltip appears on hover', async ({ page }) => {
  await page.goto('/figures/turnover-predictors');
  const chart = page.getByTestId('chart-turnover-predictors');
  await expect(chart).toBeVisible();
  await chart.locator('.recharts-bar-rectangle path, .recharts-rectangle').first().hover();
  await expect(page.getByTestId('chart-tooltip')).toBeVisible();
});

test('the stage map links its nodes to stage records', async ({ page }) => {
  await page.goto('/figures/stage-map');
  await page.locator('[data-kind="stage"]').first().click();
  await expect(page.getByTestId('pathway-card').getByRole('link', { name: /stage page/ })).toBeVisible();
});

import { expect, test } from '@playwright/test';

test('a term popover opens by keyboard and closes with Esc, returning focus', async ({ page }) => {
  await page.goto('/read');
  const term = page.locator('article button.bx-term').first();
  await term.focus();
  await page.keyboard.press('Enter');
  const pop = page.locator('[data-testid$="-popover"]').first();
  await expect(pop).toBeVisible();
  await expect(pop).toContainText('Full entry');
  await page.keyboard.press('Escape');
  await expect(pop).toBeHidden();
  await expect(term).toBeFocused();
});

test('a citation fold-out shows the reference card with its recheck line', async ({ page }) => {
  await page.goto('/read');
  await page.getByTestId('cite-1').first().click();
  const fo = page.getByTestId('citation-foldout').first();
  await expect(fo).toBeVisible();
  await expect(fo.getByTestId('recheck-line')).toContainText('not yet re-read against the live page');
  await expect(fo.getByTestId('study-design')).toBeVisible();
});

test('a synthesis passage is marked in the reader and linked from /methods; the banner says so', async ({ page }) => {
  await page.goto('/methods');
  const link = page.getByTestId('synthesis-list').locator('a').first();
  const href = await link.getAttribute('href');
  await link.click();
  const id = href!.split('#')[1];
  const s = page.locator(`#${id}`);
  await expect(s).toBeVisible();
  await expect(s).toHaveAttribute('data-testid', 'synthesis');
  await expect(page.getByTestId('review-banner')).toContainText('passages marked synthesis');
});

test('a (synthesis) record field is marked on its record and linked from /methods', async ({ page }) => {
  await page.goto('/constraints/c-keyword-screen-rejects-qualified');
  await expect(page.getByTestId('record-synthesis').first()).toContainText('synthesis');
});

test('dollar amounts render as currency, never maths', async ({ page }) => {
  await page.goto('/read');
  await expect(page.locator('article')).toContainText('$1,200');
  await expect(page.locator('article .katex')).toHaveCount(0);
});

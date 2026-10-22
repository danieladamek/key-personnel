import fs from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

const SENTENCE = 'The customer approval took nineteen days last time, and the clearance clock started only after the offer was accepted.';

async function typeIntoNewNote(page: Page) {
  const drawer = page.getByTestId('notepad-drawer');
  await expect(drawer).toBeVisible();
  await drawer.getByTestId('new-note').click();
  const body = drawer.getByTestId('note-body').first();
  await expect(body).toBeFocused();
  await page.keyboard.type(SENTENCE, { delay: 10 });
  await expect(body).toHaveValue(SENTENCE);
  await expect(body).toBeFocused();
}

test('drawer on a page other than /read: a full sentence arrives whole and the textarea keeps focus', async ({ page }) => {
  await page.goto('/gates/ugesp');
  await page.getByTestId('notepad-toggle').click();
  await typeIntoNewNote(page);
});

test('drawer on /read at 375 px: a full sentence arrives whole and keeps focus', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/read');
  await page.getByRole('button', { name: 'Open notepad' }).click();
  await typeIntoNewNote(page);
});

test('the panel and /notes say "Saved in this browser only — export to keep a copy."', async ({ page }) => {
  await page.goto('/levers');
  await page.getByTestId('notepad-toggle').click();
  await expect(page.getByTestId('notepad-drawer').getByTestId('save-status')).toHaveText('Saved in this browser only — export to keep a copy.');
  await page.goto('/notes');
  await expect(page.getByTestId('save-status')).toHaveText('Saved in this browser only — export to keep a copy.');
});

test('notepad: a constraint note, a map-edge note and a section note → reload → persist → export is section-ordered .md → import reads it back', async ({ page }) => {
  await page.goto('/constraints/c-salary-above-rate');
  await page.getByTestId('note-on-constraints-c-salary-above-rate').first().click();
  await page.getByTestId('notepad-drawer').getByTestId('note-body').first().fill('Constraint note.');
  await page.goto('/notes');
  await page.getByTestId('anchor-type').selectOption('section');
  await page.getByTestId('anchor-id').selectOption('3-pay-in-a-rate-constrained-firm');
  await page.getByTestId('add-anchored-note').click();
  await expect(page.locator('textarea:focus')).toHaveCount(1);
  await page.locator('textarea:focus').fill('Section note.');
  await page.getByTestId('anchor-type').selectOption('links');
  await page.getByTestId('anchor-id').selectOption('k-001');
  await page.getByTestId('add-anchored-note').click();
  await page.locator('textarea:focus').fill('Edge note.');
  await page.reload();
  await expect(page.getByTestId('note')).toHaveCount(3);
  await expect(page.getByRole('link', { name: /constraint “The salary the market expects/ })).toBeVisible();
  const [dl] = await Promise.all([page.waitForEvent('download'), page.getByTestId('export-notes').click()]);
  const md = fs.readFileSync((await dl.path())!, 'utf8');
  expect(md).toMatch(/^# Notes — Key Personnel/);
  expect(md.indexOf('Section note.')).toBeLessThan(md.indexOf('## Constraints'));
  expect(md.indexOf('## Constraints')).toBeLessThan(md.indexOf('## Map edges'));
  expect(md).toContain('Constraint note.');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await expect(page.getByTestId('note')).toHaveCount(0);
  await page.getByTestId('import-notes').setInputFiles({ name: 'notes.md', mimeType: 'text/markdown', buffer: Buffer.from(md) });
  await expect(page.getByTestId('note')).toHaveCount(3);
});

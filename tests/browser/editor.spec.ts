import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import type { Palette } from '../../src/themes/palette';
import { parsePalette } from '../../src/themes/palette';

const starter = JSON.parse(readFileSync(new URL('../../src/themes/default.json', import.meta.url), 'utf8')) as Palette;

test('edits, reorders, locks and persists after a reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Palette name' }).fill('Soft Skies');
  await page.getByRole('textbox', { name: 'Palette name' }).press('Enter');
  await page.getByRole('textbox', { name: 'Swatch 1 name' }).fill('Orchid');
  await page.getByRole('textbox', { name: 'Swatch 1 name' }).press('Enter');
  await page.getByRole('textbox', { name: 'Swatch 1 hex' }).fill('#D0AAFF');
  await page.getByRole('textbox', { name: 'Swatch 1 hex' }).press('Enter');
  await page.getByRole('button', { name: 'Lock swatch 1' }).click();
  await page.getByRole('button', { name: 'Move swatch 1 right' }).click();
  await page.getByLabel('Base swatch').selectOption('mint');
  await page.getByLabel('Harmony', { exact: true }).selectOption('Triadic');
  await page.getByRole('button', { name: 'Generate harmony' }).click();
  await page.getByLabel('accent', { exact: true }).selectOption('lilac');
  await page.getByRole('button', { name: 'Add color' }).click();
  await page.getByRole('button', { name: 'Remove swatch 7' }).click();
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Palette name' })).toHaveValue('Soft Skies');
  await expect(page.getByRole('textbox', { name: 'Swatch 2 name' })).toHaveValue('Orchid');
  await expect(page.getByRole('textbox', { name: 'Swatch 2 hex' })).toHaveValue('#D0AAFF');
  await expect(page.getByRole('button', { name: 'Lock swatch 2' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByLabel('accent', { exact: true })).toHaveValue('lilac');
  await expect(page.getByRole('textbox', { name: 'Swatch 3 hex' })).not.toHaveValue('#AED8F5');
});

test('imports a palette and downloads each supported format', async ({ page }) => {
  await page.goto('/');
  const picker = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'Import JSON' }).click();
  const palette = { ...starter, name: 'Comet Test' };
  await (await picker).setFiles({ name: 'theme.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(palette)) });
  await expect(page.getByRole('textbox', { name: 'Palette name' })).toHaveValue('Comet Test');
  for (const [format, extension] of [['CyberStudios JSON', '.json'], ['CSS', '.css'], ['Swatch JSON', '-swatches.json'], ['GIMP GPL', '.gpl']]) {
    await page.getByLabel('Format', { exact: true }).selectOption(format);
    const downloaded = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download', exact: true }).click();
    const file = await downloaded;
    expect(file.suggestedFilename()).toBe('comet-test' + extension);
    const contents = await readFile((await file.path())!, 'utf8');
    if (format === 'CyberStudios JSON') expect(parsePalette(contents)).toEqual({ ok: true, palette });
    if (format === 'CSS') expect(contents).toContain('--pp-accent: #C6B6F3;');
    if (format === 'Swatch JSON') expect(JSON.parse(contents)).toHaveLength(6);
    if (format === 'GIMP GPL') expect(contents).toMatch(/^GIMP Palette/);
  }
});

test('checks contrast and fits a narrow viewport with accessible defaults', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  const report = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(report.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) }))).toEqual([]);
  await page.getByLabel('Text color', { exact: true }).selectOption('midnight');
  await expect(page.getByLabel('Contrast ratio')).toHaveText('1.00:1');
  await expect(page.getByRole('list', { name: 'WCAG text contrast results' }).getByText('Fail')).toHaveCount(4);
});

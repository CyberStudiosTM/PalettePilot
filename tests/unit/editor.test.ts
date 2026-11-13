import { expect, it } from 'vitest';
import { contrastRatio } from '../../src/accessibility/contrast';
import { harmonies, mapToSrgb, toOklch } from '../../src/color-engine/harmony';
import { editorReducer } from '../../src/editor';
import { createExport } from '../../src/exporters/files';
import starter from '../../src/themes/default.json';
import { parsePalette } from '../../src/themes/palette';

it('uses exported sRGB values for WCAG text contrast', () => {
  expect(contrastRatio('#FFFFFF', '#000000')).toBe(21);
  expect(contrastRatio('#777777', '#FFFFFF')).toBeLessThan(4.5);
  expect(contrastRatio('#767676', '#FFFFFF')).toBeGreaterThan(4.5);
  expect(contrastRatio('#C6B6F3', '#C6B6F3')).toBe(1);
});

it.each(['#FFFFFF', '#000000', '#00FF00', '#C6B6F3'])('round trips %s through OKLCH', hex => {
  expect(mapToSrgb(toOklch(hex))).toBe(hex);
});

it('reduces chroma without losing the target hue or lightness', () => {
  const result = toOklch(mapToSrgb({ hue: 40, lightness: 0.7, chroma: 0.45 }));
  expect(result.chroma).toBeLessThan(0.3);
  expect(result.lightness).toBeCloseTo(0.7, 2);
  expect(Math.abs(result.hue - 40)).toBeLessThan(2);
});

it.each(harmonies)('generates %s colors and preserves fixed swatches', mode => {
  const state = { palette: starter, locks: ['mint'] };
  const result = editorReducer(state, { type: 'generate', anchor: 'lilac', mode });
  expect(result.palette.colors.slice(0, 2)).toEqual(starter.colors.slice(0, 2));
  expect(result.palette.colors.slice(2)).not.toEqual(starter.colors.slice(2));
  expect(result.palette.colors.every(color => /^#[0-9A-F]{6}$/.test(color.hex))).toBe(true);
});

it('reorders without changing IDs and repairs role references when a swatch is removed', () => {
  const state = { palette: starter, locks: [] };
  const moved = editorReducer(state, { type: 'move', id: 'lilac', direction: 1 });
  expect(moved.palette.colors[1].id).toBe('lilac');
  const removed = editorReducer(moved, { type: 'remove', id: 'midnight' });
  expect(removed.palette.roles.background).toBe('mint');
  expect(removed.palette.roles.surface).toBe('mint');
  expect(parsePalette(createExport(removed.palette, 'CyberStudios JSON').text).ok).toBe(true);
});

it('creates portable files using resolved values and strips GPL control characters', () => {
  const palette = { ...starter, name: 'Cloud\nSky' };
  expect(parsePalette(createExport(palette, 'CyberStudios JSON').text)).toEqual({ ok: true, palette });
  expect(createExport(palette, 'CSS').text).toContain('--pp-accent: #C6B6F3;');
  expect(JSON.parse(createExport(palette, 'Swatch JSON').text)[0]).toEqual({ name: 'Lilac', hex: '#C6B6F3' });
  expect(createExport(palette, 'GIMP GPL').text).toContain('GIMP Palette\nName: Cloud Sky\nColumns: 4\n#\n198\t182\t243\tLilac');
});

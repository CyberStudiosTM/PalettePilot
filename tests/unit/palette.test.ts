import { describe, expect, it } from 'vitest';
import { parsePalette, resolveRoles, validatePalette } from '../../src/themes/palette';
import starter from '../../src/themes/default.json';
import fixtures from '../fixtures/palettes.json';

describe('CyberStudios Palette JSON v1', () => {
  it.each(fixtures)('$name', ({ value, error }) => {
    const result = validatePalette(value);
    if (error) expect(result).toEqual({ ok: false, error: expect.stringContaining(error) });
    else expect(result.ok).toBe(true);
  });

  it('reads a UTF-8 BOM and resolves missing optional roles', () => {
    const roles = { background: 'midnight', surface: 'midnight', foreground: 'cloud', accent: 'lilac' };
    const result = parsePalette('\uFEFF' + JSON.stringify({ ...starter, roles }));
    if (!result.ok) throw new Error(result.error);
    expect(resolveRoles(result.palette)).toMatchObject({ muted: '#FFFFFF', warning: '#C6B6F3' });
  });

  it('reports invalid JSON', () => {
    expect(parsePalette('{')).toEqual({ ok: false, error: 'The file contains invalid JSON.' });
  });
});

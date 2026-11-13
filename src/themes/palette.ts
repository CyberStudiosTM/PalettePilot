export const requiredRoles = ['background', 'surface', 'foreground', 'accent'] as const;
export const optionalRoles = ['muted', 'success', 'warning', 'error'] as const;
export const roleNames = [...requiredRoles, ...optionalRoles] as const;

export type Role = typeof roleNames[number];
export type RequiredRole = typeof requiredRoles[number];
export interface Swatch { id: string; name: string; hex: string }
export interface Palette {
  schemaVersion: string;
  id: string;
  name: string;
  author?: string;
  colors: Swatch[];
  roles: Record<RequiredRole, string> & Record<string, string | undefined>;
}
export type PaletteResult = { ok: true; palette: Palette } | { ok: false; error: string };

export const hexPattern = /^#[0-9a-fA-F]{6}$/;
export const maxPaletteBytes = 256 * 1024;
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const isName = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const fail = (error: string): PaletteResult => ({ ok: false, error });

export function validatePalette(input: unknown): PaletteResult {
  if (!isRecord(input)) return fail('The palette must be a JSON object.');
  const { schemaVersion, id, name, author, colors, roles } = input;
  if (typeof schemaVersion !== 'string' || !/^1\.(0|[1-9][0-9]*)$/.test(schemaVersion)) {
    return fail('A CyberStudios palette needs a supported 1.x schemaVersion.');
  }
  if (!isName(id) || !isName(name)) return fail('The palette needs a non-empty ID and name.');
  if (author !== undefined && typeof author !== 'string') return fail('The author must be text.');
  if (!Array.isArray(colors) || colors.length === 0) return fail('Add at least one color.');
  const ids = new Set<string>();
  const swatches: Swatch[] = [];
  for (const [index, color] of colors.entries()) {
    if (!isRecord(color) || !isName(color.id) || !isName(color.name)) {
      return fail(`Color ${index + 1} needs a non-empty ID and name.`);
    }
    if (ids.has(color.id)) return fail(`Duplicate color ID “${color.id}”.`);
    if (typeof color.hex !== 'string' || !hexPattern.test(color.hex)) {
      return fail(`Color “${color.name}” needs a six-digit hex value like #C6B6F3.`);
    }
    ids.add(color.id);
    swatches.push({ id: color.id, name: color.name, hex: color.hex.toUpperCase() });
  }
  if (!isRecord(roles)) return fail('The palette needs a roles object.');
  for (const role of requiredRoles) {
    if (!Object.hasOwn(roles, role)) return fail(`Missing required role “${role}”.`);
  }
  for (const [role, reference] of Object.entries(roles)) {
    if (typeof reference !== 'string' || !ids.has(reference)) {
      return fail(`Role “${role}” must reference an existing color ID.`);
    }
  }
  const palette: Palette = {
    schemaVersion, id, name, colors: swatches,
    roles: {
      ...Object.fromEntries(Object.entries(roles) as [string, string][]),
      background: roles.background as string,
      surface: roles.surface as string,
      foreground: roles.foreground as string,
      accent: roles.accent as string,
    },
  };
  if (author !== undefined) palette.author = author;
  return { ok: true, palette };
}

export function parsePalette(text: string): PaletteResult {
  let value: unknown;
  try {
    value = JSON.parse(text.replace(/^\uFEFF/, ''));
  } catch {
    return fail('The file contains invalid JSON.');
  }
  return validatePalette(value);
}

export function resolveRoles(palette: Palette): Record<Role, string> {
  const colors = new Map(palette.colors.map(color => [color.id, color.hex]));
  const get = (role: Role) => colors.get(palette.roles[role] ?? '');
  const foreground = get('foreground')!;
  const accent = get('accent')!;
  return {
    background: get('background')!, surface: get('surface')!, foreground, accent,
    muted: get('muted') ?? foreground, success: get('success') ?? accent,
    warning: get('warning') ?? accent, error: get('error') ?? accent,
  };
}

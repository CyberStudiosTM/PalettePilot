import type { EditorState } from './editor';
import { validatePalette } from './themes/palette';

const key = 'palettepilot.library.v1';
export function readLibrary(): EditorState[] {
  try {
    const records: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    if (!Array.isArray(records)) return [];
    return records.flatMap(record => {
      const result = validatePalette(record?.palette);
      if (!result.ok || result.palette.colors.length < 2 || result.palette.colors.length > 12) return [];
      const ids = new Set(result.palette.colors.map(swatch => swatch.id));
      return [{ palette: result.palette, locks: Array.isArray(record.locks) ? record.locks.filter((id: string) => ids.has(id)) : [] }];
    });
  } catch { return []; }
}
export function writeLibrary(library: EditorState[]): void {
  localStorage.setItem(key, JSON.stringify(library));
}

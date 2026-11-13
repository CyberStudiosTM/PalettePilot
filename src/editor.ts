import starter from './themes/default.json';
import { validatePalette, type Palette, type Role } from './themes/palette';
import { harmonyColor, toOklch, type Harmony } from './color-engine/harmony';

export const storageKey = 'palettepilot.editor.v1';
export const minColors = 2;
export const maxColors = 12;

export interface EditorState { palette: Palette; locks: string[] }
type Action =
  | { type: 'name'; name: string }
  | { type: 'swatch'; id: string; field: 'name' | 'hex'; value: string }
  | { type: 'lock' | 'remove'; id: string }
  | { type: 'move'; id: string; direction: -1 | 1 }
  | { type: 'add'; id: string }
  | { type: 'role'; role: Role; id: string }
  | { type: 'generate'; anchor: string; mode: Harmony }
  | { type: 'import'; palette: Palette };

export function loadEditor(): EditorState {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    if (saved) {
      const result = validatePalette(saved.palette);
      if (result.ok && result.palette.colors.length >= minColors && result.palette.colors.length <= maxColors) {
        const ids = new Set(result.palette.colors.map(color => color.id));
        const locks = Array.isArray(saved.locks) ? saved.locks.filter((id: string) => ids.has(id)) : [];
        return { palette: result.palette, locks };
      }
    }
  } catch {
    // Invalid or unavailable storage starts a fresh editor.
  }
  return { palette: starter, locks: [] };
}

export function editorReducer(state: EditorState, action: Action): EditorState {
  const { palette, locks } = state;
  const withPalette = (change: Partial<Palette>): EditorState => ({ ...state, palette: { ...palette, ...change } });
  switch (action.type) {
    case 'name': return withPalette({ name: action.name });
    case 'swatch':
      return withPalette({ colors: palette.colors.map(color =>
        color.id === action.id ? { ...color, [action.field]: action.value } : color) });
    case 'lock':
      return { ...state, locks: locks.includes(action.id) ? locks.filter(id => id !== action.id) : [...locks, action.id] };
    case 'add':
      if (palette.colors.length >= maxColors) return state;
      return withPalette({ colors: [...palette.colors, { id: action.id, name: 'New swatch', hex: '#F4C8EA' }] });
    case 'remove': {
      if (palette.colors.length <= minColors || locks.includes(action.id)) return state;
      const colors = palette.colors.filter(color => color.id !== action.id);
      // Move references to the first remaining swatch so the palette stays valid.
      const roles = { ...palette.roles };
      for (const role of Object.keys(roles)) {
        if (roles[role] === action.id) roles[role] = colors[0].id;
      }
      return withPalette({ colors, roles });
    }
    case 'move': {
      const colors = [...palette.colors];
      const index = colors.findIndex(color => color.id === action.id);
      const target = index + action.direction;
      if (index < 0 || target < 0 || target >= colors.length) return state;
      [colors[index], colors[target]] = [colors[target], colors[index]];
      return withPalette({ colors });
    }
    case 'role': {
      const roles = { ...palette.roles };
      if (action.id) roles[action.role] = action.id;
      else delete roles[action.role];
      return withPalette({ roles });
    }
    case 'generate': {
      const anchor = palette.colors.find(color => color.id === action.anchor);
      if (!anchor) return state;
      const isFixed = (id: string) => id === anchor.id || locks.includes(id);
      const count = palette.colors.filter(color => !isFixed(color.id)).length;
      const base = toOklch(anchor.hex);
      let offset = 0;
      return withPalette({ colors: palette.colors.map(color => isFixed(color.id) ? color : {
        ...color, hex: harmonyColor(base, action.mode, offset++, count),
      }) });
    }
    case 'import': return { palette: action.palette, locks: [] };
  }
}

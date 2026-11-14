import { documentExport } from './documents';
import { hexToRgb } from '../color-engine/srgb';
import { resolveRoles, type Palette } from '../themes/palette';

export const formats = ['CyberStudios JSON', 'CSS', 'Swatch JSON', 'GIMP GPL', 'XML', 'HTML', 'Design tokens'] as const;
export type Format = typeof formats[number];

const json = (value: unknown) => JSON.stringify(value, null, 2) + '\n';
const singleLine = (value: string) => value.replace(/[\u0000-\u001F\u007F-\u009F\u2028\u2029]+/g, ' ').trim();

export function createExport(palette: Palette, format: Format) {
  const name = palette.name.normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 72) || 'palette';
  switch (format) {
    case 'CyberStudios JSON':
      return { name: name + '.json', type: 'application/json', text: json({ ...palette, schemaVersion: '1.0' }) };
    case 'Swatch JSON':
      return { name: name + '-swatches.json', type: 'application/json', text: json(palette.colors.map(({ name, hex }) => ({ name, hex }))) };
    case 'CSS': {
      const swatches = palette.colors.map((color, index) => `  --pp-swatch-${index + 1}: ${color.hex};`);
      const roles = Object.entries(resolveRoles(palette)).map(([role, color]) => `  --pp-${role}: ${color};`);
      return { name: name + '.css', type: 'text/css', text: [':root {', ...swatches, ...roles, '}', ''].join('\n') };
    }
    case 'XML':
    case 'HTML':
    case 'Design tokens': {
      const { suffix, ...file } = documentExport(palette, format);
      return { name: name + suffix, ...file };
    }
    case 'GIMP GPL': {
      const rows = palette.colors.map(color => `${hexToRgb(color.hex).join('\t')}\t${singleLine(color.name)}`);
      return { name: name + '.gpl', type: 'text/plain', text: ['GIMP Palette', `Name: ${singleLine(palette.name)}`, 'Columns: 4', '#', ...rows, ''].join('\n') };
    }
  }
}

export function downloadExport(file: ReturnType<typeof createExport>): void {
  const url = URL.createObjectURL(new Blob([file.text], { type: file.type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

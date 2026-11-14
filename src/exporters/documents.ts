import { resolveRoles, type Palette } from '../themes/palette';
const escape = (value: string) => value.replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu, '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));

export function documentExport(palette: Palette, format: 'XML' | 'HTML' | 'Design tokens') {
  const roles = resolveRoles(palette);
  if (format === 'XML') return { suffix: '.xml', type: 'application/xml', text: '<?xml version="1.0" encoding="UTF-8"?>\n' +
    `<palette version="1.0" id="${escape(palette.id)}" name="${escape(palette.name)}">\n` +
    palette.colors.map(c => `  <color id="${escape(c.id)}" name="${escape(c.name)}" hex="${c.hex}"/>\n`).join('') +
    Object.entries(palette.roles).map(([role,id]) => `  <role name="${escape(role)}" color="${escape(id!)}"/>\n`).join('') + '</palette>\n' };
  if (format === 'Design tokens') return { suffix: '-tokens.json', type: 'application/json', text: JSON.stringify({
    colors: Object.fromEntries(Object.entries(roles).map(([role, hex]) => [role, {
      $type: 'color', $value: { colorSpace: 'srgb', components: [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255), hex },
    }])),
  }, null, 2) + '\n' };
  return { suffix: '.html', type: 'text/html', text: `<!doctype html>
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(palette.name)}</title>
<style>body{font:1rem system-ui;background:${roles.background};color:${roles.foreground};max-width:64rem;margin:auto;padding:2rem}ul{display:grid;grid-template-columns:repeat(auto-fit,minmax(10rem,1fr));gap:1rem;padding:0}li{list-style:none;background:${roles.surface};padding:1rem;border:1px solid ${roles.accent};border-radius:.75rem}i{display:block;height:5rem;border-radius:.5rem;margin-bottom:.5rem}</style>
<h1>${escape(palette.name)}</h1><ul>${palette.colors.map(c => `<li><i style="background:${c.hex}"></i>${escape(c.name)} <code>${c.hex}</code></li>`).join('')}</ul></html>\n` };
}

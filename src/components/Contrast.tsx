import { repairContrast } from '../accessibility/audit';
import { resolveRoles } from '../themes/palette';
import { useState } from 'react';
import { contrastCriteria, contrastRatio } from '../accessibility/contrast';
import type { Palette } from '../themes/palette';
import { ColorSelect } from './ColorSelect';

export function Contrast({ palette, onRepair }: { palette: Palette; onRepair: (id: string, hex: string) => void }) {
  const [selection, setSelection] = useState<{ foreground?: string; background?: string }>({});
  const [target, setTarget] = useState(4.5);
  const foreground = palette.colors.find(swatch => swatch.id === selection.foreground)
    ?? palette.colors.find(swatch => swatch.id === palette.roles.foreground)!;
  const background = palette.colors.find(swatch => swatch.id === selection.background)
    ?? palette.colors.find(swatch => swatch.id === palette.roles.background)!;
  const ratio = contrastRatio(foreground.hex, background.hex);
  const roles = resolveRoles(palette);
  const checks = [
    ['Terminal text', roles.foreground, roles.surface, 4.5],
    ['Muted text', roles.muted, roles.surface, 4.5],
    ['Button text', roles.background, roles.accent, 4.5],
    ['Focus indicator', roles.accent, roles.background, 3],
  ] as const;
  const repair = ratio < target && foreground.id !== background.id ? repairContrast(foreground.hex, background.hex, target) : undefined;
  return (
    <section className="panel contrast" aria-labelledby="contrast-heading">
      <div className="panel-title"><h2 id="contrast-heading">Contrast check</h2><output aria-label="Contrast ratio">{ratio.toFixed(2)}:1</output></div>
      <div className="two-columns">
        <ColorSelect label="Text color" colors={palette.colors} value={foreground.id} onChange={id => setSelection({ ...selection, foreground: id })} />
        <ColorSelect label="Background color" colors={palette.colors} value={background.id} onChange={id => setSelection({ ...selection, background: id })} />
      </div>
      <div className="contrast-sample" style={{ color: foreground.hex, backgroundColor: background.hex }}>Aa</div>
      <ul className="criteria" aria-label="WCAG text contrast results">
        {contrastCriteria.map(({ minimum, label }) => (
          <li key={label}>{label} <strong data-pass={ratio >= minimum}>{ratio >= minimum ? 'Pass' : 'Fail'}</strong></li>
        ))}
      </ul>
      <h3>Theme contrast</h3>
      <ul>{checks.map(([label, text, surface, target]) => {
        const result = contrastRatio(text, surface);
        return <li key={label}>{label} · {result.toFixed(2)}:1 · {result >= target ? 'Pass' : 'Fail'}</li>;
      })}</ul>
      <label>Repair target <select value={target} onChange={event => setTarget(Number(event.target.value))}>
        <option value={4.5}>AA normal text</option><option value={7}>AAA normal text</option>
      </select></label>
      {repair && <p style={{ color: repair, backgroundColor: background.hex }}>
        Preview {repair} · {contrastRatio(repair, background.hex).toFixed(2)}:1 · Roles affected: {
          Object.entries(palette.roles).filter(([, id]) => id === foreground.id).map(([role]) => role).join(', ') || 'none'
        }
      </p>}
      {repair && <button type="button" onClick={() => onRepair(foreground.id, repair)}>
        Apply suggested text color {repair}
      </button>}
    </section>
  );
}

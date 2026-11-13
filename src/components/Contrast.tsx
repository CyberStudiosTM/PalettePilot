import { useState } from 'react';
import { contrastCriteria, contrastRatio } from '../accessibility/contrast';
import type { Palette } from '../themes/palette';
import { ColorSelect } from './ColorSelect';

export function Contrast({ palette }: { palette: Palette }) {
  const [selection, setSelection] = useState<{ foreground?: string; background?: string }>({});
  const foreground = palette.colors.find(swatch => swatch.id === selection.foreground)
    ?? palette.colors.find(swatch => swatch.id === palette.roles.foreground)!;
  const background = palette.colors.find(swatch => swatch.id === selection.background)
    ?? palette.colors.find(swatch => swatch.id === palette.roles.background)!;
  const ratio = contrastRatio(foreground.hex, background.hex);
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
    </section>
  );
}

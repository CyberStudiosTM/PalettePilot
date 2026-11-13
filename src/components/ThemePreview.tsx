import type { CSSProperties } from 'react';
import { resolveRoles, type Palette } from '../themes/palette';

export function ThemePreview({ palette }: { palette: Palette }) {
  const style = Object.fromEntries(
    Object.entries(resolveRoles(palette)).map(([role, hex]) => [`--preview-${role}`, hex]),
  ) as CSSProperties;
  return (
    <section className="panel" aria-labelledby="preview-heading">
      <h2 id="preview-heading">Live preview</h2>
      <div className="theme-sample" style={style} aria-label="Theme sample">
        <div className="sample-card">
          <strong>{palette.name}</strong>
          <span className="sample-copy">Signal received.</span>
          <div className="sample-form"><span className="sample-input">Search skies</span><span className="sample-button">Connect</span></div>
        </div>
        <div className="sample-terminal"><span>~ ❯</span> status <br /><strong>● Connected</strong> <em>in cyberspace</em></div>
      </div>
    </section>
  );
}

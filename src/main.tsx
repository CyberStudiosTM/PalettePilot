import { contrastRatio } from './accessibility/contrast';
import { readLibrary, writeLibrary } from './library';
import { StrictMode, useEffect, useReducer, useRef, useState, type ChangeEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { ColorSelect } from './components/ColorSelect';
import { Contrast } from './components/Contrast';
import { Field } from './components/Field';
import { SwatchCard } from './components/SwatchCard';
import { ThemePreview } from './components/ThemePreview';
import { harmonies, type Harmony } from './color-engine/harmony';
import { editorReducer, loadEditor, maxColors, minColors, storageKey } from './editor';
import { createExport, downloadExport, formats, type Format } from './exporters/files';
import { maxPaletteBytes, optionalRoles, parsePalette, roleNames, validatePalette } from './themes/palette';
import './style.css';

function variant(palette: ReturnType<typeof loadEditor>['palette'], dark: boolean) {
  const colors = [...palette.colors].sort((a, b) => contrastRatio(a.hex, '#000000') - contrastRatio(b.hex, '#000000'));
  const background = (dark ? colors[0] : colors.at(-1)!).id;
  const foreground = (dark ? colors.at(-1)! : colors[0]).id;
  const surface = colors.find(color => color.id === background)!;
  const roles: typeof palette.roles = { ...palette.roles, background, surface: background, foreground };
  for (const role of ['accent', 'muted', 'success', 'warning', 'error'] as const) {
    const color = colors.find(swatch => swatch.id === roles[role]);
    if (!color || contrastRatio(color.hex, surface.hex) < 4.5) roles[role] = foreground;
  }
  return { ...palette, roles };
}

function App() {
  const [{ state, past, future }, dispatchHistory] = useReducer(
    (history: { state: ReturnType<typeof loadEditor>; past: ReturnType<typeof loadEditor>[]; future: ReturnType<typeof loadEditor>[] },
      action: Parameters<typeof editorReducer>[1] | 'undo' | 'redo' | { restore: ReturnType<typeof loadEditor> }) => {
      if (action === 'undo') return history.past.length ? {
        state: history.past.at(-1)!, past: history.past.slice(0, -1), future: [history.state, ...history.future],
      } : history;
      if (action === 'redo') return history.future.length ? {
        state: history.future[0], past: [...history.past, history.state], future: history.future.slice(1),
      } : history;
      const state = 'restore' in action ? action.restore : editorReducer(history.state, action);
      return state === history.state ? history : { state, past: [...history.past.slice(-49), history.state], future: [] };
    }, undefined, () => ({ state: loadEditor(), past: [], future: [] }),
  );
  const dispatch = dispatchHistory;
  const [library, setLibrary] = useState(readLibrary);
  function saveProject(suffix = '') {
    const project = suffix ? { ...state, palette: { ...state.palette, id: crypto.randomUUID(), name: state.palette.name + suffix } } : state;
    if (suffix.endsWith('Light') || suffix.endsWith('Dark')) {
      project.palette = variant(project.palette, suffix.endsWith('Dark'));
    }
    const next = [...library.filter(item => item.palette.id !== project.palette.id), project];
    try { writeLibrary(next); setLibrary(next); if (suffix) dispatch({ restore: project }); }
    catch { setMessage('Could not save the palette library.'); }
  }
  const [mode, setMode] = useState<Harmony>('Analogous');
  const [anchorId, setAnchor] = useState<string>();
  const [format, setFormat] = useState<Format>('CyberStudios JSON');
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(true);
  const importer = useRef<HTMLInputElement>(null);
  const lastImport = useRef(0);
  const { palette, locks } = state;
  const { colors } = palette;
  const anchor = colors.find(swatch => swatch.id === anchorId) ?? colors[0];
  const canGenerate = colors.some(swatch => swatch.id !== anchor.id && !locks.includes(swatch.id));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [state]);

  async function importPalette(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const request = ++lastImport.current;
    try {
      if (file.size > maxPaletteBytes) throw new Error('Use a JSON palette no larger than 256 KiB.');
      const result = parsePalette(await file.text());
      if (request !== lastImport.current) return;
      if (!result.ok) throw new Error(result.error);
      if (result.palette.colors.length < minColors || result.palette.colors.length > maxColors) {
        throw new Error('PalettePilot edits palettes with 2–12 swatches.');
      }
      dispatch({ type: 'import', palette: result.palette });
      setAnchor(undefined);
      setMessage(`Imported ${result.palette.name}.`);
    } catch (error) {
      if (request === lastImport.current) setMessage(error instanceof Error ? error.message : 'The palette could not be read.');
    }
  }

  async function exportPalette() {
    const result = validatePalette(palette);
    if (!result.ok) { setMessage(result.error); return; }
    const file = createExport(result.palette, format);
    try {
      if (window.palettePilotDesktop) {
        if (!await window.palettePilotDesktop.savePalette(file.name, file.text)) return;
      } else {
        downloadExport(file);
      }
      setMessage(`Exported ${file.name}.`);
    } catch {
      setMessage('The palette could not be saved.');
    }
  }

  return (
    <div className="workspace">
      <header className="site-header"><a href="https://github.com/CyberStudiosTM"><span aria-hidden="true">✦</span> CYBERSTUDIOS™</a><span className="local-state" role="status">{saved ? 'Saved on this device' : 'Local saving unavailable'}</span></header>
      <main>
        <div className="hero">
          <div><h1>Palette<span>Pilot</span></h1><p>Mix colors, check contrast, and take your theme anywhere.</p></div>
          <button type="button" className="secondary import" onClick={() => importer.current?.click()}>↥ Import JSON</button>
          <input ref={importer} type="file" aria-label="Import palette file" hidden accept=".json,application/json" onChange={importPalette} />
        </div>
        <section className="panel" aria-label="Palette library">
          <div className="swatch-actions">
            <button onClick={() => saveProject()}>Save project</button>
            <button onClick={() => saveProject(' copy')}>Duplicate</button>
            <button onClick={() => saveProject(' · Light')}>Save light variant</button>
            <button onClick={() => saveProject(' · Dark')}>Save dark variant</button>
            <button disabled={!past.length} onClick={() => dispatch('undo')}>Undo</button>
            <button disabled={!future.length} onClick={() => dispatch('redo')}>Redo</button>
            <label>Open saved palette
              <select value="" onChange={event => {
                const project = library.find(item => item.palette.id === event.target.value);
                if (project) dispatch({ restore: project });
              }}>
                <option value="">Choose a palette</option>
                {library.map(({ palette }) => <option key={palette.id} value={palette.id}>{palette.name}</option>)}
              </select>
            </label>
          </div>
        </section>
        <section className="panel editor" aria-labelledby="swatches-heading">
          <div className="editor-header">
            <div><h2 id="swatches-heading">Swatches <small>{colors.length} / {maxColors}</small></h2>
              <div className="name-field"><span>Palette name</span><Field label="Palette name" value={palette.name} onCommit={name => dispatch({ type: 'name', name })} maxLength={120} /></div>
            </div>
            <button type="button" className="secondary" disabled={colors.length >= maxColors}
              onClick={() => dispatch({ type: 'add', id: crypto.randomUUID() })}>+ Add color</button>
          </div>
          <ul className="swatch-grid">
            {colors.map((color, index) => <SwatchCard key={color.id} color={color} index={index}
              locked={locks.includes(color.id)} canRemove={colors.length > minColors} canMoveRight={index < colors.length - 1}
              onEdit={(field, value) => dispatch({ type: 'swatch', id: color.id, field, value })}
              onMove={direction => dispatch({ type: 'move', id: color.id, direction })}
              onLock={() => dispatch({ type: 'lock', id: color.id })}
              onRemove={() => dispatch({ type: 'remove', id: color.id })} />)}
          </ul>
          <div className="harmony">
            <ColorSelect label="Base swatch" colors={colors} value={anchor.id} onChange={setAnchor} />
            <label className="select-field"><span>Harmony</span><select aria-label="Harmony" value={mode} onChange={event => setMode(event.target.value as Harmony)}>
              {harmonies.map(item => <option key={item}>{item}</option>)}
            </select></label>
            <button type="button" className="primary" disabled={!canGenerate} onClick={() => dispatch({ type: 'generate', anchor: anchor.id, mode })}>Generate harmony</button>
          </div>
        </section>
        <div className="workbench">
          <section className="panel" aria-labelledby="roles-heading">
            <h2 id="roles-heading">Theme roles</h2>
            <div className="role-grid">
              {roleNames.map(role => <ColorSelect key={role} label={role} value={palette.roles[role] ?? ''} colors={colors}
                optional={optionalRoles.some(optional => optional === role)}
                onChange={id => dispatch({ type: 'role', role, id })} />)}
            </div>
          </section>
          <Contrast key={palette.id} palette={palette} onRepair={(id, value) => dispatch({ type: 'swatch', id, field: 'hex', value })} />
          <div className="two-columns variant-previews" aria-label="Light and dark previews">
  <ThemePreview palette={{ ...variant(palette, false), name: 'Light preview' }} />
  <ThemePreview palette={{ ...variant(palette, true), name: 'Dark preview' }} />
</div>
          <section className="panel export" aria-labelledby="export-heading">
            <h2 id="export-heading">Export palette</h2>
            <p>{format === 'CyberStudios JSON' ? 'Open this file in CloudTerminal to preview your theme.' : 'Download your palette in the selected format.'}</p>
            <div className="export-controls">
              <label className="select-field"><span>Format</span><select aria-label="Format" value={format} onChange={event => setFormat(event.target.value as Format)}>
                {formats.map(item => <option key={item}>{item}</option>)}
              </select></label>
              <button type="button" className="primary" onClick={exportPalette}>Download</button>
            </div>
            <div className="file-status" role="status">{message}</div>
          </section>
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);

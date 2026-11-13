import { Field } from './Field';
import { hexPattern, type Swatch } from '../themes/palette';

interface Props {
  color: Swatch;
  index: number;
  locked: boolean;
  canRemove: boolean;
  canMoveRight: boolean;
  onEdit: (field: 'name' | 'hex', value: string) => void;
  onMove: (direction: -1 | 1) => void;
  onLock: () => void;
  onRemove: () => void;
}

export function SwatchCard({ color, index, locked, canRemove, canMoveRight, onEdit, onMove, onLock, onRemove }: Props) {
  const number = index + 1;
  return (
    <li className="swatch">
      <label className="swatch-color" style={{ backgroundColor: color.hex }}>
        <span aria-hidden="true">Edit color</span>
        <input type="color" aria-label={`Choose swatch ${number} color`} value={color.hex} onChange={event => onEdit('hex', event.target.value.toUpperCase())} />
      </label>
      <div className="swatch-details">
        <Field label={`Swatch ${number} name`} value={color.name} maxLength={120} onCommit={value => onEdit('name', value)} />
        <Field label={`Swatch ${number} hex`} className="hex" value={color.hex} maxLength={7} valid={text => hexPattern.test(text)} onCommit={value => onEdit('hex', value.toUpperCase())} />
        <div className="swatch-actions">
          <button className="small" type="button" aria-pressed={locked} aria-label={`Lock swatch ${number}`} onClick={onLock}>{locked ? 'Locked' : 'Lock'}</button>
          <button className="small" type="button" aria-label={`Move swatch ${number} left`} disabled={!index} onClick={() => onMove(-1)}>←</button>
          <button className="small" type="button" aria-label={`Move swatch ${number} right`} disabled={!canMoveRight} onClick={() => onMove(1)}>→</button>
          <button className="small" type="button" aria-label={`Remove swatch ${number}`} disabled={!canRemove || locked} onClick={onRemove}>×</button>
        </div>
      </div>
    </li>
  );
}

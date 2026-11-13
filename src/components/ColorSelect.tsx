import type { Swatch } from '../themes/palette';

interface Props {
  label: string;
  value: string;
  colors: Swatch[];
  onChange: (id: string) => void;
  optional?: boolean;
}

export function ColorSelect({ label, value, colors, onChange, optional }: Props) {
  return (
    <label className="select-field">
      <span>{label}</span>
      <select aria-label={label} value={value} onChange={event => onChange(event.target.value)}>
        {optional && <option value="">Automatic</option>}
        {colors.map(({ id, name, hex }) => <option key={id} value={id}>{name} · {hex}</option>)}
      </select>
    </label>
  );
}

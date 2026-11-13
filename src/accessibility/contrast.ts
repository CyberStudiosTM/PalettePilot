import { hexToRgb, toLinear } from '../color-engine/srgb';

function luminance(hex: string): number {
  const [red, green, blue] = hexToRgb(hex).map(toLinear);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export const contrastCriteria = [
  { label: 'AA normal', minimum: 4.5 },
  { label: 'AAA normal', minimum: 7 },
  { label: 'AA large', minimum: 3 },
  { label: 'AAA large', minimum: 4.5 },
] as const;

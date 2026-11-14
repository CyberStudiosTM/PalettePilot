import { contrastRatio } from './contrast';
import { mapToSrgb, toOklch } from '../color-engine/harmony';

export function repairContrast(foreground: string, background: string, minimum: number) {
  if (contrastRatio(foreground, background) >= minimum) return foreground;
  const base = toOklch(foreground);
  let best: { hex: string; distance: number } | undefined;
  for (let step = 0; step <= 200; step++) {
    const lightness = step / 200;
    const distance = Math.abs(lightness - base.lightness);
    if (best && distance >= best.distance) continue;
    const hex = mapToSrgb({ ...base, lightness });
    if (contrastRatio(hex, background) >= minimum) best = { hex, distance };
  }
  return best?.hex;
}

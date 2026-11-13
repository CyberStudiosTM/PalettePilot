import { hexToRgb, toHex, toLinear, type RGB } from './srgb';

interface Oklch { lightness: number; chroma: number; hue: number }

export const harmonies = ['Complementary', 'Analogous', 'Triadic', 'Monochromatic'] as const;
export type Harmony = typeof harmonies[number];

export function toOklch(hex: string): Oklch {
  const [red, green, blue] = hexToRgb(hex).map(toLinear);
  // Direct sRGB matrices from the original Oklab definition by Björn Ottosson.
  const l = Math.cbrt(0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue);
  const m = Math.cbrt(0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue);
  const s = Math.cbrt(0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue);
  const lightness = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const b = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  const chroma = Math.hypot(a, b);
  const hue = chroma < 1e-6 ? 0 : (Math.atan2(b, a) * 180 / Math.PI + 360) % 360;
  return { lightness, chroma, hue };
}

function linearRgb({ lightness, chroma, hue }: Oklch): RGB {
  const radians = hue / 180 * Math.PI;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [
     4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

export function mapToSrgb(color: Oklch): string {
  const inGamut = (rgb: RGB) => rgb.every(channel => channel >= -1e-7 && channel <= 1 + 1e-7);
  const lightness = Math.max(0, Math.min(1, color.lightness));
  const rgbAt = (chroma: number) => linearRgb({ ...color, lightness, chroma });
  const original = rgbAt(color.chroma);
  if (inGamut(original)) return toHex(original);

  // Preserve hue and lightness while reducing chroma until the color fits sRGB.
  let low = 0;
  let high = color.chroma;
  for (let step = 0; step < 24; step++) {
    const middle = (low + high) / 2;
    if (inGamut(rgbAt(middle))) low = middle;
    else high = middle;
  }
  return toHex(rgbAt(low));
}

const offsets: Record<Harmony, readonly number[]> = {
  Complementary: [180, 0],
  Analogous: [-30, 30, -60, 60, 0],
  Triadic: [120, 240, 0],
  Monochromatic: [0],
};

export function harmonyColor(base: Oklch, mode: Harmony, offset: number, count: number): string {
  const hues = offsets[mode];
  const progress = count <= 1 ? 0.5 : offset / (count - 1);
  const target = mode === 'Monochromatic'
    ? 0.23 + 0.68 * (count === 1 ? (base.lightness > 0.56 ? 0.2 : 0.8) : progress)
    : Math.max(0.35, Math.min(0.88, base.lightness + (progress - 0.5) * 0.26));
  return mapToSrgb({ lightness: target, chroma: base.chroma, hue: base.hue + hues[offset % hues.length] });
}

export type RGB = [number, number, number];

export function hexToRgb(hex: string): RGB {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

export function toLinear(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function toHex(rgb: RGB): string {
  const encode = (value: number) => {
    const clamped = Math.max(0, Math.min(1, value));
    const channel = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
    return Math.round(channel * 255).toString(16).padStart(2, '0');
  };
  return ('#' + rgb.map(encode).join('')).toUpperCase();
}

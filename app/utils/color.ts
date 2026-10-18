export const BLACK = "#000000";
export const WHITE = "#ffffff";

function parseHex(color: string): [number, number, number] | null {
  const hex = color.trim().replace(/^#/, "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  if (!/^[0-9a-f]{6}$/i.test(full)) return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function relativeLuminance(color: string): number | null {
  const rgb = parseHex(color);
  if (!rgb) return null;
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = channel(rgb[0]);
  const g = channel(rgb[1]);
  const b = channel(rgb[2]);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colours, 1 (identical) to 21 (black on white). */
export function getContrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  if (la === null || lb === null) return 1;
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Picks whichever of black or white is more legible on a background, by WCAG
 * contrast ratio.
 *
 * Only needed for long-distance lines: their bright yellow is unreadable with
 * the usual white foreground. Every other line colour carries white officially,
 * so it is used directly rather than measured.
 */
export function getReadableTextColor(background: string): string {
  return getContrastRatio(background, BLACK) >= getContrastRatio(background, WHITE)
    ? BLACK
    : WHITE;
}
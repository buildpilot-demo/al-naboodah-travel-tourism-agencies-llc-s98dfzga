import type { SitePalette } from "./types/site-config";

// Applies site.config.ts's palette as CSS custom properties on the root
// element, overriding styles.css's defaults. Called once at startup
// (main.tsx) so every customer site gets its own colors from config alone —
// no per-customer CSS edits required.
//
// Palettes come from config and may be light or dark, so the derived
// properties below (`color-scheme`, `--color-accent-ink` for accent-colored
// text, `--color-on-accent` for text on an accent fill) are computed from
// the palette's own luminance to keep text at WCAG AA contrast either way.

const AA_CONTRAST = 4.5;

function parseHex(hex: string): [number, number, number] {
  const value = hex.trim().replace("#", "");
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
  return [
    Number.parseInt(full.slice(0, 2), 16),
    Number.parseInt(full.slice(2, 4), 16),
    Number.parseInt(full.slice(4, 6), 16),
  ];
}

function toHex(rgb: [number, number, number]): string {
  return `#${rgb.map((channel) => Math.round(Math.min(255, Math.max(0, channel))).toString(16).padStart(2, "0")).join("")}`;
}

function relativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(a: number, b: number): number {
  const [lighter, darker] = a > b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
}

function mix(rgb: [number, number, number], target: [number, number, number], amount: number): [number, number, number] {
  return [
    rgb[0] + (target[0] - rgb[0]) * amount,
    rgb[1] + (target[1] - rgb[1]) * amount,
    rgb[2] + (target[2] - rgb[2]) * amount,
  ];
}

/** Darkens/lightens `color` just enough to read at AA contrast on `background`. */
function readableOn(color: string, background: string): string {
  const base = parseHex(color);
  const backgroundLuminance = relativeLuminance(parseHex(background));
  if (contrastRatio(relativeLuminance(base), backgroundLuminance) >= AA_CONTRAST) return color;
  const target: [number, number, number] = backgroundLuminance > 0.5 ? [0, 0, 0] : [255, 255, 255];
  for (let amount = 0.05; amount <= 1; amount += 0.05) {
    const candidate = mix(base, target, amount);
    if (contrastRatio(relativeLuminance(candidate), backgroundLuminance) >= AA_CONTRAST) return toHex(candidate);
  }
  return toHex(target);
}

/** Picks the palette's text color or its inverse for legible text on `fill`. */
function textOn(fill: string, text: string): string {
  const fillLuminance = relativeLuminance(parseHex(fill));
  const textLuminance = relativeLuminance(parseHex(text));
  const inverse = textLuminance > 0.5 ? "#111111" : "#ffffff";
  if (contrastRatio(textLuminance, fillLuminance) >= AA_CONTRAST) return text;
  return contrastRatio(relativeLuminance(parseHex(inverse)), fillLuminance) >= contrastRatio(textLuminance, fillLuminance)
    ? inverse
    : text;
}

export function applyTheme(palette: SitePalette): void {
  const root = document.documentElement.style;
  root.setProperty("--color-background", palette.background);
  root.setProperty("--color-surface", palette.surface);
  root.setProperty("--color-text", palette.text);
  root.setProperty("--color-muted", palette.muted);
  root.setProperty("--color-accent", palette.accent);
  root.setProperty("--color-accent-hover", palette.accentHover);

  root.setProperty("--color-accent-ink", readableOn(palette.accent, palette.background));
  root.setProperty("--color-accent-ink-surface", readableOn(palette.accent, palette.surface));
  root.setProperty("--color-on-accent", textOn(palette.accent, palette.text));
  root.setProperty("--color-danger", readableOn("#f87171", palette.surface));
  root.setProperty("--color-success", readableOn("#4ade80", palette.surface));
  root.setProperty("color-scheme", relativeLuminance(parseHex(palette.background)) > 0.5 ? "light" : "dark");
}

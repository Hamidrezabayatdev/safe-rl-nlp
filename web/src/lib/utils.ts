import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, de-duplicating conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Localize a {en, fa} object. Falls back to the other language, then "". */
export function loc(obj: { en?: string; fa?: string } | undefined, lang: "en" | "fa"): string {
  if (!obj) return "";
  return obj[lang] || obj[lang === "fa" ? "en" : "fa"] || "";
}

/** Compact numeric formatter for metrics (4 significant figures). */
export function fmt(value: number | null | undefined, sig = 4): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1e-4 && abs < 1e6) {
    return Number(value.toPrecision(sig)).toString();
  }
  return value.toExponential(2);
}

/** Format a duration given in seconds as milliseconds. */
export function fmtMs(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return "—";
  return `${(seconds * 1000).toFixed(1)} ms`;
}

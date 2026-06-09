/**
 * Concrete chart colors (not CSS vars): SVG presentation attributes don't
 * resolve var(), so we pick a hex palette per resolved theme.
 */
export const CHART_COLORS = {
  light: ["#2563eb", "#ea7a0c", "#1f9d57", "#db2777", "#7c3aed"],
  dark: ["#5aa2f5", "#f59e42", "#3ecf7f", "#f472b6", "#a78bfa"],
} as const;

export const HAZARD_COLOR = { light: "#dc2626", dark: "#f87171" } as const;
export const GOAL_COLOR = { light: "#1f9d57", dark: "#3ecf7f" } as const;
export const START_COLOR = { light: "#334155", dark: "#cbd5e1" } as const;

export function methodColor(index: number, resolved: "light" | "dark"): string {
  return CHART_COLORS[resolved][index % CHART_COLORS[resolved].length];
}

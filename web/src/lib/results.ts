import rawResults from "@/data/results.json";
import type { MethodResult, Results, Scenario } from "@/types";

import { parseResults } from "./schema";

export { parseResults };

/** The committed artifact, imported as a module (Vite parses it at build time). */
export const defaultRaw: unknown = rawResults;

export function firstScenarioId(r: Results): string | undefined {
  return r.scenarios[0]?.id;
}

export function getScenario(r: Results, id: string): Scenario | undefined {
  return r.scenarios.find((s) => s.id === id);
}

export function lagrangianVariants(s: Scenario): MethodResult[] {
  return s.results.filter((m) => m.family === "lagrangian");
}

export function sqpResult(s: Scenario): MethodResult | undefined {
  return s.results.find((m) => m.family === "sqp");
}

export function methodByName(s: Scenario, name: string): MethodResult | undefined {
  return s.results.find((m) => m.name === name);
}

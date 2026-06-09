import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { Results, Scenario } from "@/types";

import { defaultRaw, firstScenarioId, getScenario, parseResults } from "./results";

interface DataContextValue {
  ok: boolean;
  error: string | null;
  results: Results | null;
  scenarioId: string | null;
  setScenarioId: (id: string) => void;
  scenario: Scenario | null;
}

const DataContext = createContext<DataContextValue | null>(null);

/**
 * Parses + validates the artifact once and exposes the current scenario.
 * `raw` is overridable so tests can inject the sample fixture or a malformed
 * artifact to exercise the graceful-degradation path.
 */
export function DataProvider({
  children,
  raw = defaultRaw,
}: {
  children: ReactNode;
  raw?: unknown;
}) {
  const parsed = useMemo(() => parseResults(raw), [raw]);
  const results = parsed.ok ? parsed.data : null;

  const [scenarioId, setScenarioId] = useState<string | null>(
    results ? (firstScenarioId(results) ?? null) : null,
  );

  const scenario =
    results && scenarioId ? (getScenario(results, scenarioId) ?? null) : null;

  const value = useMemo<DataContextValue>(
    () => ({
      ok: parsed.ok,
      error: parsed.ok ? null : parsed.error,
      results,
      scenarioId,
      setScenarioId,
      scenario,
    }),
    [parsed, results, scenarioId, scenario],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

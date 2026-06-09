import { describe, expect, it } from "vitest";

import realResults from "@/data/results.json";
import { parseResults } from "@/lib/schema";

/**
 * Integration: the REAL artifact emitted by the Python runner must satisfy the
 * zod contract and the cross-field invariants. Catches camelCase / shape drift
 * between backend/contract.py and web/src/lib/schema.ts.
 */
describe("results.json contract integration", () => {
  const parsed = parseResults(realResults);

  it("parses against the zod schema", () => {
    expect(parsed.ok).toBe(true);
  });

  it("has the expected scenarios and methods", () => {
    if (!parsed.ok) throw new Error(parsed.error);
    const { meta, scenarios } = parsed.data;
    expect(meta.schemaVersion).toBe(1);
    expect(scenarios.length).toBeGreaterThanOrEqual(3);
    expect(meta.methods.length).toBeGreaterThanOrEqual(3);
  });

  it("satisfies cross-field invariants for every method", () => {
    if (!parsed.ok) throw new Error(parsed.error);
    for (const sc of parsed.data.scenarios) {
      const m = sc.problem.numConstraints;
      expect(sc.problem.numVars).toBe(2 * sc.problem.T);
      for (const res of sc.results) {
        expect(res.constraintValues.length).toBe(m);
        expect(res.constraintLabels.length).toBe(m);
        expect(res.trajectory.length).toBe(sc.problem.T + 1);
        if (res.multipliers) {
          expect(res.multipliers.length).toBe(m);
          res.multipliers.forEach((mult, i) => expect(mult.index).toBe(i));
        }
        if (res.kkt) {
          expect(res.kkt.primalFeasibility).toBeCloseTo(res.maxViolation, 12);
        }
        // terminal control is null
        const last = res.trajectory[res.trajectory.length - 1];
        if (last) expect(last.ax).toBeNull();
      }
    }
  });
});

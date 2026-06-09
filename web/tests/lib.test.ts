import { describe, expect, it } from "vitest";

import sample from "@/data/results.sample.json";
import { en } from "@/i18n/en";
import { fa } from "@/i18n/fa";
import { buildConclusion, pickWinner } from "@/lib/export-templates";
import { classifyResidual, feasibilityState, kktResidualState } from "@/lib/feasibility";
import { sampleCircle } from "@/lib/geometry";
import { parseResults } from "@/lib/schema";
import { fmt } from "@/lib/utils";
import type { Scenario } from "@/types";

function sampleScenario(): Scenario {
  const parsed = parseResults(sample);
  if (!parsed.ok) throw new Error("sample fixture must parse");
  return parsed.data.scenarios[0];
}

describe("feasibility classification", () => {
  it("is good exactly at the tolerance", () => {
    expect(feasibilityState(1e-6, 1e-6)).toBe("good");
  });
  it("is marginal within 10x tolerance", () => {
    expect(classifyResidual(5e-6, 1e-6)).toBe("marginal");
  });
  it("is bad beyond 10x tolerance", () => {
    expect(classifyResidual(1e-3, 1e-6)).toBe("bad");
  });
  it("treats KKT residuals as approximately satisfied within 100x", () => {
    expect(kktResidualState(5e-3, 1e-2)).toBe("good");
    expect(kktResidualState(0.5, 1e-2)).toBe("marginal");
    expect(kktResidualState(50, 1e-2)).toBe("bad");
  });
});

describe("sampleCircle", () => {
  it("returns n+1 closed points all at radius r", () => {
    const pts = sampleCircle(0, 0, 2, 16);
    expect(pts).toHaveLength(17);
    expect(pts[0].x).toBeCloseTo(pts[16].x);
    expect(pts[0].y).toBeCloseTo(pts[16].y);
    for (const p of pts) expect(Math.hypot(p.x, p.y)).toBeCloseTo(2);
  });
});

describe("parseResults", () => {
  it("accepts the sample fixture", () => {
    expect(parseResults(sample).ok).toBe(true);
  });
  it("accepts a minimal valid artifact", () => {
    expect(parseResults({ meta: { schemaVersion: 1 }, scenarios: [] }).ok).toBe(true);
  });
  it("rejects a malformed artifact without throwing", () => {
    const r = parseResults({ nonsense: true });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(typeof r.error).toBe("string");
  });
});

describe("pickWinner", () => {
  it("returns a feasible method for the sample", () => {
    const winner = pickWinner(sampleScenario());
    expect(winner).not.toBeNull();
    expect(winner?.feasible).toBe(true);
  });

  it("never lets an infeasible-but-lower-objective method win", () => {
    const sc = sampleScenario();
    // craft: an infeasible method with a much lower objective
    const trap = { ...sc.results[0], name: "Trap", feasible: false, maxViolation: 5, objective: -999 };
    const rigged: Scenario = { ...sc, results: [trap, ...sc.results] };
    const winner = pickWinner(rigged);
    expect(winner?.name).not.toBe("Trap");
    expect(winner?.feasible).toBe(true);
  });
});

describe("buildConclusion", () => {
  it("names the winner and differs by language", () => {
    const sc = sampleScenario();
    const winner = pickWinner(sc);
    const enText = buildConclusion(sc, "en", en);
    const faText = buildConclusion(sc, "fa", fa);
    expect(enText).not.toEqual(faText);
    expect(enText).toContain("performed better");
    expect(faText).toContain("بهتر عمل کرد");
    if (winner) expect(enText).toContain(winner.label.en);
  });
});

describe("fmt", () => {
  it("formats zero, small and large numbers", () => {
    expect(fmt(0)).toBe("0");
    expect(fmt(null)).toBe("—");
    expect(fmt(1234.5678)).toBe("1235");
    expect(fmt(1e-9)).toContain("e");
  });
});

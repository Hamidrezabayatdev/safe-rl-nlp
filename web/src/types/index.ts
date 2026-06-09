import type { z } from "zod";
import type {
  LocSchema,
  Vec2Schema,
  HazardSchema,
  ProblemBlockSchema,
  TrajectoryPointSchema,
  ConvergencePointSchema,
  MultiplierSchema,
  KktSchema,
  MethodFamilySchema,
  MethodResultSchema,
  ComparisonMetricSchema,
  ComparisonBestSchema,
  ComparisonBlockSchema,
  ScenarioSchema,
  MetaSchema,
  ResultsSchema,
} from "@/lib/schema";

/**
 * Canonical app types. Inferred from the zod schemas so they cannot drift from
 * the runtime validator or the Python contract.
 */
export type Loc = z.infer<typeof LocSchema>;
export type Vec2 = z.infer<typeof Vec2Schema>;
export type Hazard = z.infer<typeof HazardSchema>;
export type ProblemBlock = z.infer<typeof ProblemBlockSchema>;
export type TrajectoryPoint = z.infer<typeof TrajectoryPointSchema>;
export type ConvergencePoint = z.infer<typeof ConvergencePointSchema>;
export type Multiplier = z.infer<typeof MultiplierSchema>;
export type Kkt = z.infer<typeof KktSchema>;
export type MethodFamily = z.infer<typeof MethodFamilySchema>;
export type MethodResult = z.infer<typeof MethodResultSchema>;
export type ComparisonMetric = z.infer<typeof ComparisonMetricSchema>;
export type ComparisonBest = z.infer<typeof ComparisonBestSchema>;
export type ComparisonBlock = z.infer<typeof ComparisonBlockSchema>;
export type Scenario = z.infer<typeof ScenarioSchema>;
export type Meta = z.infer<typeof MetaSchema>;
export type Results = z.infer<typeof ResultsSchema>;

export type Lang = "en" | "fa";

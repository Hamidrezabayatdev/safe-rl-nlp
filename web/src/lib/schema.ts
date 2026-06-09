import { z } from "zod";

/**
 * Single source of truth for the results.json contract.
 *
 * The Python experiment runner (backend/src/safe_rl_nlp/contract.py) MUST emit
 * exactly these camelCase keys. TypeScript types are inferred from these zod
 * schemas (see types.ts), so the UI and the validator can never drift.
 *
 * Schemas are intentionally tolerant (.nullable / .default / .catch) so that a
 * partially-populated or slightly-stale artifact degrades gracefully in the UI
 * instead of white-screening.
 */

export const CURRENT_SCHEMA_VERSION = 1;

/** A bilingual string. Falls back to "" if a side is missing. */
export const LocSchema = z.object({
  en: z.string().catch(""),
  fa: z.string().catch(""),
});

export const Vec2Schema = z.object({
  x: z.number(),
  y: z.number(),
});

export const HazardSchema = z.object({
  cx: z.number(),
  cy: z.number(),
  R: z.number(),
});

export const ProblemBlockSchema = z.object({
  T: z.number().int(),
  dt: z.number(),
  s0: z.array(z.number()).length(4), // [x, y, vx, vy]
  goal: Vec2Schema,
  hazard: HazardSchema,
  vMax: z.number(),
  eMax: z.number(),
  aMin: z.number(),
  aMax: z.number(),
  alpha: z.number(),
  numVars: z.number().int(), // 2T
  numConstraints: z.number().int(), // 2T + 1 (box bounds excluded)
  initialGuess: z.array(z.number()).default([]),
  bounds: z.array(z.tuple([z.number(), z.number()])).default([]),
});

/** ax/ay are null at the terminal step t = T (no control applied there). */
export const TrajectoryPointSchema = z.object({
  t: z.number().int(),
  x: z.number(),
  y: z.number(),
  vx: z.number(),
  vy: z.number(),
  ax: z.number().nullable().default(null),
  ay: z.number().nullable().default(null),
});

export const ConvergencePointSchema = z.object({
  iter: z.number().int(),
  objective: z.number(),
  maxViolation: z.number(),
});

export const MultiplierSchema = z.object({
  index: z.number().int(),
  label: LocSchema,
  value: z.number(),
});

export const KktSchema = z.object({
  stationarity: z.number(),
  primalFeasibility: z.number(),
  dualFeasibility: z.number(),
  complementarySlackness: z.number(),
  satisfied: z.boolean(),
});

export const MethodFamilySchema = z.enum(["lagrangian", "sqp"]);

export const MethodResultSchema = z.object({
  name: z.string(),
  label: LocSchema,
  family: MethodFamilySchema,
  success: z.boolean(),
  message: z.string().catch(""),
  xStar: z.array(z.number()).default([]),
  trajectory: z.array(TrajectoryPointSchema).default([]),
  objective: z.number(),
  constraintValues: z.array(z.number()).default([]),
  constraintLabels: z.array(LocSchema).default([]),
  maxViolation: z.number(),
  numSatisfied: z.number().int().default(0),
  numActive: z.number().int().default(0),
  iterations: z.number().int().nullable().default(null),
  runtimeS: z.number().default(0),
  convergence: z.array(ConvergencePointSchema).default([]),
  multipliers: z.array(MultiplierSchema).nullable().default(null),
  feasible: z.boolean(),
  kkt: KktSchema.nullable().default(null),
});

export const ComparisonMetricSchema = z.object({
  /** machine key, e.g. "objective" | "maxViolation" | "runtime" | "iterations" | "feasible" | "status" */
  key: z.string(),
  label: LocSchema,
  /** per-method display value, keyed by method name */
  values: z.record(z.string(), z.string()),
  interpretation: LocSchema,
});

export const ComparisonBestSchema = z.object({
  objective: z.string().nullable().default(null), // method name of best FEASIBLE objective
  feasibility: z.string().nullable().default(null),
  fastest: z.string().nullable().default(null),
  fewestIterations: z.string().nullable().default(null),
});

export const ComparisonBlockSchema = z.object({
  metrics: z.array(ComparisonMetricSchema).default([]),
  best: ComparisonBestSchema.default({
    objective: null,
    feasibility: null,
    fastest: null,
    fewestIterations: null,
  }),
  summary: LocSchema,
});

export const ScenarioSchema = z.object({
  id: z.string(),
  label: LocSchema,
  description: LocSchema,
  problem: ProblemBlockSchema,
  results: z.array(MethodResultSchema).default([]),
  comparison: ComparisonBlockSchema,
});

export const GeneratorSchema = z.object({
  script: z.string().catch(""),
  python: z.string().catch(""),
  scipy: z.string().catch(""),
  numpy: z.string().catch(""),
});

export const MetaSchema = z.object({
  schemaVersion: z.number().int(),
  generatedAt: z.string().catch(""),
  generator: GeneratorSchema.default({
    script: "",
    python: "",
    scipy: "",
    numpy: "",
  }),
  feasibilityTolerance: z.number().default(1e-6),
  kktTolerance: z.number().default(1e-3),
  methods: z.array(z.string()).default([]),
  scenarioIds: z.array(z.string()).default([]),
});

export const ResultsSchema = z.object({
  meta: MetaSchema,
  scenarios: z.array(ScenarioSchema).default([]),
});

/**
 * Parse + validate a raw artifact. Never throws: returns a discriminated union
 * so the UI can render an Alert + skeletons instead of crashing.
 */
export type ParseOk = { ok: true; data: z.infer<typeof ResultsSchema> };
export type ParseErr = { ok: false; error: string };

export function parseResults(raw: unknown): ParseOk | ParseErr {
  const result = ResultsSchema.safeParse(raw);
  if (result.success) {
    return { ok: true, data: result.data };
  }
  return { ok: false, error: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
}

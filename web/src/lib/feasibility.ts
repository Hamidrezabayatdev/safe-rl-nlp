/** Tri-state feasibility/quality classification for badges. */
export type FeasState = "good" | "marginal" | "bad";

/** Classify a residual against a tolerance: <=tol good, <=10*tol marginal, else bad. */
export function classifyResidual(value: number, tol: number): FeasState {
  if (value <= tol) return "good";
  if (value <= 10 * tol) return "marginal";
  return "bad";
}

/** Feasibility from a max-violation value vs the feasibility tolerance. */
export function feasibilityState(maxViolation: number, tol: number): FeasState {
  return classifyResidual(maxViolation, tol);
}

/** KKT residual quality: good within tol, marginal within 100x (approx. KKT), else bad. */
export function kktResidualState(value: number, tol: number): FeasState {
  if (value <= tol) return "good";
  if (value <= 100 * tol) return "marginal";
  return "bad";
}

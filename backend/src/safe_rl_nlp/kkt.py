"""KKT residuals for the control-only, all-inequality NLP.

For  min J(x)  s.t.  g_i(x) <= 0,  a_min <= x <= a_max,  the Lagrangian is
L = J + sum_i lambda_i g_i  with lambda >= 0. The four KKT conditions and the
residual we report for each:

1. Stationarity          grad J + J_g^T lambda = 0  (projected at active bounds)
2. Primal feasibility    g_i <= 0                    -> max(0, max g_i)
3. Dual feasibility      lambda_i >= 0               -> max(0, -min lambda)
4. Complementary slack.  lambda_i g_i = 0            -> max_i |lambda_i g_i|

The same function is used for every solver so the comparison is uniform.
"""

from __future__ import annotations

import numpy as np

from .gradients import grad, jacobian
from .problem import NLProblem


def _projected_stationarity(
    r: np.ndarray, x: np.ndarray, lo: float, hi: float, bound_tol: float
) -> float:
    """Inf-norm of the stationarity residual, accounting for active box bounds.

    At an active lower bound a nonnegative component is absorbed by the bound's
    own multiplier (and vice-versa at the upper bound); only the part that would
    still reduce the objective into the feasible interior counts as a residual.
    """
    proj = r.copy()
    at_lo = x <= lo + bound_tol
    at_hi = x >= hi - bound_tol
    proj[at_lo] = np.minimum(proj[at_lo], 0.0)
    proj[at_hi] = np.maximum(proj[at_hi], 0.0)
    # interior components keep their value
    return float(np.max(np.abs(proj))) if proj.size else 0.0


def kkt_residuals(
    problem: NLProblem,
    u: np.ndarray,
    lam: np.ndarray,
    feas_tol: float = 1e-6,
    kkt_tol: float = 1e-3,
    bound_tol: float = 1e-7,
) -> dict[str, float | bool]:
    """Compute the four KKT residuals and an overall satisfied flag."""
    u = np.asarray(u, dtype=float)
    lam = np.asarray(lam, dtype=float)

    gJ = grad(problem.objective, u)
    Jg = jacobian(problem.constraints, u)  # (m, n)
    r = gJ + Jg.T @ lam

    stationarity = _projected_stationarity(
        r, u, problem.p.a_min, problem.p.a_max, bound_tol
    )
    g = problem.constraints(u)
    primal = float(max(0.0, np.max(g)))
    dual = float(max(0.0, -np.min(lam))) if lam.size else 0.0
    comp = float(np.max(np.abs(lam * g))) if lam.size else 0.0

    satisfied = (
        stationarity <= kkt_tol
        and primal <= feas_tol
        and dual <= kkt_tol
        and comp <= kkt_tol
    )

    return {
        "stationarity": stationarity,
        "primalFeasibility": primal,
        "dualFeasibility": dual,
        "complementarySlackness": comp,
        "satisfied": bool(satisfied),
    }

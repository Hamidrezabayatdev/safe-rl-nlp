"""Augmented Lagrangian method (Powell-Hestenes-Rockafellar) for inequalities.

For g_i(x) <= 0 with multipliers lambda_i >= 0 and penalty rho, the augmented
Lagrangian is

    A(x; lambda, rho) = J(x) + (1/2rho) * sum_i [ max(0, lambda_i + rho g_i)^2 - lambda_i^2 ]

Outer loop: minimize A over the control box bounds (L-BFGS-B), then update
    lambda_i <- max(0, lambda_i + rho g_i(x))           (auto-enforces lambda >= 0)
and grow rho only when the max violation fails to shrink. This is the primary
primary Lagrangian solver: robust on the non-convex hazard, with multiplier
estimates that converge cleanly and feed straight into the KKT analysis.
"""

from __future__ import annotations

import time

import numpy as np
from scipy.optimize import minimize

from ..problem import NLProblem
from ..result import SolveResult
from .base import FEAS_TOL, finalize

NAME = "Augmented Lagrangian"
LABEL = {"en": "Augmented Lagrangian", "fa": "لاگرانژین تقویت‌شده"}


def solve(
    problem: NLProblem,
    rho0: float = 10.0,
    gamma: float = 5.0,
    rho_max: float = 1e8,
    max_outer: int = 50,
    inner_maxiter: int = 200,
    feas_tol: float = FEAS_TOL,
    tol: float = 1e-8,
) -> SolveResult:
    bounds = problem.bounds()
    u = problem.initial_guess().astype(float)
    lam = np.zeros(problem.n_constraints, dtype=float)
    rho = float(rho0)

    history: list[tuple[int, float, float]] = []
    prev_viol = np.inf
    success = False
    message = "max outer iterations reached"

    t0 = time.perf_counter()
    try:
        for k in range(max_outer):

            def aug(uu: np.ndarray, lam=lam, rho=rho) -> float:
                g = problem.constraints(uu)
                t = lam + rho * g
                psi = (np.where(t > 0.0, t * t, 0.0) - lam * lam) / (2.0 * rho)
                return float(problem.objective(uu) + np.sum(psi))

            res = minimize(
                aug, u, method="L-BFGS-B", bounds=bounds,
                options={"maxiter": inner_maxiter, "ftol": 1e-12, "gtol": 1e-9},
            )
            u_new = np.asarray(res.x, dtype=float)

            g = problem.constraints(u_new)
            viol = float(max(0.0, np.max(g)))
            history.append((k, problem.objective(u_new), viol))

            step = float(np.max(np.abs(u_new - u)))
            u = u_new

            # multiplier update (Hestenes-Powell-Rockafellar)
            lam = np.maximum(0.0, lam + rho * g)

            if viol <= feas_tol and step <= tol:
                success = True
                message = "converged: feasible and stationary"
                break

            # grow penalty only when violation did not shrink enough
            if viol > 0.25 * prev_viol and rho < rho_max:
                rho = min(gamma * rho, rho_max)
            prev_viol = viol

        else:
            # exhausted outer loop; success iff finally feasible
            success = problem.max_violation(u) <= feas_tol
            if success:
                message = "feasible at iteration budget"
        runtime = time.perf_counter() - t0
        iterations = len(history)
    except Exception as exc:
        runtime = time.perf_counter() - t0
        success = False
        message = f"augmented Lagrangian raised: {exc}"
        iterations = len(history)

    if not history:
        history.append((0, problem.objective(u), problem.max_violation(u)))

    return finalize(
        problem,
        name=NAME,
        label=LABEL,
        family="lagrangian",
        success=success,
        message=message,
        u=u,
        multipliers=lam,
        iterations=iterations,
        runtime_s=runtime,
        convergence=history,
    )

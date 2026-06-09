"""Quadratic penalty method.

    P(x; mu) = J(x) + (mu/2) * sum_i max(0, g_i(x))^2

Minimize P over the box bounds, geometrically increase mu, repeat. The multiplier
estimate lambda_i ~= mu * max(0, g_i) only becomes accurate in the limit mu->inf,
which is exactly why the penalty method's dual feasibility / complementary
slackness are typically worse than the augmented Lagrangian's — a useful teaching
contrast in the dashboard.
"""

from __future__ import annotations

import time

import numpy as np
from scipy.optimize import minimize

from ..problem import NLProblem
from ..result import SolveResult
from .base import FEAS_TOL, finalize

NAME = "Quadratic Penalty"
LABEL = {"en": "Quadratic Penalty", "fa": "جریمه درجه‌دوم"}


def solve(
    problem: NLProblem,
    mu0: float = 10.0,
    gamma: float = 10.0,
    mu_max: float = 1e10,
    max_outer: int = 30,
    inner_maxiter: int = 200,
    feas_tol: float = FEAS_TOL,
    tol: float = 1e-8,
) -> SolveResult:
    bounds = problem.bounds()
    u = problem.initial_guess().astype(float)
    mu = float(mu0)

    history: list[tuple[int, float, float]] = []
    success = False
    message = "max outer iterations reached"

    t0 = time.perf_counter()
    try:
        for k in range(max_outer):

            def pen(uu: np.ndarray, mu=mu) -> float:
                g = problem.constraints(uu)
                viol = np.maximum(0.0, g)
                return float(problem.objective(uu) + 0.5 * mu * np.sum(viol * viol))

            res = minimize(
                pen, u, method="L-BFGS-B", bounds=bounds,
                options={"maxiter": inner_maxiter, "ftol": 1e-12, "gtol": 1e-9},
            )
            u_new = np.asarray(res.x, dtype=float)
            viol = problem.max_violation(u_new)
            history.append((k, problem.objective(u_new), viol))

            step = float(np.max(np.abs(u_new - u)))
            u = u_new

            if viol <= feas_tol and step <= tol:
                success = True
                message = "converged: feasible"
                break
            if mu < mu_max:
                mu = min(gamma * mu, mu_max)
        else:
            success = problem.max_violation(u) <= feas_tol
            if success:
                message = "feasible at iteration budget"
        runtime = time.perf_counter() - t0
        iterations = len(history)
    except Exception as exc:
        runtime = time.perf_counter() - t0
        success = False
        message = f"penalty method raised: {exc}"
        iterations = len(history)

    if not history:
        history.append((0, problem.objective(u), problem.max_violation(u)))

    # penalty multiplier estimate lambda ~= mu * max(0, g)
    g_final = problem.constraints(u)
    multipliers = mu * np.maximum(0.0, g_final)

    return finalize(
        problem,
        name=NAME,
        label=LABEL,
        family="lagrangian",
        success=success,
        message=message,
        u=u,
        multipliers=multipliers,
        iterations=iterations,
        runtime_s=runtime,
        convergence=history,
    )

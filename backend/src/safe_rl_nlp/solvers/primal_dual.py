"""Primal-dual gradient method (optional, 'RL-flavored').

Gradient descent on the primal, ascent on the dual, of the plain Lagrangian
L = J + sum_i lambda_i g_i:

    u      <- clip(u - eta_u * (grad J + J_g^T lambda),  a_min, a_max)
    lambda <- max(0, lambda + eta_lambda * g(u))

Conceptually clean and close to constrained-RL updates, but on the non-convex
hazard constraint it can oscillate and is step-size sensitive. Disabled by
default in the experiment registry; enable with include_optional=True to show
the contrast.
"""

from __future__ import annotations

import time

import numpy as np

from ..gradients import grad, jacobian
from ..problem import NLProblem
from ..result import SolveResult
from .base import FEAS_TOL, finalize

NAME = "Primal-Dual"
LABEL = {"en": "Primal-Dual", "fa": "اولیه-دوگان"}


def solve(
    problem: NLProblem,
    eta_u: float = 1e-3,
    eta_lambda: float = 1e-2,
    max_iter: int = 2000,
    record_every: int = 20,
    feas_tol: float = FEAS_TOL,
    tol: float = 1e-7,
) -> SolveResult:
    lo, hi = problem.p.a_min, problem.p.a_max
    u = problem.initial_guess().astype(float)
    lam = np.zeros(problem.n_constraints, dtype=float)

    history: list[tuple[int, float, float]] = []
    success = False
    message = "max iterations reached"

    t0 = time.perf_counter()
    try:
        for k in range(max_iter):
            gJ = grad(problem.objective, u)
            Jg = jacobian(problem.constraints, u)
            gu = gJ + Jg.T @ lam
            u_new = np.clip(u - eta_u * gu, lo, hi)
            g = problem.constraints(u_new)
            lam = np.maximum(0.0, lam + eta_lambda * g)

            step = float(np.max(np.abs(u_new - u)))
            u = u_new

            if k % record_every == 0:
                history.append((k, problem.objective(u), problem.max_violation(u)))

            if problem.max_violation(u) <= feas_tol and step <= tol:
                success = True
                message = "converged: feasible and stationary"
                break
        else:
            success = problem.max_violation(u) <= feas_tol
            if success:
                message = "feasible at iteration budget"
        runtime = time.perf_counter() - t0
        iterations = k + 1
    except Exception as exc:
        runtime = time.perf_counter() - t0
        success = False
        message = f"primal-dual raised: {exc}"
        iterations = len(history) * record_every

    history.append((iterations, problem.objective(u), problem.max_violation(u)))

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

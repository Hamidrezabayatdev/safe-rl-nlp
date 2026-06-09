"""SQP via scipy SLSQP (Sequential Least-SQuares Programming).

At each iteration SLSQP forms a quadratic model of the Lagrangian and linearizes
the constraints into a QP subproblem, solves it for a step, and repeats. It is a
true, battle-tested SQP method — the SQP reference solver.
"""

from __future__ import annotations

import time

import numpy as np
from scipy.optimize import minimize

from ..problem import NLProblem
from ..result import SolveResult
from .base import finalize, recover_multipliers

NAME = "SQP (SLSQP)"
LABEL = {"en": "SQP (SLSQP)", "fa": "SQP (روش SLSQP)"}


def solve(problem: NLProblem, max_iter: int = 300, ftol: float = 1e-10) -> SolveResult:
    u0 = problem.initial_guess()

    # scipy inequality convention is c(x) >= 0; our standard form is g(x) <= 0,
    # so pass c = -g.
    constraints = [{"type": "ineq", "fun": lambda u: -problem.constraints(u)}]
    bounds = problem.bounds()

    history: list[tuple[int, float, float]] = []

    def callback(uk: np.ndarray) -> None:
        history.append(
            (len(history), problem.objective(uk), problem.max_violation(uk))
        )

    t0 = time.perf_counter()
    try:
        res = minimize(
            problem.objective,
            u0,
            method="SLSQP",
            bounds=bounds,
            constraints=constraints,
            callback=callback,
            options={"maxiter": max_iter, "ftol": ftol, "disp": False},
        )
        runtime = time.perf_counter() - t0
        u_star = np.asarray(res.x, dtype=float)
        success = bool(res.success)
        message = str(res.message)
        iterations = int(res.get("nit", len(history)))
    except Exception as exc:  # never abort the whole run on one solver
        runtime = time.perf_counter() - t0
        u_star = np.asarray(u0, dtype=float)
        success = False
        message = f"SLSQP raised: {exc}"
        iterations = len(history)

    # Always record a final history point so charts are never empty.
    history.append((len(history), problem.objective(u_star), problem.max_violation(u_star)))

    multipliers = recover_multipliers(problem, u_star)

    return finalize(
        problem,
        name=NAME,
        label=LABEL,
        family="sqp",
        success=success,
        message=message,
        u=u_star,
        multipliers=multipliers,
        iterations=iterations,
        runtime_s=runtime,
        convergence=history,
    )

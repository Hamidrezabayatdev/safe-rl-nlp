"""Shared helpers for all solvers: result finalization and multiplier recovery."""

from __future__ import annotations

import numpy as np
from scipy.optimize import nnls

from ..gradients import grad, jacobian
from ..kkt import kkt_residuals
from ..problem import NLProblem
from ..result import SolveResult

FEAS_TOL = 1e-6
KKT_TOL = 1e-2
ACTIVE_TOL = 1e-4
# Looser tol for multiplier recovery: a constraint sitting just inside its
# boundary still carries a multiplier, so stationarity is explained correctly.
RECOVERY_ACTIVE_TOL = 1e-3


def recover_multipliers(
    problem: NLProblem, u: np.ndarray, active_tol: float = RECOVERY_ACTIVE_TOL
) -> np.ndarray:
    """Estimate lambda >= 0 from a primal point via NNLS on the active set.

    Solves  min_{lambda>=0} || grad J + J_active^T lambda ||  over active
    constraints (those with g_i close to 0); inactive multipliers are 0. Used
    for solvers (e.g. SLSQP) that do not hand back clean constraint multipliers.
    """
    u = np.asarray(u, dtype=float)
    g = problem.constraints(u)
    m = g.size
    lam = np.zeros(m, dtype=float)
    active = np.where(np.abs(g) <= active_tol)[0]
    if active.size == 0:
        return lam
    gJ = grad(problem.objective, u)
    Jg = jacobian(problem.constraints, u)  # (m, n)
    A = Jg[active].T  # (n, n_active)
    b = -gJ  # want J_active^T lambda = -grad J
    sol, _ = nnls(A, b)
    lam[active] = sol
    return lam


def finalize(
    problem: NLProblem,
    *,
    name: str,
    label: dict[str, str],
    family: str,
    success: bool,
    message: str,
    u: np.ndarray,
    multipliers: np.ndarray | None,
    iterations: int | None,
    runtime_s: float,
    convergence: list[tuple[int, float, float]],
    feas_tol: float = FEAS_TOL,
    kkt_tol: float = KKT_TOL,
    compute_kkt: bool = True,
) -> SolveResult:
    """Compute all reported metrics + KKT for a final primal/dual point."""
    u = np.asarray(u, dtype=float)
    g = problem.constraints(u)
    max_violation = float(max(0.0, np.max(g)))
    feasible = max_violation <= feas_tol

    lam = multipliers
    if lam is None and compute_kkt:
        lam = recover_multipliers(problem, u)

    kkt = None
    if compute_kkt and lam is not None:
        kkt = kkt_residuals(problem, u, lam, feas_tol=feas_tol, kkt_tol=kkt_tol)

    return SolveResult(
        name=name,
        label=label,
        family=family,
        success=bool(success),
        message=message,
        u_star=u.copy(),
        objective=problem.objective(u),
        constraint_values=g,
        max_violation=max_violation,
        num_satisfied=problem.num_satisfied(u, feas_tol),
        num_active=problem.num_active(u, ACTIVE_TOL),
        runtime_s=float(runtime_s),
        feasible=feasible,
        iterations=iterations,
        convergence=convergence,
        multipliers=lam,
        kkt=kkt,
    )

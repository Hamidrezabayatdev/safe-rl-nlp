"""Test helpers: the canonical toy problem.

    minimize (v - 30)^2   subject to   v <= 20      =>   optimum v = 20

Exposes the same surface the solvers rely on, so AL / penalty / SLSQP / primal-
dual can run on it directly.
"""

from __future__ import annotations

from types import SimpleNamespace

import numpy as np


class ToyProblem:
    def __init__(self) -> None:
        self.n_vars = 1
        self.n_constraints = 1
        # effectively-unbounded box so v<=20 (not a bound) is the active constraint
        self.p = SimpleNamespace(a_min=-1e6, a_max=1e6, constraint_start=0)

    def objective(self, u) -> float:
        u = np.asarray(u, dtype=float)
        return float((u[0] - 30.0) ** 2)

    def constraints(self, u) -> np.ndarray:
        u = np.asarray(u, dtype=float)
        return np.array([u[0] - 20.0])  # v - 20 <= 0

    def max_violation(self, u) -> float:
        return float(max(0.0, np.max(self.constraints(u))))

    def is_feasible(self, u, tol: float = 1e-6) -> bool:
        return self.max_violation(u) <= tol

    def num_satisfied(self, u, tol: float = 1e-6) -> int:
        return int(np.sum(self.constraints(u) <= tol))

    def num_active(self, u, tol: float = 1e-4) -> int:
        return int(np.sum(np.abs(self.constraints(u)) <= tol))

    def bounds(self) -> list[tuple[float, float]]:
        return [(self.p.a_min, self.p.a_max)]

    def initial_guess(self) -> np.ndarray:
        return np.array([0.0])

    def trajectory(self, u) -> list:
        return []

    def constraint_labels(self) -> list[dict[str, str]]:
        return [{"en": "v <= 20", "fa": "v <= 20"}]

"""The Safe Drone Navigation NLP, control-only single-shooting.

Decision vector (length 2T), ordered to match the dashboard contract::

    x = [a_{x,0}, a_{y,0}, a_{x,1}, a_{y,1}, ..., a_{x,T-1}, a_{y,T-1}]

States s_t = [x, y, vx, vy] are NOT decision variables; they are rolled out from
the fixed initial state s_0 by Euler integration. Therefore the dynamics are
*substituted in*, not imposed as equality constraints — so this NLP has only
inequality constraints (lambda multipliers), no equality constraints (no mu).

All constraints are standardized to g_i(x) <= 0. Fixed ordering (so labels and
multipliers stay aligned across every solver):

    index 0           : energy            sum_t (ax^2 + ay^2) - E_max
    index 1 .. T      : speed   (t=1..T)  vx_t^2 + vy_t^2 - V_max^2
    index T+1 .. 2T   : hazard  (t=1..T)  R_h^2 - (x_t - x_h)^2 - (y_t - y_h)^2   (non-convex)

Box bounds a_min <= a <= a_max are handled separately (not part of g).
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np


@dataclass(frozen=True)
class Params:
    """Numeric definition of one problem instance."""

    T: int
    dt: float
    s0: tuple[float, float, float, float]  # x, y, vx, vy
    goal: tuple[float, float]
    hazard: tuple[float, float, float]  # cx, cy, R
    v_max: float
    e_max: float
    a_min: float
    a_max: float
    alpha: float
    # Path constraints (speed, hazard) apply from this step through T.
    # Default 1: skip the fixed, uncontrollable s_0; include the terminal s_T.
    constraint_start: int = 1
    # Optional deterministic warm start (length 2T). None -> zeros.
    initial_guess: tuple[float, ...] | None = None


class NLProblem:
    """Objective, standardized constraints, rollout and feasibility metrics."""

    def __init__(self, params: Params):
        self.p = params
        self.T = params.T
        self.n_vars = 2 * params.T
        # m = energy(1) + speed(T) + hazard(T)
        self.n_constraints = 2 * params.T + 1

    # --- dynamics -------------------------------------------------------------
    def rollout(self, u: np.ndarray) -> np.ndarray:
        """Forward-simulate the dynamics. Returns states S with shape (T+1, 4)."""
        u = np.asarray(u, dtype=float).reshape(self.T, 2)
        dt = self.p.dt
        S = np.empty((self.T + 1, 4), dtype=float)
        S[0] = np.asarray(self.p.s0, dtype=float)
        for t in range(self.T):
            x, y, vx, vy = S[t]
            ax, ay = u[t]
            S[t + 1] = (x + vx * dt, y + vy * dt, vx + ax * dt, vy + ay * dt)
        return S

    # --- objective ------------------------------------------------------------
    def objective(self, u: np.ndarray) -> float:
        """J = sum_{t=0}^{T-1} (x_t-x_g)^2 + (y_t-y_g)^2 + alpha*(ax_t^2+ay_t^2)."""
        u = np.asarray(u, dtype=float).reshape(self.T, 2)
        S = self.rollout(u)
        xg, yg = self.p.goal
        pos = S[: self.T, :2]  # positions t = 0 .. T-1
        track = np.sum((pos[:, 0] - xg) ** 2 + (pos[:, 1] - yg) ** 2)
        effort = self.p.alpha * np.sum(u**2)
        return float(track + effort)

    # --- constraints g(x) <= 0 ------------------------------------------------
    def constraints(self, u: np.ndarray) -> np.ndarray:
        """Standardized inequality vector g, shape (2T+1,), feasible when g <= 0."""
        u = np.asarray(u, dtype=float).reshape(self.T, 2)
        S = self.rollout(u)
        cx, cy, R = self.p.hazard
        ts = range(self.p.constraint_start, self.T + 1)

        g = np.empty(self.n_constraints, dtype=float)
        # energy
        g[0] = float(np.sum(u**2) - self.p.e_max)
        # speed (t = constraint_start .. T)
        for i, t in enumerate(ts):
            vx, vy = S[t, 2], S[t, 3]
            g[1 + i] = vx * vx + vy * vy - self.p.v_max**2
        # hazard (t = constraint_start .. T) — non-convex
        for i, t in enumerate(ts):
            x, y = S[t, 0], S[t, 1]
            g[1 + self.T + i] = R * R - (x - cx) ** 2 - (y - cy) ** 2
        return g

    def constraint_labels(self) -> list[dict[str, str]]:
        """Bilingual labels, aligned 1:1 with constraints()."""
        labels: list[dict[str, str]] = [
            {"en": "Energy budget", "fa": "بودجه انرژی"}
        ]
        for t in range(self.p.constraint_start, self.T + 1):
            labels.append({"en": f"Speed @ t={t}", "fa": f"سرعت در گام t={t}"})
        for t in range(self.p.constraint_start, self.T + 1):
            labels.append({"en": f"Hazard @ t={t}", "fa": f"مانع در گام t={t}"})
        return labels

    # --- feasibility metrics --------------------------------------------------
    def max_violation(self, u: np.ndarray) -> float:
        """Largest constraint violation; <= 0 means strictly feasible."""
        g = self.constraints(u)
        return float(max(0.0, np.max(g)))

    def is_feasible(self, u: np.ndarray, tol: float = 1e-6) -> bool:
        return self.max_violation(u) <= tol

    def num_satisfied(self, u: np.ndarray, tol: float = 1e-6) -> int:
        g = self.constraints(u)
        return int(np.sum(g <= tol))

    def num_active(self, u: np.ndarray, tol: float = 1e-4) -> int:
        """Constraints close to their boundary (|g| <= tol)."""
        g = self.constraints(u)
        return int(np.sum(np.abs(g) <= tol))

    # --- bounds / initial guess ----------------------------------------------
    def bounds(self) -> list[tuple[float, float]]:
        return [(self.p.a_min, self.p.a_max)] * self.n_vars

    def initial_guess(self) -> np.ndarray:
        if self.p.initial_guess is not None:
            u0 = np.asarray(self.p.initial_guess, dtype=float)
            if u0.shape != (self.n_vars,):
                raise ValueError(
                    f"initial_guess has length {u0.size}, expected {self.n_vars}"
                )
            return u0
        return np.zeros(self.n_vars, dtype=float)

    # --- trajectory export ----------------------------------------------------
    def trajectory(self, u: np.ndarray) -> list[dict[str, float | int | None]]:
        """Per-step state + control, length T+1. ax/ay are None at terminal t=T."""
        u = np.asarray(u, dtype=float).reshape(self.T, 2)
        S = self.rollout(u)
        out: list[dict[str, float | int | None]] = []
        for t in range(self.T + 1):
            ax: float | None = float(u[t, 0]) if t < self.T else None
            ay: float | None = float(u[t, 1]) if t < self.T else None
            out.append(
                {
                    "t": t,
                    "x": float(S[t, 0]),
                    "y": float(S[t, 1]),
                    "vx": float(S[t, 2]),
                    "vy": float(S[t, 3]),
                    "ax": ax,
                    "ay": ay,
                }
            )
        return out

"""Shared finite-difference derivatives.

Every solver and the KKT residual computation use the SAME derivative routine,
so a runtime/iteration comparison between methods is apples-to-apples. With
2T <= ~60 variables, central differences are cheap and accurate enough.

(Analytic gradients are feasible because the rollout is linear in u, but are
intentionally left out to keep one comparable derivative path for all methods.)
"""

from __future__ import annotations

from typing import Callable

import numpy as np


def grad(f: Callable[[np.ndarray], float], x: np.ndarray, eps: float = 1e-7) -> np.ndarray:
    """Central-difference gradient of a scalar function f at x."""
    x = np.asarray(x, dtype=float)
    n = x.size
    g = np.zeros(n, dtype=float)
    for i in range(n):
        step = eps * max(1.0, abs(x[i]))
        xp = x.copy()
        xm = x.copy()
        xp[i] += step
        xm[i] -= step
        g[i] = (f(xp) - f(xm)) / (2.0 * step)
    return g


def jacobian(c: Callable[[np.ndarray], np.ndarray], x: np.ndarray, eps: float = 1e-7) -> np.ndarray:
    """Central-difference Jacobian of a vector function c at x, shape (m, n)."""
    x = np.asarray(x, dtype=float)
    n = x.size
    c0 = np.asarray(c(x), dtype=float)
    m = c0.size
    J = np.zeros((m, n), dtype=float)
    for i in range(n):
        step = eps * max(1.0, abs(x[i]))
        xp = x.copy()
        xm = x.copy()
        xp[i] += step
        xm[i] -= step
        J[:, i] = (np.asarray(c(xp), dtype=float) - np.asarray(c(xm), dtype=float)) / (2.0 * step)
    return J

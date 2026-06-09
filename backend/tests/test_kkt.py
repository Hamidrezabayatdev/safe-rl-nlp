"""KKT residual tests on a known closed-form optimum."""

from __future__ import annotations

import numpy as np

from helpers import ToyProblem
from safe_rl_nlp.kkt import kkt_residuals


def test_kkt_satisfied_at_known_optimum():
    # min (v-30)^2 s.t. v<=20 -> v*=20, lambda*=20 (since 2(20-30)+lambda=0)
    p = ToyProblem()
    r = kkt_residuals(p, np.array([20.0]), np.array([20.0]))
    assert r["stationarity"] < 1e-3
    assert r["primalFeasibility"] < 1e-6
    assert r["dualFeasibility"] == 0.0
    assert r["complementarySlackness"] < 1e-3
    assert r["satisfied"] is True


def test_kkt_detects_missing_multiplier():
    # right primal point, wrong (zero) multiplier -> stationarity blows up
    p = ToyProblem()
    r = kkt_residuals(p, np.array([20.0]), np.array([0.0]))
    assert r["stationarity"] > 1.0  # |2(20-30)| = 20
    assert r["satisfied"] is False


def test_kkt_flags_negative_multiplier():
    p = ToyProblem()
    r = kkt_residuals(p, np.array([20.0]), np.array([-5.0]))
    assert r["dualFeasibility"] > 0
    assert r["satisfied"] is False

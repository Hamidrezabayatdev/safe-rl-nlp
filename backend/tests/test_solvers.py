"""Solver tests: the toy problem on every method + full result on a scenario."""

from __future__ import annotations

import numpy as np
import pytest

from helpers import ToyProblem
from safe_rl_nlp.scenarios import DETOUR
from safe_rl_nlp.solvers import augmented_lagrangian, penalty, primal_dual, sqp_slsqp

DEFAULT_SOLVERS = [augmented_lagrangian.solve, penalty.solve, sqp_slsqp.solve]
IDS = ["augmented_lagrangian", "penalty", "slsqp"]


@pytest.mark.parametrize("solve", DEFAULT_SOLVERS, ids=IDS)
def test_toy_problem_reaches_v_equals_20(solve):
    res = solve(ToyProblem())
    assert res.u_star[0] == pytest.approx(20.0, abs=1e-2)
    assert res.max_violation < 1e-3
    assert res.objective == pytest.approx(100.0, abs=1.0)


def test_primal_dual_runs_and_moves_toward_optimum():
    res = primal_dual.solve(ToyProblem())
    assert np.isfinite(res.objective)
    assert res.u_star[0] > 5.0  # climbed from 0 toward 20


@pytest.mark.parametrize("solve", DEFAULT_SOLVERS, ids=IDS)
def test_result_object_is_complete_on_detour(solve):
    prob = DETOUR.problem()
    d = solve(prob).to_contract(prob)
    for key in (
        "name", "label", "family", "success", "message", "xStar", "trajectory",
        "objective", "constraintValues", "constraintLabels", "maxViolation",
        "numSatisfied", "numActive", "iterations", "runtimeS", "convergence",
        "multipliers", "feasible", "kkt",
    ):
        assert key in d
    assert len(d["trajectory"]) == prob.T + 1
    assert len(d["constraintValues"]) == prob.n_constraints
    assert d["runtimeS"] >= 0.0
    assert len(d["convergence"]) >= 1
    assert d["iterations"] is not None  # all default solvers report iterations


def test_detour_yields_at_least_one_feasible_method():
    prob = DETOUR.problem()
    results = [s(prob) for s in DEFAULT_SOLVERS]
    assert any(r.feasible for r in results)


def test_augmented_lagrangian_solves_detour_feasibly():
    prob = DETOUR.problem()
    res = augmented_lagrangian.solve(prob)
    assert res.feasible
    assert res.multipliers is not None
    assert len(res.multipliers) == prob.n_constraints
    assert res.kkt is not None
    # detour: the trajectory must stay outside the hazard disk
    cx, cy, R = prob.p.hazard
    for pt in res.to_contract(prob)["trajectory"][1:]:
        dist2 = (pt["x"] - cx) ** 2 + (pt["y"] - cy) ** 2
        assert dist2 >= R**2 - 1e-3

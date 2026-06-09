"""Mathematical tests for the NLP definition."""

from __future__ import annotations

import numpy as np
import pytest

from safe_rl_nlp.problem import NLProblem, Params
from safe_rl_nlp.scenarios import DETOUR


def _tiny(**overrides) -> NLProblem:
    base = dict(
        T=2, dt=1.0, s0=(0.0, 0.0, 0.0, 0.0), goal=(5.0, 0.0),
        hazard=(100.0, 100.0, 1.0), v_max=100.0, e_max=100.0,
        a_min=-10.0, a_max=10.0, alpha=0.0,
    )
    base.update(overrides)
    return NLProblem(Params(**base))


def test_rollout_known_dynamics():
    p = _tiny()
    # ax=1, ay=0 at both steps
    S = p.rollout(np.array([1.0, 0.0, 1.0, 0.0]))
    assert S.shape == (3, 4)
    np.testing.assert_allclose(S[0], [0, 0, 0, 0])
    np.testing.assert_allclose(S[1], [0, 0, 1, 0])  # vx becomes 1, pos unchanged this step
    np.testing.assert_allclose(S[2], [1, 0, 2, 0])  # x moves by vx*dt = 1


def test_objective_returns_finite_number():
    p = _tiny(alpha=0.1)
    val = p.objective(np.array([1.0, 0.0, 1.0, 0.0]))
    assert np.isfinite(val)
    assert isinstance(val, float)


def test_objective_control_effort_term():
    # zero controls: pure tracking cost; positions stay at origin (vx=vy=0)
    p = _tiny(goal=(3.0, 4.0), alpha=1.0)
    j0 = p.objective(np.zeros(4))
    # positions t=0,1 both at origin -> 2 * ((0-3)^2 + (0-4)^2) = 2*25 = 50
    assert j0 == pytest.approx(50.0)


def test_constraint_count_and_labels_aligned():
    p = _tiny()
    g = p.constraints(np.zeros(4))
    assert g.size == p.n_constraints == 2 * p.T + 1
    assert len(p.constraint_labels()) == p.n_constraints


def test_energy_constraint_standardized_sign():
    p = _tiny(e_max=1.0)
    # sum(u^2) = 4 > e_max=1  ->  g[0] = 4 - 1 = 3 > 0 (violated)
    g = p.constraints(np.array([1.0, 1.0, 1.0, 1.0]))
    assert g[0] == pytest.approx(3.0)
    # zero control -> energy slack
    assert p.constraints(np.zeros(4))[0] == pytest.approx(-1.0)


def test_speed_constraint_standardized_sign():
    # large acceleration -> high speed -> speed constraint violated (g>0)
    p = _tiny(v_max=0.5)
    g = p.constraints(np.array([10.0, 0.0, 10.0, 0.0]))
    speed_block = g[1 : 1 + p.T]
    assert np.any(speed_block > 0)


def test_hazard_constraint_sign_inside_vs_outside():
    # put the hazard where the drone will be; inside -> g>0, far -> g<0
    p_inside = _tiny(hazard=(0.0, 0.0, 5.0))  # origin inside disk of radius 5
    g_inside = p_inside.constraints(np.zeros(4))
    hazard_block = g_inside[1 + p_inside.T :]
    assert np.all(hazard_block > 0)  # R^2 - 0 = 25 > 0

    p_far = _tiny(hazard=(100.0, 100.0, 1.0))
    g_far = p_far.constraints(np.zeros(4))
    assert np.all(g_far[1 + p_far.T :] < 0)


def test_feasibility_checker():
    p = _tiny(hazard=(0.0, 0.0, 5.0))  # origin is inside the hazard -> infeasible
    assert not p.is_feasible(np.zeros(4))
    assert p.max_violation(np.zeros(4)) > 0

    p_ok = _tiny()  # everything slack at zero control
    assert p_ok.is_feasible(np.zeros(4))
    assert p_ok.max_violation(np.zeros(4)) <= 0 + 1e-12


def test_bounds_and_initial_guess_shapes():
    prob = DETOUR.problem()
    assert len(prob.bounds()) == prob.n_vars
    assert prob.initial_guess().shape == (prob.n_vars,)
    lo, hi = prob.bounds()[0]
    assert lo == DETOUR.params.a_min and hi == DETOUR.params.a_max


def test_trajectory_terminal_controls_are_none():
    prob = DETOUR.problem()
    traj = prob.trajectory(prob.initial_guess())
    assert len(traj) == prob.T + 1
    assert traj[-1]["ax"] is None and traj[-1]["ay"] is None
    assert traj[0]["ax"] is not None

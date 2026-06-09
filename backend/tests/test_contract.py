"""Contract tests: emitted keys must match EXPECTED_KEYS (and thus schema.ts)."""

from __future__ import annotations

from safe_rl_nlp.contract import EXPECTED_KEYS
from safe_rl_nlp.experiment import run_scenario
from safe_rl_nlp.scenarios import DETOUR


def test_scenario_keys_match_contract():
    sc = run_scenario(DETOUR)

    assert set(sc.keys()) == EXPECTED_KEYS["scenario"]
    assert set(sc["label"].keys()) == EXPECTED_KEYS["loc"]
    assert set(sc["description"].keys()) == EXPECTED_KEYS["loc"]
    assert set(sc["problem"].keys()) == EXPECTED_KEYS["problem"]
    assert set(sc["problem"]["hazard"].keys()) == EXPECTED_KEYS["hazard"]
    assert set(sc["comparison"].keys()) == EXPECTED_KEYS["comparison"]
    assert set(sc["comparison"]["best"].keys()) == EXPECTED_KEYS["comparisonBest"]

    assert len(sc["results"]) >= 3
    for res in sc["results"]:
        assert set(res.keys()) == EXPECTED_KEYS["methodResult"]
        assert res["family"] in ("lagrangian", "sqp")
        for tp in res["trajectory"]:
            assert set(tp.keys()) == EXPECTED_KEYS["trajectoryPoint"]
        for cp in res["convergence"]:
            assert set(cp.keys()) == EXPECTED_KEYS["convergencePoint"]
        if res["multipliers"] is not None:
            for mult in res["multipliers"]:
                assert set(mult.keys()) == EXPECTED_KEYS["multiplier"]
        if res["kkt"] is not None:
            assert set(res["kkt"].keys()) == EXPECTED_KEYS["kkt"]

    for metric in sc["comparison"]["metrics"]:
        assert set(metric.keys()) == EXPECTED_KEYS["comparisonMetric"]


def test_constraint_arrays_and_multipliers_aligned():
    sc = run_scenario(DETOUR)
    n = sc["problem"]["numConstraints"]
    for res in sc["results"]:
        assert len(res["constraintValues"]) == n
        assert len(res["constraintLabels"]) == n
        if res["multipliers"] is not None:
            assert len(res["multipliers"]) == n
            for i, mult in enumerate(res["multipliers"]):
                assert mult["index"] == i
        # primal feasibility residual mirrors the reported max violation
        if res["kkt"] is not None:
            assert res["kkt"]["primalFeasibility"] == res["maxViolation"]

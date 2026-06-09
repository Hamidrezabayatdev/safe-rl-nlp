"""Integration smoke: the full experiment runs and serializes round-trip."""

from __future__ import annotations

import json

from safe_rl_nlp.contract import EXPECTED_KEYS
from safe_rl_nlp.experiment import run


def test_full_experiment_structure_and_roundtrip(tmp_path):
    data = run()

    assert set(data.keys()) == EXPECTED_KEYS["results"]
    assert set(data["meta"].keys()) == EXPECTED_KEYS["meta"]
    assert data["meta"]["schemaVersion"] == 1
    assert len(data["meta"]["methods"]) >= 3
    assert len(data["scenarios"]) == len(data["meta"]["scenarioIds"]) >= 3

    for sc in data["scenarios"]:
        assert len(sc["results"]) >= 3
        # every scenario reports a comparison with metric rows + a bilingual summary
        assert sc["comparison"]["metrics"]
        assert sc["comparison"]["summary"]["en"]
        assert sc["comparison"]["summary"]["fa"]

    # write + reload to confirm the artifact is valid JSON
    out = tmp_path / "results.json"
    out.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    reloaded = json.loads(out.read_text(encoding="utf-8"))
    assert reloaded["meta"]["schemaVersion"] == 1
    assert reloaded["scenarios"][0]["results"][0]["objective"] is not None

"""Shared data contract for results.json.

This module is the Python side of the single contract whose authority is the
zod schema at ``web/src/lib/schema.ts``. It produces the exact camelCase keys
the dashboard expects and exposes ``EXPECTED_KEYS`` so a test can assert the
two sides never drift.

Pure Python (no numpy) on purpose: the key-set test stays fast and importable
even before scientific deps are installed. Callers convert numpy arrays to
plain lists/floats before handing data here.
"""

from __future__ import annotations

from typing import Any

SCHEMA_VERSION = 1

# --- Expected key sets per object (kept in lockstep with schema.ts) -----------
EXPECTED_KEYS: dict[str, set[str]] = {
    "results": {"meta", "scenarios"},
    "meta": {
        "schemaVersion",
        "generatedAt",
        "generator",
        "feasibilityTolerance",
        "kktTolerance",
        "methods",
        "scenarioIds",
    },
    "generator": {"script", "python", "scipy", "numpy"},
    "scenario": {"id", "label", "description", "problem", "results", "comparison"},
    "loc": {"en", "fa"},
    "problem": {
        "T",
        "dt",
        "s0",
        "goal",
        "hazard",
        "vMax",
        "eMax",
        "aMin",
        "aMax",
        "alpha",
        "numVars",
        "numConstraints",
        "initialGuess",
        "bounds",
    },
    "hazard": {"cx", "cy", "R"},
    "methodResult": {
        "name",
        "label",
        "family",
        "success",
        "message",
        "xStar",
        "trajectory",
        "objective",
        "constraintValues",
        "constraintLabels",
        "maxViolation",
        "numSatisfied",
        "numActive",
        "iterations",
        "runtimeS",
        "convergence",
        "multipliers",
        "feasible",
        "kkt",
    },
    "trajectoryPoint": {"t", "x", "y", "vx", "vy", "ax", "ay"},
    "convergencePoint": {"iter", "objective", "maxViolation"},
    "multiplier": {"index", "label", "value"},
    "kkt": {
        "stationarity",
        "primalFeasibility",
        "dualFeasibility",
        "complementarySlackness",
        "satisfied",
    },
    "comparison": {"metrics", "best", "summary"},
    "comparisonMetric": {"key", "label", "values", "interpretation"},
    "comparisonBest": {"objective", "feasibility", "fastest", "fewestIterations"},
}


def loc(en: str, fa: str) -> dict[str, str]:
    """A bilingual string object."""
    return {"en": en, "fa": fa}


def collect_keysets(obj: Any) -> dict[int, set[str]]:
    """Debug helper: gather the dict-key sets present anywhere in a structure.

    Used by tests to confirm an emitted artifact only uses contracted keys.
    Returns a map keyed by an arbitrary id so callers can inspect, but the
    common use is ``set().union(*collect_keysets(obj).values())``.
    """
    found: dict[int, set[str]] = {}

    def walk(node: Any) -> None:
        if isinstance(node, dict):
            found[id(node)] = set(node.keys())
            for v in node.values():
                walk(v)
        elif isinstance(node, (list, tuple)):
            for v in node:
                walk(v)

    walk(obj)
    return found

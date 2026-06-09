"""SolveResult: what every solver returns, plus serialization to the contract.

Solvers populate the raw (numpy) fields; ``to_contract`` converts to the exact
camelCase JSON the dashboard expects (see contract.EXPECTED_KEYS / schema.ts).
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np

from .problem import NLProblem


@dataclass
class SolveResult:
    name: str
    label: dict[str, str]
    family: str  # "lagrangian" | "sqp"
    success: bool
    message: str
    u_star: np.ndarray
    objective: float
    constraint_values: np.ndarray
    max_violation: float
    num_satisfied: int
    num_active: int
    runtime_s: float
    feasible: bool
    iterations: int | None = None
    # (iter, objective, max_violation) per recorded step
    convergence: list[tuple[int, float, float]] = field(default_factory=list)
    multipliers: np.ndarray | None = None
    kkt: dict[str, float | bool] | None = None

    def to_contract(self, problem: NLProblem) -> dict:
        """Serialize to the MethodResult shape (camelCase keys)."""
        labels = problem.constraint_labels()
        multipliers = None
        if self.multipliers is not None:
            multipliers = [
                {
                    "index": int(i),
                    "label": labels[i] if i < len(labels) else {"en": f"c{i}", "fa": f"c{i}"},
                    "value": float(self.multipliers[i]),
                }
                for i in range(len(self.multipliers))
            ]
        return {
            "name": self.name,
            "label": self.label,
            "family": self.family,
            "success": bool(self.success),
            "message": self.message,
            "xStar": [float(v) for v in np.asarray(self.u_star).ravel()],
            "trajectory": problem.trajectory(self.u_star),
            "objective": float(self.objective),
            "constraintValues": [float(v) for v in np.asarray(self.constraint_values).ravel()],
            "constraintLabels": labels,
            "maxViolation": float(self.max_violation),
            "numSatisfied": int(self.num_satisfied),
            "numActive": int(self.num_active),
            "iterations": None if self.iterations is None else int(self.iterations),
            "runtimeS": float(self.runtime_s),
            "convergence": [
                {"iter": int(it), "objective": float(obj), "maxViolation": float(v)}
                for (it, obj, v) in self.convergence
            ],
            "multipliers": multipliers,
            "feasible": bool(self.feasible),
            "kkt": None if self.kkt is None else dict(self.kkt),
        }

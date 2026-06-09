"""Solver registry.

Each solver exposes ``solve(problem) -> SolveResult`` and module-level NAME/LABEL.
The default roster is Augmented Lagrangian + Quadratic Penalty (Lagrangian
family) and SLSQP (SQP). Primal-Dual is optional (off by default).
"""

from __future__ import annotations

from typing import Callable

from ..problem import NLProblem
from ..result import SolveResult
from . import augmented_lagrangian, penalty, primal_dual, sqp_slsqp

Solver = Callable[[NLProblem], SolveResult]

DEFAULT_SOLVERS: list[Solver] = [
    augmented_lagrangian.solve,
    penalty.solve,
    sqp_slsqp.solve,
]

OPTIONAL_SOLVERS: list[Solver] = [
    primal_dual.solve,
]


def get_solvers(include_optional: bool = False) -> list[Solver]:
    return DEFAULT_SOLVERS + (OPTIONAL_SOLVERS if include_optional else [])


__all__ = [
    "augmented_lagrangian",
    "penalty",
    "primal_dual",
    "sqp_slsqp",
    "DEFAULT_SOLVERS",
    "OPTIONAL_SOLVERS",
    "get_solvers",
    "Solver",
]

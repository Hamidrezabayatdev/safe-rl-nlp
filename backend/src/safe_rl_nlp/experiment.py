"""Experiment runner: solve every scenario with every solver -> results.json.

Usage:
    python -m safe_rl_nlp.experiment [--out PATH] [--optional]

By default writes to web/src/data/results.json (the dashboard's canonical
artifact). --optional also runs the primal-dual solver.
"""

from __future__ import annotations

import argparse
import json
import platform
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import scipy

from .contract import SCHEMA_VERSION, loc
from .problem import NLProblem
from .result import SolveResult
from .scenarios import SCENARIOS, Scenario
from .solvers import get_solvers

FEAS_TOL = 1e-6
KKT_TOL = 1e-2  # "approximately satisfies KKT" threshold (matches solvers.base.KKT_TOL)


def default_out_path() -> Path:
    repo_root = Path(__file__).resolve().parents[3]
    return repo_root / "web" / "src" / "data" / "results.json"


# --- formatting helpers -------------------------------------------------------
def _fmt(v: float, sig: int = 4) -> str:
    return f"{v:.{sig}g}"


def _problem_block(problem: NLProblem) -> dict:
    p = problem.p
    return {
        "T": p.T,
        "dt": p.dt,
        "s0": list(p.s0),
        "goal": {"x": p.goal[0], "y": p.goal[1]},
        "hazard": {"cx": p.hazard[0], "cy": p.hazard[1], "R": p.hazard[2]},
        "vMax": p.v_max,
        "eMax": p.e_max,
        "aMin": p.a_min,
        "aMax": p.a_max,
        "alpha": p.alpha,
        "numVars": problem.n_vars,
        "numConstraints": problem.n_constraints,
        "initialGuess": [float(v) for v in problem.initial_guess()],
        "bounds": [[lo, hi] for (lo, hi) in problem.bounds()],
    }


def _pick_winner(results: list[SolveResult], rel_tol: float = 1e-3) -> SolveResult | None:
    """Pick the overall winner.

    Feasible-first (guards the non-convex trap where an infeasible point has a
    lower objective). When several feasible methods reach essentially the same
    objective (within rel_tol), the objective is a tie and the winner is decided
    by lower max violation, then faster runtime — so a genuinely better-on-speed
    method wins instead of float noise on the objective.
    """
    if not results:
        return None
    feasible = [r for r in results if r.feasible]
    pool = feasible if feasible else results
    best_obj = min(r.objective for r in pool)
    scale = max(1.0, abs(best_obj))
    tied = [r for r in pool if (r.objective - best_obj) / scale <= rel_tol]
    # All tied methods are feasible within tolerance, so violation differences
    # below the feasibility tolerance are noise -> decide by runtime.
    return min(tied, key=lambda r: r.runtime_s)


def _build_comparison(results: list[SolveResult]) -> dict:
    names = [r.name for r in results]

    def values(fn) -> dict[str, str]:
        return {r.name: fn(r) for r in results}

    metrics = [
        {
            "key": "objective",
            "label": loc("Objective value", "مقدار تابع هدف"),
            "values": values(lambda r: _fmt(r.objective)),
            "interpretation": loc("Lower is better.", "کمتر بهتر است."),
        },
        {
            "key": "maxViolation",
            "label": loc("Max constraint violation", "بیشینه نقض قید"),
            "values": values(lambda r: _fmt(r.max_violation)),
            "interpretation": loc(
                "Near zero means the safety constraints are met.",
                "نزدیک صفر یعنی قیدهای ایمنی برقرارند.",
            ),
        },
        {
            "key": "runtime",
            "label": loc("Runtime", "زمان اجرا"),
            "values": values(lambda r: f"{r.runtime_s * 1000:.1f} ms"),
            "interpretation": loc("Lower is faster.", "کمتر یعنی سریع‌تر."),
        },
        {
            "key": "iterations",
            "label": loc("Iterations", "تعداد تکرار"),
            "values": values(lambda r: "—" if r.iterations is None else str(r.iterations)),
            "interpretation": loc(
                "Fewer iterations means faster convergence.",
                "تکرار کمتر یعنی همگرایی سریع‌تر.",
            ),
        },
        {
            "key": "feasible",
            "label": loc("Feasible?", "شدنی؟"),
            "values": values(lambda r: ("Yes" if r.feasible else "No")),
            "interpretation": loc(
                "Whether the final solution satisfies all constraints.",
                "آیا جواب نهایی همه قیدها را برآورده می‌کند.",
            ),
        },
        {
            "key": "status",
            "label": loc("Solver status", "وضعیت حل‌کننده"),
            "values": values(lambda r: ("success" if r.success else "failed")),
            "interpretation": loc("Reported solver outcome.", "نتیجه گزارش‌شده حل‌کننده."),
        },
    ]

    feasible = [r for r in results if r.feasible]
    best_obj = min(feasible, key=lambda r: r.objective).name if feasible else None
    best_feas = min(results, key=lambda r: r.max_violation).name if results else None
    fastest = min(results, key=lambda r: r.runtime_s).name if results else None
    with_iters = [r for r in results if r.iterations is not None]
    fewest_iters = min(with_iters, key=lambda r: r.iterations).name if with_iters else None

    winner = _pick_winner(results)
    if winner is not None:
        summary = {
            "en": (
                f"{winner.name} gave the best feasible result for this scenario "
                f"(objective {_fmt(winner.objective)}, max violation {_fmt(winner.max_violation)}, "
                f"{winner.runtime_s * 1000:.1f} ms)."
            ),
            "fa": (
                f"روش «{winner.label.get('fa', winner.name)}» بهترین جواب شدنی را در این سناریو داد "
                f"(هدف {_fmt(winner.objective)}، بیشینه نقض {_fmt(winner.max_violation)}، "
                f"{winner.runtime_s * 1000:.1f} میلی‌ثانیه)."
            ),
        }
    else:
        summary = loc("No results available.", "نتیجه‌ای موجود نیست.")

    return {
        "metrics": metrics,
        "best": {
            "objective": best_obj,
            "feasibility": best_feas,
            "fastest": fastest,
            "fewestIterations": fewest_iters,
        },
        "summary": summary,
    }


def run_scenario(scenario: Scenario, include_optional: bool = False) -> dict:
    problem = scenario.problem()
    raw_results: list[SolveResult] = [solve(problem) for solve in get_solvers(include_optional)]
    return {
        "id": scenario.id,
        "label": scenario.label,
        "description": scenario.description,
        "problem": _problem_block(problem),
        "results": [r.to_contract(problem) for r in raw_results],
        "comparison": _build_comparison(raw_results),
    }


def run(include_optional: bool = False) -> dict:
    scenarios = [run_scenario(s, include_optional) for s in SCENARIOS]
    method_names: list[str] = []
    for sc in scenarios:
        for r in sc["results"]:
            if r["name"] not in method_names:
                method_names.append(r["name"])
    return {
        "meta": {
            "schemaVersion": SCHEMA_VERSION,
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "generator": {
                "script": "safe_rl_nlp.experiment",
                "python": platform.python_version(),
                "scipy": scipy.__version__,
                "numpy": np.__version__,
            },
            "feasibilityTolerance": FEAS_TOL,
            "kktTolerance": KKT_TOL,
            "methods": method_names,
            "scenarioIds": [s.id for s in SCENARIOS],
        },
        "scenarios": scenarios,
    }


def write(out_path: Path, include_optional: bool = False) -> dict:
    data = run(include_optional)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    return data


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Run Safe-RL NLP experiments -> results.json")
    parser.add_argument("--out", type=Path, default=default_out_path())
    parser.add_argument("--optional", action="store_true", help="also run the primal-dual solver")
    args = parser.parse_args(argv)

    data = write(args.out, include_optional=args.optional)
    n_methods = len(data["meta"]["methods"])
    n_scen = len(data["scenarios"])
    print(f"Wrote {args.out} ({n_scen} scenarios x {n_methods} methods).")
    return 0


if __name__ == "__main__":
    sys.exit(main())

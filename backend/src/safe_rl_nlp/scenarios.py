"""Preset problem instances.

Each is tuned so a different constraint family is the interesting one:

  - detour       : hazard sits on the straight start->goal line -> forces a bow-around
  - tight_energy : energy budget is below what comfortably reaching the goal needs
  - easy         : everything slack -> near-unconstrained baseline (methods should agree)

The zero-control point (drone holds at s0) is feasible in every scenario, which
gives SLSQP and the inner solves a well-behaved starting point.
"""

from __future__ import annotations

from dataclasses import dataclass

from .problem import NLProblem, Params


@dataclass(frozen=True)
class Scenario:
    id: str
    label: dict[str, str]
    description: dict[str, str]
    params: Params

    def problem(self) -> NLProblem:
        return NLProblem(self.params)


_T = 20
_DT = 0.5

DETOUR = Scenario(
    id="detour",
    label={"en": "Detour (hazard blocks path)", "fa": "دور زدن (مانع روی مسیر)"},
    description={
        "en": "The hazard disk sits directly on the straight line from start to goal, "
        "so the drone must bow around it. The hazard-avoidance constraint is active.",
        "fa": "دیسک مانع دقیقاً روی خط مستقیم بین مبدأ و هدف قرار دارد، پس پهپاد باید از "
        "کنار آن عبور کند. قید اجتناب از مانع فعال است.",
    },
    params=Params(
        T=_T, dt=_DT,
        s0=(0.0, 0.0, 0.0, 0.0),
        goal=(10.0, 10.0),
        hazard=(5.0, 5.0, 2.0),
        v_max=4.0,
        e_max=40.0,
        a_min=-1.0, a_max=1.0,
        alpha=0.1,
    ),
)

TIGHT_ENERGY = Scenario(
    id="tight_energy",
    label={"en": "Tight energy budget", "fa": "بودجه انرژی محدود"},
    description={
        "en": "No hazard in the way, but the total control-energy budget is small, "
        "so the energy constraint binds and limits how directly the goal is reached.",
        "fa": "مانعی سر راه نیست، اما بودجه کل انرژی کنترل کم است؛ بنابراین قید انرژی "
        "فعال می‌شود و رسیدن مستقیم به هدف را محدود می‌کند.",
    },
    params=Params(
        T=_T, dt=_DT,
        s0=(0.0, 0.0, 0.0, 0.0),
        goal=(8.0, 8.0),
        hazard=(50.0, 50.0, 1.0),  # far away, irrelevant
        v_max=4.0,
        e_max=8.0,  # binds
        a_min=-1.0, a_max=1.0,
        alpha=0.05,
    ),
)

EASY = Scenario(
    id="easy",
    label={"en": "Easy baseline", "fa": "حالت ساده (مبنا)"},
    description={
        "en": "All constraints are slack: no hazard nearby, generous energy and speed "
        "limits. A near-unconstrained baseline where all methods should agree.",
        "fa": "همه قیدها شل هستند: مانعی نزدیک نیست و محدودیت انرژی و سرعت سخاوتمندانه "
        "است. یک مبنای تقریباً بدون‌قید که همه روش‌ها باید بر آن توافق کنند.",
    },
    params=Params(
        T=_T, dt=_DT,
        s0=(0.0, 0.0, 0.0, 0.0),
        goal=(10.0, 10.0),
        hazard=(50.0, 50.0, 1.0),
        v_max=100.0,
        e_max=1000.0,
        a_min=-5.0, a_max=5.0,
        alpha=0.1,
    ),
)

SCENARIOS: list[Scenario] = [DETOUR, TIGHT_ENERGY, EASY]
SCENARIO_BY_ID: dict[str, Scenario] = {s.id: s for s in SCENARIOS}

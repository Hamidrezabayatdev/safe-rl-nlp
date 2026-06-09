# Safe RL via Nonlinear Programming

A project that models a simplified **Safe Reinforcement Learning** problem —
*Safe Drone Navigation* — as a constrained **Nonlinear Program (NLP)** and solves
it two ways, then compares them numerically:

- **Lagrangian-family methods** — **Augmented Lagrangian** and **Quadratic
  Penalty**, with **KKT** analysis.
- **Sequential Quadratic Programming** — `scipy` **SLSQP**.

> This is **not** deep RL: no agent training, no neural networks. RL is the
> motivation; the technical core is constrained nonlinear optimization.

A Python solver suite emits a `results.json` artifact, and a bilingual (English /
Persian) **React + shadcn** dashboard presents the problem, math, both methods'
results, and a head-to-head comparison.

---

## Repository layout

```
backend/                     Python solver suite (numpy + scipy)
  src/safe_rl_nlp/
    problem.py               NLP: rollout, objective, standardized g(x) <= 0, metrics
    scenarios.py             detour / tight_energy / easy presets
    solvers/                 augmented_lagrangian, penalty, primal_dual, sqp_slsqp
    kkt.py                   shared KKT residuals
    contract.py              camelCase key contract (mirrors web/src/lib/schema.ts)
    experiment.py            runner -> web/src/data/results.json
  tests/                     pytest
web/                         Vite + React + TS + shadcn dashboard
  src/data/results.json      committed artifact (the dashboard's data source)
  src/lib/schema.ts          zod contract = single source of truth for the JSON
  tests/  e2e/               Vitest + Playwright
Safe_Drone_Navigation_Report.pdf   the mathematical model
```

The math model (decision variables, dynamics, objective, the four constraint
families) is documented in `Safe_Drone_Navigation_Report.pdf` and implemented in
`backend/src/safe_rl_nlp/problem.py`.

---

## Prerequisites

- **Python 3.11**
- **Node 20+** and **npm**
- A system **Google Chrome** for the Playwright E2E smoke test (Playwright's
  bundled Chromium isn't available on every OS; the config uses `channel: "chrome"`).

---

## Setup

**Backend** (from the repo root):

```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

**Frontend**:

```bash
cd web
npm install      # if peer-deps complain: npm install --legacy-peer-deps
npx playwright install chromium   # only if you want Playwright's own browser
```

---

## Run the experiments (regenerate results.json)

```bash
# from the repo root, with the venv active
PYTHONPATH=backend/src python -m safe_rl_nlp.experiment
# optional: also run the primal-dual solver
PYTHONPATH=backend/src python -m safe_rl_nlp.experiment --optional
```

This solves all 3 scenarios with all solvers and writes
`web/src/data/results.json` (objective, constraints, runtime, iterations,
convergence history, multipliers, KKT residuals, and the comparison block).

---

## Run the dashboard

```bash
cd web
npm run dev       # http://localhost:5173
npm run build     # production build (tsc + vite)
npm run preview   # serve the production build on http://localhost:4173
```

---

## Run the tests

```bash
# backend (math + solvers + KKT + contract + experiment)
cd backend && PYTHONPATH=src python -m pytest -q

# frontend unit + component tests
cd web && npm test

# frontend type-check + lint
cd web && npm run typecheck && npm run lint

# E2E smoke (builds + previews + drives system Chrome)
cd web && npm run test:e2e
```

---

## Scenarios

| id            | What binds                         | Story |
| ------------- | ---------------------------------- | ----- |
| `detour`      | Hazard-avoidance (non-convex)      | Hazard sits on the straight start→goal line, forcing a bow-around. |
| `tight_energy`| Energy budget                      | The energy cap limits how directly the goal is reached. |
| `easy`        | Nothing (slack)                    | Near-unconstrained baseline; all methods agree. |

The non-convex hazard constraint is what makes the comparison interesting (local
minima, detours). The zero-control point (drone holds position) is feasible in
every scenario, which gives the solvers a well-behaved start.

---

## Data contract

`web/src/lib/schema.ts` (zod) is the single source of truth for `results.json`.
TypeScript types are inferred from it (`web/src/types`), and the Python side
(`backend/src/safe_rl_nlp/contract.py`) mirrors the exact camelCase keys. A
pytest key-set check and a Vitest integration test both guard against drift.

---

## Manual testing guide

1. **Install dependencies** — see *Setup*. Expect no installation errors.
2. **Backend tests** — `cd backend && PYTHONPATH=src python -m pytest -q`. Expect
   all objective / constraint / Lagrangian / KKT / solver tests to pass (incl. the
   toy problem `min (v-30)^2 s.t. v<=20 -> v=20`).
3. **Frontend tests** — `cd web && npm test`. Expect components, tables, charts and
   feasibility badges to render; missing data handled gracefully.
4. **Production build** — `cd web && npm run build`. Expect no fatal TypeScript,
   lint, or bundling errors.
5. **Run the experiment** — `PYTHONPATH=backend/src python -m safe_rl_nlp.experiment`.
   Expect the Lagrangian variants and SQP to run and `results.json` to be written
   with objective, constraints, runtime, iterations and convergence history.
6. **Inspect results** — objective values numeric; constraints in standardized
   form; max violation near zero for feasible solutions; solver status clear.
7. **Open the dashboard** — `npm run dev`. Verify: Overview, Mathematical Model
   (variables/objective/constraints), Lagrangian & KKT (formulas + multipliers +
   residual badges), SQP results, and Comparison (table + non-empty charts, with
   the trajectory map bowing around the hazard). Feasibility badges match the
   violation values; the language and theme toggles work.
8. **Final sanity check** — objective correct; constraint signs correct;
   Lagrangian matches the standardized constraints; KKT clear; both methods solve
   the same NLP; comparison table complete; plots readable; conclusion supported
   by the actual numbers.

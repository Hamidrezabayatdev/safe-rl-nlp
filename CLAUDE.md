# CLAUDE.md

Safe Reinforcement Learning modeled as a constrained Nonlinear Program (Safe
Drone Navigation). Python solver suite + bilingual React/shadcn dashboard. See
`README.md` for full setup and `Safe_Drone_Navigation_Report.pdf` for the
mathematical model.

## Architecture

- **backend/** — Python (numpy + scipy). `problem.py` defines the control-only
  single-shooting NLP (decision vars = 2T accelerations; states rolled out;
  all-inequality, so only λ multipliers — no equality/μ). Solvers in
  `solvers/`: `augmented_lagrangian` (PHR, primary), `penalty`, `sqp_slsqp`
  (scipy SLSQP), optional `primal_dual`. `kkt.py` is shared by all solvers.
  `experiment.py` runs everything → `web/src/data/results.json`.
- **web/** — Vite + React 18 + TS + Tailwind v4 + shadcn-style primitives (no
  Radix). 5 tabs in `src/sections/`. Bilingual EN/FA via `src/i18n` (typed dict →
  compile-time parity), RTL flips `<html dir>`. Light/dark via `src/theme`.
  Charts = Recharts (`src/components/charts`), math = KaTeX (`src/components/math`).

## Data contract (single source of truth)

`web/src/lib/schema.ts` (zod) defines `results.json`; TS types are inferred from
it. `backend/src/safe_rl_nlp/contract.py` mirrors the exact camelCase keys.
A pytest key-set check (`test_contract.py`) and a Vitest integration test
(`tests/contract.integration.test.ts`) guard against drift. If you change the
shape, update **both** sides.

## Common commands

```bash
# regenerate the artifact (venv active)
PYTHONPATH=backend/src python -m safe_rl_nlp.experiment

# backend tests
cd backend && PYTHONPATH=src python -m pytest -q

# frontend
cd web && npm test && npm run build && npm run lint
cd web && npm run test:e2e        # Playwright via system Chrome (channel: "chrome")
```

## Gotchas

- Run the experiment / pytest with `PYTHONPATH=backend/src` (or `src` from
  `backend/`) — the package isn't pip-installed in editable mode by default.
- Playwright uses the **system Google Chrome** (`channel: "chrome"`); its bundled
  Chromium download isn't available on this OS.
- `web/src/data/results.json` is **committed** (it's a deliverable) and is what the
  dashboard renders. Re-run the experiment to refresh it.
- Math/code stay LTR inside the RTL page via the `.ltr-island` class.
- The conclusion/winner is computed from the real numbers (feasible-first, then
  near-equal objectives tie-broken by runtime) — never hardcoded.

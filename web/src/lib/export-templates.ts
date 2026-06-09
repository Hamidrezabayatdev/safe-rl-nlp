import type { Dict } from "@/i18n/en";
import { FORMULAS } from "@/lib/formulas";
import { fmt, fmtMs, loc } from "@/lib/utils";
import type { Lang, MethodResult, Scenario } from "@/types";

/** Overall winner: feasible-first, near-equal objectives tie-broken by runtime. */
export function pickWinner(scenario: Scenario, relTol = 1e-3): MethodResult | null {
  const results = scenario.results;
  if (results.length === 0) return null;
  const feasible = results.filter((r) => r.feasible);
  const pool = feasible.length ? feasible : results;
  const bestObj = Math.min(...pool.map((r) => r.objective));
  const scale = Math.max(1, Math.abs(bestObj));
  const tied = pool.filter((r) => (r.objective - bestObj) / scale <= relTol);
  return tied.reduce((a, b) => (b.runtimeS < a.runtimeS ? b : a));
}

function methodLine(m: MethodResult, lang: Lang, t: Dict): string {
  const feas = m.feasible ? t.common.feasible : t.common.infeasible;
  return `- **${loc(m.label, lang)}** — ${t.metrics.objective}: ${fmt(m.objective)}, ${t.metrics.maxViolation}: ${fmt(m.maxViolation)}, ${t.metrics.runtime}: ${fmtMs(m.runtimeS)}, ${t.metrics.iterations}: ${m.iterations ?? "—"} (${feas})`;
}

export function buildProblem(scenario: Scenario, lang: Lang, t: Dict): string {
  return [
    `## ${t.overview.problemHeading}`,
    "",
    `**${loc(scenario.label, lang)}** — ${loc(scenario.description, lang)}`,
    "",
    t.overview.scenario,
    "",
    `- **${t.overview.agent}:** ${t.overview.agentText}`,
    `- **${t.overview.state}:** ${t.overview.stateText}`,
    `- **${t.overview.action}:** ${t.overview.actionText}`,
    `- **${t.overview.objectiveLabel}:** ${t.overview.objectiveText}`,
    `- **${t.overview.safety}:** ${t.overview.safetyText}`,
    "",
    `> ${t.overview.notRl}`,
  ].join("\n");
}

export function buildFormulation(scenario: Scenario, _lang: Lang, t: Dict): string {
  const p = scenario.problem;
  return [
    `## ${t.model.title}`,
    "",
    `${t.model.objectiveHeading}:`,
    "",
    `$$${FORMULAS.objective}$$`,
    "",
    `${t.model.standardizedHeading}:`,
    "",
    `$$${FORMULAS.standardized}$$`,
    "",
    `${t.model.constraintsHeading}:`,
    "",
    `$$${FORMULAS.energy}$$`,
    `$$${FORMULAS.speed}$$`,
    `$$${FORMULAS.hazard}$$`,
    `$$${FORMULAS.bounds}$$`,
    "",
    `${t.model.setupHeading}: T = ${p.T}, dt = ${p.dt}, goal = (${p.goal.x}, ${p.goal.y}), ` +
      `hazard = (${p.hazard.cx}, ${p.hazard.cy}; R = ${p.hazard.R}), V_max = ${p.vMax}, ` +
      `E_max = ${p.eMax}, a ∈ [${p.aMin}, ${p.aMax}], α = ${p.alpha}. ` +
      `${t.model.numVars}: ${p.numVars}, ${t.model.numConstraints}: ${p.numConstraints}.`,
  ].join("\n");
}

export function buildLagrangian(scenario: Scenario, lang: Lang, t: Dict): string {
  const lag = scenario.results.filter((m) => m.family === "lagrangian");
  return [
    `## ${t.lagrangian.lagHeading}`,
    "",
    `$$${FORMULAS.lagrangian}$$`,
    "",
    `${t.lagrangian.kktHeading}:`,
    "",
    `$$${FORMULAS.kktStationarity}$$`,
    `$$${FORMULAS.kktPrimal}\\quad ${FORMULAS.kktDual}\\quad ${FORMULAS.kktComp}$$`,
    "",
    `${t.lagrangian.resultsHeading}:`,
    "",
    ...lag.map((m) => methodLine(m, lang, t)),
  ].join("\n");
}

export function buildSqp(scenario: Scenario, lang: Lang, t: Dict): string {
  const sqp = scenario.results.filter((m) => m.family === "sqp");
  return [
    `## ${t.sqp.title}`,
    "",
    t.sqp.explanation,
    "",
    `$$${FORMULAS.sqpSubproblem}$$`,
    "",
    `${t.sqp.resultsHeading}:`,
    "",
    ...sqp.map((m) => methodLine(m, lang, t)),
  ].join("\n");
}

export function buildComparison(scenario: Scenario, lang: Lang, t: Dict): string {
  const methods = scenario.results;
  const header = [t.common.method, ...methods.map((m) => loc(m.label, lang)), t.common.interpretation];
  const sep = header.map(() => "---");
  const rows = scenario.comparison.metrics.map((metric) => [
    loc(metric.label, lang),
    ...methods.map((m) => metric.values[m.name] ?? "—"),
    loc(metric.interpretation, lang),
  ]);
  const toRow = (cells: string[]) => `| ${cells.join(" | ")} |`;
  return [
    `## ${t.comparison.tableHeading}`,
    "",
    toRow(header),
    toRow(sep),
    ...rows.map(toRow),
  ].join("\n");
}

export function buildConclusion(scenario: Scenario, lang: Lang, t: Dict): string {
  const winner = pickWinner(scenario);
  const name = winner ? loc(winner.label, lang) : "—";
  const body =
    lang === "fa"
      ? `مسئله ناوبری ایمن پهپاد با الهام از یادگیری تقویتی ایمن، به‌صورت یک برنامه‌ریزی غیرخطی مقید صورت‌بندی شد. ` +
        `روش لاگرانژین از طریق ضرایب و شرایط KKT بینش مفیدی درباره نقش قیدها ارائه داد. ` +
        `روش SQP همان NLP را مستقیماً حل کرد و در برابر روش مبتنی بر لاگرانژین ارزیابی شد. ` +
        `بر پایه مقدار هدف، برآورده‌شدن قیدها، زمان اجرا، تعداد تکرار و رفتار همگرایی، روش «${name}» در این آزمایش بهتر عمل کرد. ` +
        `نتایج نشان می‌دهد بهینه‌سازی غیرخطی مقید راهی عملی برای مدل‌سازی الزامات ایمنی در مسائل ساده‌شده یادگیری تقویتی ایمن است.`
      : `The Safe RL-inspired drone-navigation problem was formulated as a constrained nonlinear programming problem. ` +
        `The Lagrangian method provided useful insight into the role of constraints through multipliers and KKT conditions. ` +
        `The SQP method solved the same NLP directly and was evaluated against the Lagrangian-based method. ` +
        `Based on objective value, constraint satisfaction, runtime, iteration count, and convergence behavior, ${name} performed better for this experiment. ` +
        `The results show that constrained nonlinear optimization is a practical way to model safety requirements in simplified Safe RL problems.`;
  return [`## ${t.comparison.conclusionHeading}`, "", body].join("\n");
}

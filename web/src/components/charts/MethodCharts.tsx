import { useLang } from "@/i18n/LanguageProvider";
import { speeds } from "@/lib/geometry";
import { loc } from "@/lib/utils";
import { useTheme } from "@/theme/ThemeProvider";
import type { MethodResult, Scenario } from "@/types";

import { ChartFrame } from "./ChartFrame";
import { LineSeriesChart, type Series } from "./LineSeriesChart";
import { methodColor } from "./colors";

function colorFor(scenario: Scenario, name: string, resolved: "light" | "dark"): string {
  const i = scenario.results.findIndex((m) => m.name === name);
  return methodColor(i < 0 ? 0 : i, resolved);
}

export function ConvergenceChart({
  scenario,
  methods,
}: {
  scenario: Scenario;
  methods: MethodResult[];
}) {
  const { t, lang } = useLang();
  const { resolved } = useTheme();
  const series: Series[] = methods
    .filter((m) => m.convergence.length > 0)
    .map((m) => ({
      name: loc(m.label, lang),
      color: colorFor(scenario, m.name, resolved),
      points: m.convergence.map((c) => ({ x: c.iter, y: c.objective })),
    }));

  return (
    <ChartFrame title={t.charts.convergence} isEmpty={series.length === 0}>
      <LineSeriesChart series={series} xLabel={t.charts.iteration} />
    </ChartFrame>
  );
}

export function ViolationChart({
  scenario,
  methods,
}: {
  scenario: Scenario;
  methods: MethodResult[];
}) {
  const { t, lang } = useLang();
  const { resolved } = useTheme();
  const series: Series[] = methods
    .filter((m) => m.convergence.length > 0)
    .map((m) => ({
      name: loc(m.label, lang),
      color: colorFor(scenario, m.name, resolved),
      // floor at 1e-10 so a log axis can render exact-zero violations
      points: m.convergence.map((c) => ({ x: c.iter, y: Math.max(c.maxViolation, 1e-10) })),
    }));

  return (
    <ChartFrame title={t.charts.violation} isEmpty={series.length === 0}>
      <LineSeriesChart series={series} xLabel={t.charts.iteration} logY />
    </ChartFrame>
  );
}

export function SpeedChart({
  scenario,
  methods,
}: {
  scenario: Scenario;
  methods: MethodResult[];
}) {
  const { t, lang } = useLang();
  const { resolved } = useTheme();
  const series: Series[] = methods
    .filter((m) => m.trajectory.length > 0)
    .map((m) => ({
      name: loc(m.label, lang),
      color: colorFor(scenario, m.name, resolved),
      points: speeds(m.trajectory).map((s, t2) => ({ x: t2, y: s })),
    }));

  return (
    <ChartFrame title={t.charts.speed} isEmpty={series.length === 0}>
      <LineSeriesChart
        series={series}
        xLabel={t.charts.time}
        yRef={{ value: scenario.problem.vMax, label: t.charts.speedLimit }}
      />
    </ChartFrame>
  );
}

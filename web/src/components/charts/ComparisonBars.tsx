import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useLang } from "@/i18n/LanguageProvider";
import { loc } from "@/lib/utils";
import { useTheme } from "@/theme/ThemeProvider";
import type { Scenario } from "@/types";

import { ChartFrame } from "./ChartFrame";
import { methodColor } from "./colors";

interface BarItem {
  name: string;
  value: number;
  color: string;
  highlight: boolean;
}

function BarMetric({ title, items }: { title: string; items: BarItem[] }) {
  return (
    <ChartFrame title={title} isEmpty={items.length === 0} aspect="aspect-[4/3]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={items} margin={{ top: 8, right: 8, bottom: 8, left: 4 }}>
          <CartesianGrid stroke="currentColor" strokeOpacity={0.15} vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "currentColor", fontSize: 10 }}
            stroke="currentColor"
            interval={0}
          />
          <YAxis tick={{ fill: "currentColor", fontSize: 11 }} stroke="currentColor" width={56} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            cursor={{ fillOpacity: 0.1 }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {items.map((it) => (
              <Cell
                key={it.name}
                fill={it.color}
                stroke={it.highlight ? "currentColor" : undefined}
                strokeWidth={it.highlight ? 2 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function ComparisonBars({ scenario }: { scenario: Scenario }) {
  const { t, lang } = useLang();
  const { resolved } = useTheme();
  const methods = scenario.results;
  const best = scenario.comparison.best;

  const items = (
    metric: (m: (typeof methods)[number]) => number,
    winner: string | null,
  ): BarItem[] =>
    methods.map((m, i) => ({
      name: loc(m.label, lang),
      value: metric(m),
      color: methodColor(i, resolved),
      highlight: winner !== null && winner === m.name,
    }));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <BarMetric title={t.charts.objectiveBars} items={items((m) => m.objective, best.objective)} />
      <BarMetric
        title={t.charts.runtimeBars}
        items={items((m) => m.runtimeS * 1000, best.fastest)}
      />
      <BarMetric
        title={t.charts.iterationBars}
        items={items((m) => m.iterations ?? 0, best.fewestIterations)}
      />
    </div>
  );
}

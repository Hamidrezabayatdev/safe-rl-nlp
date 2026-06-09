import {
  CartesianGrid,
  Legend,
  ReferenceDot,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import { useLang } from "@/i18n/LanguageProvider";
import { sampleCircle, squareDomain } from "@/lib/geometry";
import { loc } from "@/lib/utils";
import { useTheme } from "@/theme/ThemeProvider";
import type { Scenario } from "@/types";

import { ChartFrame } from "./ChartFrame";
import { GOAL_COLOR, HAZARD_COLOR, START_COLOR, methodColor } from "./colors";

const hidden = () => <g />;

export function TrajectoryMap({ scenario }: { scenario: Scenario }) {
  const { t, lang } = useLang();
  const { resolved } = useTheme();

  const methods = scenario.results;
  const { hazard, goal, s0 } = scenario.problem;

  const circle = sampleCircle(hazard.cx, hazard.cy, hazard.R);
  const allX = [goal.x, s0[0], hazard.cx - hazard.R, hazard.cx + hazard.R];
  const allY = [goal.y, s0[1], hazard.cy - hazard.R, hazard.cy + hazard.R];
  methods.forEach((m) =>
    m.trajectory.forEach((p) => {
      allX.push(p.x);
      allY.push(p.y);
    }),
  );
  const dom = squareDomain(allX, allY, 1);
  const isEmpty = methods.every((m) => m.trajectory.length === 0);

  return (
    <ChartFrame
      title={t.charts.trajectory}
      note={t.charts.trajectoryNote}
      isEmpty={isEmpty}
      aspect="aspect-square"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 12, bottom: 10, left: 0 }}>
          <CartesianGrid stroke="currentColor" strokeOpacity={0.15} />
          <XAxis
            type="number"
            dataKey="x"
            domain={dom.x}
            tick={{ fill: "currentColor", fontSize: 11 }}
            stroke="currentColor"
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={dom.y}
            tick={{ fill: "currentColor", fontSize: 11 }}
            stroke="currentColor"
          />
          <ZAxis range={[18, 18]} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} cursor={{ strokeOpacity: 0.2 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {/* hazard disk boundary (dashed ring, no point markers) */}
          <Scatter
            name={t.charts.hazard}
            data={circle}
            line={{ stroke: HAZARD_COLOR[resolved], strokeDasharray: "4 3" }}
            shape={hidden}
            fill="none"
            legendType="line"
            isAnimationActive={false}
          />
          {methods.map((m, i) => (
            <Scatter
              key={m.name}
              name={loc(m.label, lang)}
              data={m.trajectory.map((p) => ({ x: p.x, y: p.y }))}
              line={{ stroke: methodColor(i, resolved), strokeWidth: 2 }}
              fill={methodColor(i, resolved)}
              isAnimationActive={false}
            />
          ))}
          <ReferenceDot
            x={s0[0]}
            y={s0[1]}
            r={5}
            fill={START_COLOR[resolved]}
            stroke="white"
            label={{ value: t.charts.start, fontSize: 11, position: "top" }}
          />
          <ReferenceDot
            x={goal.x}
            y={goal.y}
            r={6}
            fill={GOAL_COLOR[resolved]}
            stroke="white"
            label={{ value: t.charts.goal, fontSize: 11, position: "top" }}
          />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

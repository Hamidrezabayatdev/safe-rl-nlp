import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface Series {
  name: string;
  color: string;
  points: { x: number; y: number }[];
}

/**
 * Multiple independent line series (each with its own x array) on one chart.
 * Recharts supports per-series `data`, which lets methods with different
 * iteration counts share a single numeric x-axis.
 */
export function LineSeriesChart({
  series,
  xLabel,
  logY = false,
  yRef,
}: {
  series: Series[];
  xLabel: string;
  logY?: boolean;
  yRef?: { value: number; label: string };
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart margin={{ top: 8, right: 12, bottom: 18, left: 4 }}>
        <CartesianGrid stroke="currentColor" strokeOpacity={0.15} />
        <XAxis
          type="number"
          dataKey="x"
          domain={["dataMin", "dataMax"]}
          tick={{ fill: "currentColor", fontSize: 11 }}
          stroke="currentColor"
          label={{ value: xLabel, position: "insideBottom", offset: -8, fontSize: 11 }}
        />
        <YAxis
          scale={logY ? "log" : "auto"}
          domain={logY ? ["auto", "auto"] : undefined}
          allowDataOverflow={logY}
          tick={{ fill: "currentColor", fontSize: 11 }}
          stroke="currentColor"
          width={56}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          labelFormatter={(v) => `${xLabel}: ${v}`}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {yRef ? (
          <ReferenceLine
            y={yRef.value}
            stroke="currentColor"
            strokeDasharray="5 4"
            strokeOpacity={0.6}
            label={{ value: yRef.label, fontSize: 10, position: "insideTopRight" }}
          />
        ) : null}
        {series.map((s) => (
          <Line
            key={s.name}
            type="monotone"
            data={s.points}
            dataKey="y"
            name={s.name}
            stroke={s.color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

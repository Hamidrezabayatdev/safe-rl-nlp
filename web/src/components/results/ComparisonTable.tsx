import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLang } from "@/i18n/LanguageProvider";
import { cn, loc } from "@/lib/utils";
import type { Dict } from "@/i18n/en";
import type { Scenario } from "@/types";

/** Map the backend's English value tokens to the active language. */
function localizeValue(v: string, t: Dict): string {
  const map: Record<string, string> = {
    Yes: t.common.yes,
    No: t.common.no,
    success: t.common.success,
    failed: t.common.failed,
  };
  return map[v] ?? v;
}

function winnerForKey(scenario: Scenario, key: string): string | null {
  const b = scenario.comparison.best;
  switch (key) {
    case "objective":
      return b.objective;
    case "runtime":
      return b.fastest;
    case "iterations":
      return b.fewestIterations;
    case "maxViolation":
    case "feasible":
      return b.feasibility;
    default:
      return null;
  }
}

export function ComparisonTable({ scenario }: { scenario: Scenario }) {
  const { t, lang } = useLang();
  const methods = scenario.results;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.common.method}</TableHead>
          {methods.map((m) => (
            <TableHead key={m.name} className="text-end">
              {loc(m.label, lang)}
            </TableHead>
          ))}
          <TableHead>{t.common.interpretation}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {scenario.comparison.metrics.map((metric) => {
          const winner = winnerForKey(scenario, metric.key);
          return (
            <TableRow key={metric.key}>
              <TableCell className="font-medium">{loc(metric.label, lang)}</TableCell>
              {methods.map((m) => {
                const raw = metric.values[m.name] ?? "—";
                const isWin = winner !== null && winner === m.name;
                return (
                  <TableCell
                    key={m.name}
                    className={cn("text-end", isWin && "font-semibold text-primary")}
                  >
                    <span className="ltr-island tabular-nums">
                      {localizeValue(raw, t)}
                    </span>
                  </TableCell>
                );
              })}
              <TableCell className="text-muted-foreground">
                {loc(metric.interpretation, lang)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

import { Trophy } from "lucide-react";

import { ComparisonBars } from "@/components/charts/ComparisonBars";
import { ConvergenceChart, SpeedChart, ViolationChart } from "@/components/charts/MethodCharts";
import { TrajectoryMap } from "@/components/charts/TrajectoryMap";
import { CopyBlock } from "@/components/export/CopyBlock";
import { ComparisonTable } from "@/components/results/ComparisonTable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/misc";
import { useLang } from "@/i18n/LanguageProvider";
import { useData } from "@/lib/DataProvider";
import {
  buildComparison,
  buildConclusion,
  buildFormulation,
  buildLagrangian,
  buildProblem,
  buildSqp,
  pickWinner,
} from "@/lib/export-templates";
import { methodByName } from "@/lib/results";
import { loc } from "@/lib/utils";

export function Comparison() {
  const { t, lang } = useLang();
  const { scenario } = useData();

  if (!scenario) {
    return (
      <Alert>
        <AlertTitle>{t.common.noData}</AlertTitle>
      </Alert>
    );
  }

  const best = scenario.comparison.best;
  const winner = pickWinner(scenario);

  const bestBadges: [string, string | null][] = [
    [t.comparison.bestObjective, best.objective],
    [t.comparison.bestFeasibility, best.feasibility],
    [t.comparison.fastest, best.fastest],
    [t.comparison.fewestIterations, best.fewestIterations],
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="text-xl font-bold">{t.comparison.tableHeading}</h2>
        <Card>
          <CardContent className="pt-5">
            <ComparisonTable scenario={scenario} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">{t.comparison.chartsHeading}</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <TrajectoryMap scenario={scenario} />
          <SpeedChart scenario={scenario} methods={scenario.results} />
          <ConvergenceChart scenario={scenario} methods={scenario.results} />
          <ViolationChart scenario={scenario} methods={scenario.results} />
        </div>
        <ComparisonBars scenario={scenario} />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">{t.comparison.summaryHeading}</h2>
        <Card>
          <CardContent className="space-y-4 pt-5">
            <div className="flex flex-wrap gap-2">
              {bestBadges.map(([label, name]) => {
                const m = name ? methodByName(scenario, name) : undefined;
                return (
                  <Badge key={label} variant="secondary">
                    {label}: {m ? loc(m.label, lang) : t.common.notAvailable}
                  </Badge>
                );
              })}
            </div>
            {winner ? (
              <div className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/5 p-3">
                <Trophy className="text-primary" aria-hidden="true" />
                <span className="font-semibold">{t.comparison.winner}:</span>
                <span>{loc(winner.label, lang)}</span>
              </div>
            ) : null}
            <p className="text-sm text-muted-foreground">
              {loc(scenario.comparison.summary, lang)}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">{t.comparison.conclusionHeading}</h2>
        <Card>
          <CardContent className="pt-5 text-sm leading-relaxed">
            {buildConclusion(scenario, lang, t).replace(/^##.*\n\n/, "")}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">{t.export.title}</h2>
        <p className="text-sm text-muted-foreground">{t.export.note}</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <CopyBlock title={t.export.problem} content={buildProblem(scenario, lang, t)} />
          <CopyBlock title={t.export.formulation} content={buildFormulation(scenario, lang, t)} />
          <CopyBlock title={t.export.lagrangian} content={buildLagrangian(scenario, lang, t)} />
          <CopyBlock title={t.export.sqp} content={buildSqp(scenario, lang, t)} />
          <CopyBlock title={t.export.comparison} content={buildComparison(scenario, lang, t)} />
          <CopyBlock title={t.export.conclusion} content={buildConclusion(scenario, lang, t)} />
        </div>
      </section>
    </div>
  );
}

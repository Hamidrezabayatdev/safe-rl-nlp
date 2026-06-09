import { CheckCircle2, XCircle } from "lucide-react";

import { ConvergenceChart } from "@/components/charts/MethodCharts";
import { Formula } from "@/components/math/Formula";
import { FeasibilityBadge } from "@/components/results/Badges";
import { MetricCard, MetricGrid } from "@/components/results/MetricCard";
import { SolutionVector } from "@/components/results/SolutionVector";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/misc";
import { useLang } from "@/i18n/LanguageProvider";
import { useData } from "@/lib/DataProvider";
import { FORMULAS } from "@/lib/formulas";
import { sqpResult } from "@/lib/results";
import { fmt, fmtMs } from "@/lib/utils";

export function Sqp() {
  const { t } = useLang();
  const { scenario, results } = useData();
  const feasTol = results?.meta.feasibilityTolerance ?? 1e-6;
  const sqp = scenario ? sqpResult(scenario) : undefined;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t.sqp.title}</h2>

      <Card>
        <CardHeader>
          <CardTitle>{t.sqp.explanationHeading}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">{t.sqp.explanation}</p>
          <div>
            <div className="mb-1 text-sm font-semibold">{t.sqp.qpHeading}</div>
            <Formula tex={FORMULAS.sqpSubproblem} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.sqp.solverHeading}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{t.sqp.solverNote}</CardContent>
      </Card>

      {sqp ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle>{t.sqp.resultsHeading}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={sqp.success ? "success" : "destructive"}>
                {sqp.success ? (
                  <CheckCircle2 aria-hidden="true" />
                ) : (
                  <XCircle aria-hidden="true" />
                )}
                {sqp.success ? t.common.success : t.common.failed}
              </Badge>
              <FeasibilityBadge maxViolation={sqp.maxViolation} tol={feasTol} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <MetricGrid>
              <MetricCard label={t.metrics.objective} value={fmt(sqp.objective)} />
              <MetricCard label={t.metrics.maxViolation} value={fmt(sqp.maxViolation)} />
              <MetricCard label={t.metrics.runtime} value={fmtMs(sqp.runtimeS)} />
              <MetricCard label={t.metrics.iterations} value={sqp.iterations ?? "—"} />
              <MetricCard label={t.metrics.numActive} value={sqp.numActive} />
              <MetricCard label={t.metrics.numSatisfied} value={sqp.numSatisfied} />
            </MetricGrid>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold">{t.sqp.statusHeading}</h4>
              <p className="ltr-island text-sm text-muted-foreground">{sqp.message}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-semibold">{t.sqp.solutionHeading}</h4>
              <SolutionVector x={sqp.xStar} />
            </div>

            {scenario ? <ConvergenceChart scenario={scenario} methods={[sqp]} /> : null}
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertTitle>{t.common.noData}</AlertTitle>
        </Alert>
      )}
    </div>
  );
}

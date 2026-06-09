import { ConvergenceChart, ViolationChart } from "@/components/charts/MethodCharts";
import { Formula } from "@/components/math/Formula";
import { FeasibilityBadge, KktResidualBadges } from "@/components/results/Badges";
import { MetricCard, MetricGrid } from "@/components/results/MetricCard";
import { MultiplierTable } from "@/components/results/MultiplierTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/misc";
import { useLang } from "@/i18n/LanguageProvider";
import { useData } from "@/lib/DataProvider";
import { FORMULAS } from "@/lib/formulas";
import { lagrangianVariants } from "@/lib/results";
import { fmt, fmtMs, loc } from "@/lib/utils";
import type { MethodResult } from "@/types";

function VariantCard({
  m,
  feasTol,
  kktTol,
}: {
  m: MethodResult;
  feasTol: number;
  kktTol: number;
}) {
  const { t, lang } = useLang();
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle>{loc(m.label, lang)}</CardTitle>
        <FeasibilityBadge maxViolation={m.maxViolation} tol={feasTol} />
      </CardHeader>
      <CardContent className="space-y-4">
        <MetricGrid>
          <MetricCard label={t.metrics.objective} value={fmt(m.objective)} />
          <MetricCard label={t.metrics.maxViolation} value={fmt(m.maxViolation)} />
          <MetricCard label={t.metrics.runtime} value={fmtMs(m.runtimeS)} />
          <MetricCard label={t.metrics.iterations} value={m.iterations ?? "—"} />
        </MetricGrid>

        {m.kkt ? (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">{t.lagrangian.kktResidualsHeading}</h4>
            <KktResidualBadges kkt={m.kkt} kktTol={kktTol} feasTol={feasTol} />
          </div>
        ) : null}

        <div className="space-y-2">
          <h4 className="text-sm font-semibold">{t.lagrangian.multipliersHeading}</h4>
          <MultiplierTable multipliers={m.multipliers} />
        </div>
      </CardContent>
    </Card>
  );
}

export function Lagrangian() {
  const { t } = useLang();
  const { scenario, results } = useData();
  const feasTol = results?.meta.feasibilityTolerance ?? 1e-6;
  const kktTol = results?.meta.kktTolerance ?? 1e-2;
  const variants = scenario ? lagrangianVariants(scenario) : [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t.lagrangian.title}</h2>

      <Card>
        <CardHeader>
          <CardTitle>{t.lagrangian.lagHeading}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Formula tex={FORMULAS.lagrangian} />
          <p className="text-sm text-muted-foreground">{t.lagrangian.lagNote}</p>
          <Alert>
            <AlertTitle>{t.lagrangian.noEquality}</AlertTitle>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.lagrangian.kktHeading}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {[
            [t.lagrangian.stationarity, FORMULAS.kktStationarity, t.lagrangian.stationarityNote],
            [t.lagrangian.primal, FORMULAS.kktPrimal, t.lagrangian.primalNote],
            [t.lagrangian.dual, FORMULAS.kktDual, t.lagrangian.dualNote],
            [t.lagrangian.comp, FORMULAS.kktComp, t.lagrangian.compNote],
          ].map(([title, tex, note]) => (
            <div key={title} className="rounded-md border p-3">
              <div className="mb-1 text-sm font-semibold">{title}</div>
              <Formula tex={tex} />
              <p className="text-sm text-muted-foreground">{note}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t.lagrangian.methodsHeading}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border p-3">
            <div className="mb-1 text-sm font-semibold">{t.lagrangian.augTitle}</div>
            <Formula tex={FORMULAS.augmented} />
            <Formula tex={FORMULAS.augmentedUpdate} />
            <p className="text-sm text-muted-foreground">{t.lagrangian.augNote}</p>
          </div>
          <div className="rounded-md border p-3">
            <div className="mb-1 text-sm font-semibold">{t.lagrangian.penTitle}</div>
            <Formula tex={FORMULAS.penalty} />
            <p className="text-sm text-muted-foreground">{t.lagrangian.penNote}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold">{t.lagrangian.resultsHeading}</h3>
        {variants.length === 0 ? (
          <Alert>
            <AlertTitle>{t.common.noData}</AlertTitle>
          </Alert>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              {variants.map((m) => (
                <VariantCard key={m.name} m={m} feasTol={feasTol} kktTol={kktTol} />
              ))}
            </div>
            {scenario ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <ConvergenceChart scenario={scenario} methods={variants} />
                <ViolationChart scenario={scenario} methods={variants} />
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}

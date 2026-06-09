import { Formula, Inline } from "@/components/math/Formula";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLang } from "@/i18n/LanguageProvider";
import { useData } from "@/lib/DataProvider";
import { FORMULAS } from "@/lib/formulas";

function FormulaCard({
  title,
  tex,
  note,
}: {
  title: string;
  tex: string;
  note?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Formula tex={tex} />
        {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
      </CardContent>
    </Card>
  );
}

export function Model() {
  const { t } = useLang();
  const { scenario } = useData();
  const p = scenario?.problem;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">{t.model.title}</h2>

      <Card>
        <CardHeader>
          <CardTitle>{t.model.variablesHeading}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.model.varSymbol}</TableHead>
                <TableHead>{t.model.varMeaning}</TableHead>
                <TableHead>{t.model.varDim}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Inline tex="a_{x,t}" /></TableCell>
                <TableCell>{t.model.axMeaning}</TableCell>
                <TableCell><Inline tex="t = 0,\dots,T-1" /></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Inline tex="a_{y,t}" /></TableCell>
                <TableCell>{t.model.ayMeaning}</TableCell>
                <TableCell><Inline tex="t = 0,\dots,T-1" /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="text-sm text-muted-foreground">{t.model.variablesNote}</p>
          <Formula tex={FORMULAS.decisionVector} />
        </CardContent>
      </Card>

      <FormulaCard
        title={t.model.stateHeading}
        tex={FORMULAS.dynamics}
        note={t.model.stateNote}
      />

      <FormulaCard
        title={t.model.objectiveHeading}
        tex={FORMULAS.objective}
        note={t.model.objectiveNote}
      />

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">{t.model.constraintsHeading}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <FormulaCard title={t.model.energy} tex={FORMULAS.energy} note={t.model.energyNote} />
          <FormulaCard title={t.model.speed} tex={FORMULAS.speed} note={t.model.speedNote} />
          <FormulaCard title={t.model.hazard} tex={FORMULAS.hazard} note={t.model.hazardNote} />
          <FormulaCard title={t.model.bounds} tex={FORMULAS.bounds} note={t.model.boundsNote} />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>{t.model.standardizedHeading}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Formula tex={FORMULAS.standardized} />
          <p className="text-sm text-muted-foreground">{t.model.standardizedNote}</p>
        </CardContent>
      </Card>

      {p ? (
        <Card>
          <CardHeader>
            <CardTitle>{t.model.setupHeading}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {[
                [t.model.horizon, String(p.T)],
                [t.model.timestep, String(p.dt)],
                [t.model.numVars, String(p.numVars)],
                [t.model.numConstraints, String(p.numConstraints)],
                ["E_max", String(p.eMax)],
                ["V_max", String(p.vMax)],
                ["α", String(p.alpha)],
                ["goal", `(${p.goal.x}, ${p.goal.y})`],
                ["hazard", `(${p.hazard.cx}, ${p.hazard.cy}; R=${p.hazard.R})`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-md border p-2">
                  <dt className="text-xs text-muted-foreground">{k}</dt>
                  <dd className="ltr-island font-semibold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-sm text-muted-foreground">{t.model.initialGuessNote}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t.model.assumptionsHeading}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{t.model.assumptions}</CardContent>
      </Card>
    </div>
  );
}

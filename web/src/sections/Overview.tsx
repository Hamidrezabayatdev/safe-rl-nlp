import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle } from "@/components/ui/misc";
import { useLang } from "@/i18n/LanguageProvider";

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{body}</CardContent>
    </Card>
  );
}

export function Overview() {
  const { t } = useLang();
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-xl font-bold">{t.overview.title}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoCard title={t.overview.goalHeading} body={t.overview.goal} />
          <InfoCard title={t.overview.motivationHeading} body={t.overview.motivation} />
          <InfoCard title={t.overview.approachHeading} body={t.overview.approach} />
          <InfoCard title={t.overview.methodsHeading} body={t.overview.methods} />
          <InfoCard title={t.overview.nonlinearHeading} body={t.overview.nonlinear} />
        </div>
        <Alert>
          <AlertTitle>{t.overview.notRl}</AlertTitle>
        </Alert>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">{t.overview.problemHeading}</h2>
        <Card>
          <CardHeader>
            <CardTitle>{t.overview.scenarioHeading}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{t.overview.scenario}</p>
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                [t.overview.agent, t.overview.agentText],
                [t.overview.state, t.overview.stateText],
                [t.overview.action, t.overview.actionText],
                [t.overview.objectiveLabel, t.overview.objectiveText],
                [t.overview.safety, t.overview.safetyText],
              ].map(([dt, dd]) => (
                <div key={dt} className="rounded-md border p-3">
                  <dt className="text-sm font-semibold">{dt}</dt>
                  <dd className="text-sm text-muted-foreground">{dd}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

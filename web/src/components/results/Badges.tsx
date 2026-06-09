import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { useLang } from "@/i18n/LanguageProvider";
import { feasibilityState, kktResidualState } from "@/lib/feasibility";
import { fmt } from "@/lib/utils";
import type { Kkt } from "@/types";

export function FeasibilityBadge({
  maxViolation,
  tol,
}: {
  maxViolation: number;
  tol: number;
}) {
  const { t } = useLang();
  const state = feasibilityState(maxViolation, tol);
  const title = `${t.metrics.maxViolation}: ${fmt(maxViolation)}`;

  if (state === "bad") {
    return (
      <Badge variant="destructive" title={title}>
        <XCircle aria-hidden="true" />
        {t.common.infeasible}
      </Badge>
    );
  }
  return (
    <Badge variant={state === "good" ? "success" : "warning"} title={title}>
      {state === "good" ? (
        <CheckCircle2 aria-hidden="true" />
      ) : (
        <AlertTriangle aria-hidden="true" />
      )}
      {t.common.feasible}
    </Badge>
  );
}

const STATE_VARIANT = {
  good: "success",
  marginal: "warning",
  bad: "destructive",
} as const;

export function KktResidualBadges({
  kkt,
  kktTol,
  feasTol,
}: {
  kkt: Kkt;
  kktTol: number;
  feasTol: number;
}) {
  const { t } = useLang();
  const items = [
    { label: t.lagrangian.stationarity, value: kkt.stationarity, tol: kktTol },
    { label: t.lagrangian.primal, value: kkt.primalFeasibility, tol: feasTol },
    { label: t.lagrangian.dual, value: kkt.dualFeasibility, tol: kktTol },
    { label: t.lagrangian.comp, value: kkt.complementarySlackness, tol: kktTol },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <Badge key={it.label} variant={STATE_VARIANT[kktResidualState(it.value, it.tol)]}>
          {it.label}: <span className="ltr-island">{fmt(it.value)}</span>
        </Badge>
      ))}
    </div>
  );
}

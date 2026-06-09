import { useId } from "react";

import { NativeSelect } from "@/components/ui/select";
import { useLang } from "@/i18n/LanguageProvider";
import { useData } from "@/lib/DataProvider";
import { loc } from "@/lib/utils";

export function ScenarioSwitcher() {
  const { results, scenarioId, setScenarioId } = useData();
  const { t, lang } = useLang();
  const id = useId();

  if (!results || results.scenarios.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-sm text-muted-foreground">
        {t.header.scenario}
      </label>
      <NativeSelect
        id={id}
        value={scenarioId ?? ""}
        onChange={(e) => setScenarioId(e.target.value)}
      >
        {results.scenarios.map((s) => (
          <option key={s.id} value={s.id}>
            {loc(s.label, lang)}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}

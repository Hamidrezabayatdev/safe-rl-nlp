import type { ReactNode } from "react";

import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

/** Consistent chart wrapper: title, fixed aspect (no CLS), and an empty-state. */
export function ChartFrame({
  title,
  note,
  isEmpty = false,
  aspect = "aspect-[16/10]",
  children,
}: {
  title: string;
  note?: string;
  isEmpty?: boolean;
  aspect?: string;
  children: ReactNode;
}) {
  const { t } = useLang();
  return (
    <figure className="rounded-lg border bg-card p-3">
      <figcaption className="mb-2">
        <div className="text-sm font-semibold">{title}</div>
        {note ? <div className="text-xs text-muted-foreground">{note}</div> : null}
      </figcaption>
      {isEmpty ? (
        <div className="flex aspect-[16/10] items-center justify-center text-sm text-muted-foreground">
          {t.charts.empty}
        </div>
      ) : (
        <div className={cn("w-full text-muted-foreground", aspect)}>{children}</div>
      )}
    </figure>
  );
}

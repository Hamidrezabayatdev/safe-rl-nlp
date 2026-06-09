import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLang } from "@/i18n/LanguageProvider";
import { fmt, loc } from "@/lib/utils";
import type { Multiplier } from "@/types";

export function MultiplierTable({ multipliers }: { multipliers: Multiplier[] | null }) {
  const { t, lang } = useLang();

  if (!multipliers) {
    return <p className="text-sm text-muted-foreground">{t.common.notAvailable}</p>;
  }
  const active = multipliers.filter((m) => Math.abs(m.value) > 1e-8);
  if (active.length === 0) {
    return <p className="text-sm text-muted-foreground">{t.lagrangian.multipliersNote}</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>#</TableHead>
          <TableHead>{t.common.constraint}</TableHead>
          <TableHead className="text-end">λ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {active.map((m) => (
          <TableRow key={m.index}>
            <TableCell className="tabular-nums text-muted-foreground">{m.index}</TableCell>
            <TableCell>{loc(m.label, lang)}</TableCell>
            <TableCell className="text-end">
              <span className="ltr-island tabular-nums">{fmt(m.value)}</span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

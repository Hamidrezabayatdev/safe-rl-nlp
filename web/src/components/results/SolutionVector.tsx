import { fmt } from "@/lib/utils";

export function SolutionVector({ x, max = 8 }: { x: number[]; max?: number }) {
  const shown = x.slice(0, max);
  const more = x.length > max ? ", …" : "";
  return (
    <code className="ltr-island block overflow-x-auto rounded-md bg-muted p-2 text-xs tabular-nums">
      [{shown.map((v) => fmt(v)).join(", ")}
      {more}]
    </code>
  );
}

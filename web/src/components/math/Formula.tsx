import { BlockMath, InlineMath } from "react-katex";

import { cn } from "@/lib/utils";

/** Block formula. Always LTR, even inside an RTL page. */
export function Formula({ tex, className }: { tex: string; className?: string }) {
  return (
    <div className={cn("ltr-island overflow-x-auto py-1 text-start", className)}>
      <BlockMath math={tex} />
    </div>
  );
}

/** Inline formula island. */
export function Inline({ tex }: { tex: string }) {
  return (
    <span className="ltr-island">
      <InlineMath math={tex} />
    </span>
  );
}

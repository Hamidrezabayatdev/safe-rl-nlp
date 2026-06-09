import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLang } from "@/i18n/LanguageProvider";

export function CopyBlock({ title, content }: { title: string; content: string }) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
        <CardTitle className="text-sm">{title}</CardTitle>
        <Button variant="outline" size="sm" onClick={onCopy} aria-live="polite">
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? t.common.copied : t.common.copy}
        </Button>
      </CardHeader>
      <CardContent>
        <pre className="ltr-island max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs leading-relaxed">
          {content}
        </pre>
      </CardContent>
    </Card>
  );
}

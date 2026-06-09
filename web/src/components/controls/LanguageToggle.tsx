import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageProvider";

export function LanguageToggle() {
  const { lang, toggle, t } = useLang();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      aria-label={t.header.language}
      title={t.header.language}
    >
      <Languages aria-hidden="true" />
      <span>{lang === "en" ? "فارسی" : "English"}</span>
    </Button>
  );
}

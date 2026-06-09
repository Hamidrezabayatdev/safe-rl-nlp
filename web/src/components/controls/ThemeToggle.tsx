import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLang } from "@/i18n/LanguageProvider";
import { useTheme } from "@/theme/ThemeProvider";

const ORDER = ["light", "dark", "system"] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useLang();

  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  const label =
    theme === "light" ? t.header.light : theme === "dark" ? t.header.dark : t.header.system;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(next)}
      aria-label={`${t.header.theme}: ${label}`}
      title={`${t.header.theme}: ${label}`}
    >
      <Icon aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

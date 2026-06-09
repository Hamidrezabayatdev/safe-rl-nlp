import { LanguageToggle } from "@/components/controls/LanguageToggle";
import { ScenarioSwitcher } from "@/components/controls/ScenarioSwitcher";
import { ThemeToggle } from "@/components/controls/ThemeToggle";
import { useLang } from "@/i18n/LanguageProvider";

export function Header() {
  const { t } = useLang();
  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-bold leading-tight">{t.meta.title}</h1>
          <p className="text-sm text-muted-foreground">{t.meta.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ScenarioSwitcher />
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

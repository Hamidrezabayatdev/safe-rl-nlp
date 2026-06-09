import { createContext, useContext, useEffect, useMemo } from "react";
import type { ReactNode } from "react";

import { useLocalStorage } from "@/lib/hooks";
import type { Lang } from "@/types";

import { en, type Dict } from "./en";
import { fa } from "./fa";

const DICTS: Record<Lang, Dict> = { en, fa };

interface LanguageContextValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  t: Dict;
  setLang: (lang: Lang) => void;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useLocalStorage<Lang>("srl-lang", "en");
  const dir: "ltr" | "rtl" = lang === "fa" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      dir,
      t: DICTS[lang],
      setLang,
      toggle: () => setLang(lang === "en" ? "fa" : "en"),
    }),
    [lang, dir, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}

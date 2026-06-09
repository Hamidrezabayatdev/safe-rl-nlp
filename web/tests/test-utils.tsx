import { render } from "@testing-library/react";
import type { ReactElement } from "react";

import { LanguageProvider } from "@/i18n/LanguageProvider";
import { DataProvider } from "@/lib/DataProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";

/** Render a tree wrapped in all app providers, with an optional raw artifact. */
export function renderWithProviders(ui: ReactElement, raw?: unknown) {
  return render(
    <ThemeProvider>
      <LanguageProvider>
        <DataProvider raw={raw}>{ui}</DataProvider>
      </LanguageProvider>
    </ThemeProvider>,
  );
}

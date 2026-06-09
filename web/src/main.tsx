import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "@/App";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { DataProvider } from "@/lib/DataProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";

import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

createRoot(rootEl).render(
  <StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </LanguageProvider>
    </ThemeProvider>
  </StrictMode>,
);

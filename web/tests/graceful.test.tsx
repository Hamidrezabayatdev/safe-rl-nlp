import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { App } from "@/App";
import sample from "@/data/results.sample.json";
import { en } from "@/i18n/en";

import { renderWithProviders } from "./test-utils";

describe("graceful degradation", () => {
  it("shows an error banner but still renders the header on a malformed artifact", () => {
    renderWithProviders(<App />, { totally: "invalid" });
    // header still renders
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(en.meta.title);
    // an error alert is shown
    expect(screen.getAllByText(en.common.noData).length).toBeGreaterThan(0);
  });

  it("renders chart empty-states when a method has no history/trajectory", async () => {
    // strip convergence + trajectory from every method
    const stripped = {
      ...sample,
      scenarios: sample.scenarios.map((s) => ({
        ...s,
        results: s.results.map((m) => ({ ...m, convergence: [], trajectory: [] })),
      })),
    };
    renderWithProviders(<App />, stripped);
    await userEvent.click(screen.getByRole("tab", { name: en.nav.comparison }));
    expect((await screen.findAllByText(en.charts.empty)).length).toBeGreaterThan(0);
  });
});

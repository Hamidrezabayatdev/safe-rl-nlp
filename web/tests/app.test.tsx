import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { App } from "@/App";
import { en } from "@/i18n/en";
import { fa } from "@/i18n/fa";

import { renderWithProviders } from "./test-utils";

const renderApp = () => renderWithProviders(<App />);

describe("App shell", () => {
  it("renders the title and exactly five tabs", () => {
    renderApp();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(en.meta.title);
    expect(screen.getAllByRole("tab")).toHaveLength(5);
    for (const name of Object.values(en.nav)) {
      expect(screen.getByRole("tab", { name })).toBeInTheDocument();
    }
  });

  it("shows the Overview with the 'not deep RL' callout", async () => {
    renderApp();
    expect(await screen.findByText(en.overview.notRl)).toBeInTheDocument();
  });

  it("renders the Mathematical Model with KaTeX", async () => {
    renderApp();
    await userEvent.click(screen.getByRole("tab", { name: en.nav.model }));
    expect(await screen.findByText(en.model.variablesHeading)).toBeInTheDocument();
    expect(document.querySelector(".katex")).toBeTruthy();
  });

  it("renders the Lagrangian & KKT results", async () => {
    renderApp();
    await userEvent.click(screen.getByRole("tab", { name: en.nav.lagrangian }));
    expect(await screen.findByText(en.lagrangian.kktHeading)).toBeInTheDocument();
    expect(screen.getAllByText(en.lagrangian.multipliersHeading).length).toBeGreaterThan(0);
  });

  it("renders SQP results with a solver-status badge", async () => {
    renderApp();
    await userEvent.click(screen.getByRole("tab", { name: en.nav.sqp }));
    expect(await screen.findByText(en.sqp.statusHeading)).toBeInTheDocument();
  });

  it("renders the comparison table, chart frames and export blocks", async () => {
    renderApp();
    await userEvent.click(screen.getByRole("tab", { name: en.nav.comparison }));
    // comparison metric table populated from real data
    expect(await screen.findByText(en.metrics.objective)).toBeInTheDocument();
    // chart frames render their titles
    expect(screen.getByText(en.charts.trajectory)).toBeInTheDocument();
    expect(screen.getByText(en.charts.convergence)).toBeInTheDocument();
    // export blocks present
    expect(screen.getByText(en.export.conclusion)).toBeInTheDocument();
  });

  it("toggles language to Persian, flipping text and direction", async () => {
    renderApp();
    await userEvent.click(screen.getByRole("button", { name: en.header.language }));
    expect(document.documentElement.dir).toBe("rtl");
    expect(document.documentElement.lang).toBe("fa");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(fa.meta.title);
  });

  it("toggles the theme to dark", async () => {
    renderApp();
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    await userEvent.click(screen.getByRole("button", { name: new RegExp(en.header.theme) }));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("offers all three scenarios in the switcher", () => {
    renderApp();
    const select = screen.getByLabelText(en.header.scenario) as HTMLSelectElement;
    expect(select.options.length).toBe(3);
  });

  it("has a skip link to the main content", () => {
    renderApp();
    expect(screen.getByRole("link", { name: en.header.skipToContent })).toHaveAttribute(
      "href",
      "#main",
    );
  });
});

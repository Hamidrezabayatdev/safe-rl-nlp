import { expect, test } from "@playwright/test";

test("loads with the title and five tabs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("tab")).toHaveCount(5);
});

test("every tab is clickable and shows its panel", async ({ page }) => {
  await page.goto("/");
  for (const name of ["Mathematical Model", "Lagrangian & KKT", "SQP", "Comparison & Export"]) {
    await page.getByRole("tab", { name }).click();
    await expect(page.getByRole("tabpanel")).toBeVisible();
  }
});

test("charts render non-empty SVG on the comparison tab", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("tab", { name: "Comparison & Export" }).click();
  await expect(page.locator("svg.recharts-surface").first()).toBeVisible();
  await expect(page.locator("svg.recharts-surface path").first()).toBeVisible();
});

test("language toggle switches the document to RTL", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Language" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
});

test("theme toggle switches to dark", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Theme/ }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("copy button writes the export to the clipboard", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("tab", { name: "Comparison & Export" }).click();
  const copy = page.getByRole("button", { name: /Copy/ }).first();
  await copy.click();
  await expect(page.getByRole("button", { name: /Copied/ }).first()).toBeVisible();
});

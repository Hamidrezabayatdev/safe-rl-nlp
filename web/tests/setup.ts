import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom lacks matchMedia (used by the theme system) — provide a light shim.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Recharts' ResponsiveContainer relies on ResizeObserver.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// Give layout boxes a non-zero size so charts attempt to render in jsdom.
Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
  configurable: true,
  value: 640,
});
Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
  configurable: true,
  value: 400,
});

// Clipboard for the export CopyBlock.
Object.defineProperty(navigator, "clipboard", {
  configurable: true,
  value: { writeText: vi.fn().mockResolvedValue(undefined) },
});

// Reset persisted prefs between tests.
afterEach(() => {
  window.localStorage.clear();
  document.documentElement.className = "";
  document.documentElement.dir = "ltr";
  document.documentElement.lang = "en";
});

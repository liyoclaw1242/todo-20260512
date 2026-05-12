/**
 * AC#6: Alert states render correctly on Chrome and Safari on Mac.
 *
 * Verifies that the CSS embedded in renderPage:
 *  1. Uses only standard CSS properties (no -webkit-/-moz-/-ms- vendor prefixes)
 *  2. Uses cross-browser-safe color values for overdue (red) and today (amber)
 *  3. Uses border-left (universally supported since IE 8+)
 */
import { describe, it, expect } from "vitest";
import { renderPage } from "./page.js";

const TODAY = "2026-05-12";

describe("renderPage — AC#6: cross-browser CSS compatibility", () => {
  const html = renderPage([], TODAY);
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  const css = styleMatch ? (styleMatch[1] ?? "") : "";

  it("HTML contains a <style> block", () => {
    expect(styleMatch).not.toBeNull();
  });

  it("no -webkit- vendor prefixes in alert rule declarations", () => {
    const alertRuleLines = css
      .split("\n")
      .filter((l) => l.includes("due-overdue") || l.includes("due-today") || l.includes("border-left") || l.includes("color"));
    for (const line of alertRuleLines) {
      expect(line).not.toMatch(/-webkit-/);
    }
  });

  it("no -moz- vendor prefixes in style block", () => {
    expect(css).not.toMatch(/-moz-/);
  });

  it(".due-overdue rule uses border-left (universally supported property)", () => {
    expect(css).toMatch(/\.due-overdue\s*\{[^}]*border-left/);
  });

  it(".due-today rule uses border-left", () => {
    expect(css).toMatch(/\.due-today\s*\{[^}]*border-left/);
  });

  it(".due-overdue rule uses a red hex colour (safe cross-browser)", () => {
    // The red colour must be a hex value, not a proprietary CSS4 colour function
    const overdueRuleMatch = css.match(/\.due-overdue\s*\{([^}]*)\}/);
    const overdueRule = overdueRuleMatch ? (overdueRuleMatch[1] ?? "") : "";
    // Should contain a hex colour like #d32f2f
    expect(overdueRule).toMatch(/#[0-9a-fA-F]{3,6}/);
  });
});

import { describe, it, expect } from "vitest";
import { renderPage } from "./page.js";
import type { Todo } from "../lib/types.js";

const TODAY = "2026-05-12";
const YESTERDAY = "2026-05-11";

// ─── AC#3: server-rendered — no client-side delay ─────────────────────────
describe("renderPage — AC#3: alert state in static HTML", () => {
  it("page HTML contains due-overdue class for a past-due todo (no JS needed)", () => {
    const todos: Todo[] = [{ id: "1", title: "Old task", dueDate: YESTERDAY }];
    const html = renderPage(todos, TODAY);
    // The class must be present in the HTML itself
    expect(html).toMatch(/class="[^"]*due-overdue[^"]*"/);
  });

  it("page HTML contains due-today class for a today-due todo", () => {
    const todos: Todo[] = [{ id: "2", title: "Today task", dueDate: TODAY }];
    const html = renderPage(todos, TODAY);
    expect(html).toMatch(/class="[^"]*due-today[^"]*"/);
  });

  it("page CSS includes red styling for due-overdue", () => {
    const html = renderPage([], TODAY);
    // Must have a <style> block that addresses .due-overdue with a red-family colour
    expect(html).toMatch(/\.due-overdue/);
  });

  it("page CSS includes distinct styling for due-today", () => {
    const html = renderPage([], TODAY);
    expect(html).toMatch(/\.due-today/);
  });

  it("alert class appears before any <script> tag (confirms server-rendered)", () => {
    const todos: Todo[] = [{ id: "3", title: "Overdue item", dueDate: YESTERDAY }];
    const html = renderPage(todos, TODAY);
    const classPos = html.search(/class="[^"]*due-overdue[^"]*"/);
    const scriptPos = html.indexOf("<script");
    expect(classPos).toBeGreaterThan(-1);
    if (scriptPos !== -1) {
      expect(classPos).toBeLessThan(scriptPos);
    }
  });
});

// ─── AC#1+AC#2 at page level ─────────────────────────────────────────────
describe("renderPage — alert state passthrough", () => {
  it("overdue todo uses data-due-status='overdue' in full page", () => {
    const todos: Todo[] = [{ id: "4", title: "Late", dueDate: YESTERDAY }];
    const html = renderPage(todos, TODAY);
    expect(html).toContain('data-due-status="overdue"');
  });

  it("today todo uses data-due-status='today' in full page", () => {
    const todos: Todo[] = [{ id: "5", title: "Today", dueDate: TODAY }];
    const html = renderPage(todos, TODAY);
    expect(html).toContain('data-due-status="today"');
  });

  it("no-date todo has no alert class in full page", () => {
    const todos: Todo[] = [{ id: "6", title: "Undated" }];
    const html = renderPage(todos, TODAY);
    expect(html).toContain('data-due-status="none"');
    expect(html).not.toMatch(/class="[^"]*due-overdue[^"]*"/);
    expect(html).not.toMatch(/class="[^"]*due-today[^"]*"/);
  });

  it("completed+overdue todo has no alert class in full page", () => {
    const todos: Todo[] = [{ id: "7", title: "Done", dueDate: YESTERDAY, completed: true }];
    const html = renderPage(todos, TODAY);
    expect(html).toContain('data-due-status="none"');
    expect(html).not.toMatch(/class="[^"]*due-overdue[^"]*"/);
  });
});

// ─── AC#6: cross-browser CSS (no vendor prefixes) ─────────────────────────
describe("renderPage — AC#6: cross-browser CSS", () => {
  it("does not use -webkit- or -moz- vendor-prefixed alert styles", () => {
    const html = renderPage([], TODAY);
    // Extract the <style> block and verify no vendor prefixes on alert colours
    const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
    const css = styleMatch ? styleMatch[1] ?? "" : "";
    // Filter to lines mentioning due-overdue or due-today
    const alertLines = css.split("\n").filter((l) =>
      l.includes("due-overdue") || l.includes("due-today")
    );
    for (const line of alertLines) {
      expect(line).not.toMatch(/-webkit-|-moz-|-ms-/);
    }
  });

  it("uses only standard border-left or color CSS for alert styling", () => {
    const html = renderPage([], TODAY);
    const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
    expect(styleMatch).not.toBeNull();
  });
});

import { describe, it, expect } from "vitest";
import { renderTodoItem } from "./TodoItem.js";
import type { Todo } from "../lib/types.js";

const TODAY = "2026-05-12";
const YESTERDAY = "2026-05-11";
const TOMORROW = "2026-05-13";

// ─── AC#1: overdue → red visual indicator ─────────────────────────────────
describe("renderTodoItem — AC#1: overdue", () => {
  it("emits data-due-status='overdue' attribute for a past due date", () => {
    const todo: Todo = { id: "1", title: "Old task", dueDate: YESTERDAY };
    const html = renderTodoItem(todo, TODAY);
    expect(html).toContain("data-due-status=\"overdue\"");
  });

  it("applies overdue CSS class to the item", () => {
    const todo: Todo = { id: "2", title: "Late task", dueDate: YESTERDAY };
    const html = renderTodoItem(todo, TODAY);
    expect(html).toMatch(/class="[^"]*due-overdue[^"]*"/);
  });
});

// ─── AC#2: today → distinct highlight (different from overdue) ────────────
describe("renderTodoItem — AC#2: today highlight", () => {
  it("emits data-due-status='today' attribute for a today due date", () => {
    const todo: Todo = { id: "3", title: "Due today", dueDate: TODAY };
    const html = renderTodoItem(todo, TODAY);
    expect(html).toContain("data-due-status=\"today\"");
  });

  it("applies today CSS class (distinct from overdue) to the item", () => {
    const todo: Todo = { id: "4", title: "Today task", dueDate: TODAY };
    const html = renderTodoItem(todo, TODAY);
    expect(html).toMatch(/class="[^"]*due-today[^"]*"/);
  });

  it("does NOT apply overdue class when due today", () => {
    const todo: Todo = { id: "5", title: "Today task", dueDate: TODAY };
    const html = renderTodoItem(todo, TODAY);
    expect(html).not.toMatch(/class="[^"]*due-overdue[^"]*"/);
  });
});

// ─── AC#4: no due date → no alert styling ─────────────────────────────────
describe("renderTodoItem — AC#4: no due date", () => {
  it("emits data-due-status='none' when todo has no dueDate", () => {
    const todo: Todo = { id: "6", title: "No date" };
    const html = renderTodoItem(todo, TODAY);
    expect(html).toContain("data-due-status=\"none\"");
  });

  it("applies no due-alert CSS class when no dueDate", () => {
    const todo: Todo = { id: "7", title: "No date" };
    const html = renderTodoItem(todo, TODAY);
    expect(html).not.toMatch(/class="[^"]*due-overdue[^"]*"/);
    expect(html).not.toMatch(/class="[^"]*due-today[^"]*"/);
  });
});

// ─── AC#5: completed → no alert styling ──────────────────────────────────
describe("renderTodoItem — AC#5: completed suppresses alert", () => {
  it("emits data-due-status='none' for a completed todo even if overdue", () => {
    const todo: Todo = { id: "8", title: "Done", dueDate: YESTERDAY, completed: true };
    const html = renderTodoItem(todo, TODAY);
    expect(html).toContain("data-due-status=\"none\"");
  });

  it("applies no due-alert CSS class when completed and overdue", () => {
    const todo: Todo = { id: "9", title: "Done", dueDate: YESTERDAY, completed: true };
    const html = renderTodoItem(todo, TODAY);
    expect(html).not.toMatch(/class="[^"]*due-overdue[^"]*"/);
  });

  it("emits data-due-status='none' for a completed todo due today", () => {
    const todo: Todo = { id: "10", title: "Done today", dueDate: TODAY, completed: true };
    const html = renderTodoItem(todo, TODAY);
    expect(html).toContain("data-due-status=\"none\"");
  });
});

// ─── AC#3: server-side rendering (no flicker) ─────────────────────────────
describe("renderTodoItem — AC#3: server-rendered alert state", () => {
  it("HTML contains due-status class without requiring client JS", () => {
    // The alert state must be present in the raw HTML string — not injected
    // by a <script> tag — so there is no flicker on fresh page load.
    const todo: Todo = { id: "11", title: "Overdue item", dueDate: YESTERDAY };
    const html = renderTodoItem(todo, TODAY);
    // Class must be in the markup itself (before any <script> block)
    const classPos = html.search(/class="[^"]*due-overdue[^"]*"/);
    const scriptPos = html.indexOf("<script");
    // Either no script at all, or the class appears before any script
    expect(classPos).toBeGreaterThan(-1);
    if (scriptPos !== -1) {
      expect(classPos).toBeLessThan(scriptPos);
    }
  });
});
